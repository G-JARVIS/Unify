from __future__ import annotations

import json
import uuid
from typing import Any, Generator

from sqlalchemy import or_
from sqlmodel import Session, select

from app.db.models import Contract, Milestone, MSMEProfile, Opportunity, User, UserRole


# ---------------------------------------------------------------------------
# Tool schemas exposed to the LLM
# ---------------------------------------------------------------------------

CHAT_TOOLS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "search_opportunities",
            "description": (
                "Search for procurement opportunities on the UNIFY platform. "
                "Use this when the user asks about finding tenders, contracts, "
                "supply-chain openings, or collaboration opportunities."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Free-text search query (e.g. 'solar energy contracts in Maharashtra').",
                    },
                    "sector": {
                        "type": "string",
                        "description": "Optional sector filter (e.g. 'Energy', 'Healthcare').",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results to return (1–10). Default 5.",
                        "default": 5,
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "explain_match",
            "description": (
                "Explain why a specific opportunity is (or is not) a good match "
                "for the current MSME user. Returns COMS score breakdown, "
                "vector similarity, and capability overlap tags. "
                "Use this when the user asks 'why am I ranked here?' or "
                "'how well do I match this opportunity?'."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "opportunity_id": {
                        "type": "string",
                        "description": "UUID of the opportunity to explain.",
                    },
                },
                "required": ["opportunity_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_contract_status",
            "description": (
                "Retrieve the current status and milestone progress of a contract. "
                "Use this when the user asks about a specific contract, its stage, "
                "or which milestones are pending/completed."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "contract_id": {
                        "type": "string",
                        "description": "UUID of the contract.",
                    },
                },
                "required": ["contract_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "platform_help",
            "description": (
                "Answer platform help and FAQ questions about UNIFY, such as "
                "how matching works, what COMS/VRA means, subscription tiers, "
                "how to apply for an opportunity, or how mediation works."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": (
                            "Help topic. One of: coms_matching, vra_fairness, "
                            "subscriptions, how_to_apply, mediation, contracts, "
                            "digital_maturity, general."
                        ),
                    },
                },
                "required": ["topic"],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Tool executors
# ---------------------------------------------------------------------------

def _exec_search_opportunities(
    db: Session, args: dict[str, Any]
) -> dict[str, Any]:
    query: str = args.get("query", "")
    sector: str | None = args.get("sector")
    limit: int = min(int(args.get("limit", 5)), 10)

    stmt = select(Opportunity)
    if sector:
        stmt = stmt.where(Opportunity.sector.ilike(f"%{sector.strip()}%"))
    if query:
        pattern = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                Opportunity.title.ilike(pattern),
                Opportunity.description.ilike(pattern),
                Opportunity.organization.ilike(pattern),
                Opportunity.sector.ilike(pattern),
            )
        )
    stmt = stmt.order_by(Opportunity.deadline.asc()).limit(limit)
    results = db.exec(stmt).all()

    if not results:
        return {"found": 0, "opportunities": [], "message": "No matching opportunities found."}

    return {
        "found": len(results),
        "opportunities": [
            {
                "id": str(opp.id),
                "title": opp.title,
                "organization": opp.organization,
                "sector": opp.sector,
                "type": opp.type.value,
                "deadline": str(opp.deadline),
                "is_verified": opp.is_verified,
                "budget_min": float(opp.budget_min) if opp.budget_min else None,
                "budget_max": float(opp.budget_max) if opp.budget_max else None,
            }
            for opp in results
        ],
    }


def _exec_explain_match(
    db: Session, current_user: User, args: dict[str, Any]
) -> dict[str, Any]:
    opp_id_str: str = args.get("opportunity_id", "")
    try:
        opp_id = uuid.UUID(opp_id_str)
    except ValueError:
        return {"error": f"Invalid opportunity ID: {opp_id_str}"}

    opportunity = db.get(Opportunity, opp_id)
    if not opportunity:
        return {"error": f"Opportunity {opp_id_str} not found."}

    # Get MSME profile for the current user
    profile = None
    if current_user.role == UserRole.MSME:
        profile = db.exec(
            select(MSMEProfile).where(MSMEProfile.user_id == current_user.id)
        ).one_or_none()

    if not profile:
        return {
            "opportunity_title": opportunity.title,
            "message": "No MSME profile found. Please complete your profile to see match scores.",
        }

    # Run COMS matching inline for a single opportunity
    try:
        from app.services.matching import (
            _capability_overlap_score,
            _extract_vector,
            _flatten_text_values,
            _normalize_vector_score,
        )
        import math

        vector = _extract_vector(profile.capabilities)
        vector_score = 0.0
        if not vector:
            text_parts = _flatten_text_values(profile.capabilities)
            search_text = " ".join(text_parts) if text_parts else profile.company_name
            try:
                from app.services.embedding import generate_embedding
                vector = generate_embedding(search_text)
            except Exception:
                pass

        capability_score, capability_tags = _capability_overlap_score(profile, opportunity)
        coms_score = round((0.7 * vector_score) + (0.3 * capability_score), 4)

        return {
            "opportunity_id": str(opportunity.id),
            "opportunity_title": opportunity.title,
            "organization": opportunity.organization,
            "sector": opportunity.sector,
            "your_company": profile.company_name,
            "coms_score": coms_score,
            "vector_similarity": round(vector_score, 4),
            "capability_overlap": round(capability_score, 4),
            "fairness_score": profile.fairness_score,
            "matched_capability_tags": capability_tags,
            "explanation": (
                f"Your COMS score of {coms_score:.2%} is computed as "
                f"70% semantic similarity ({vector_score:.2%}) + "
                f"30% capability overlap ({capability_score:.2%}). "
                + (f"Matched capabilities: {', '.join(capability_tags)}." if capability_tags else "No direct capability keywords matched.")
            ),
        }
    except Exception as exc:
        return {"error": f"Could not compute match score: {exc}"}


def _exec_get_contract_status(
    db: Session, current_user: User, args: dict[str, Any]
) -> dict[str, Any]:
    contract_id_str: str = args.get("contract_id", "")
    try:
        contract_id = uuid.UUID(contract_id_str)
    except ValueError:
        return {"error": f"Invalid contract ID: {contract_id_str}"}

    contract = db.get(Contract, contract_id)
    if not contract:
        return {"error": f"Contract {contract_id_str} not found."}

    # Enforce ownership: MSME can only see their own contracts
    if current_user.role == UserRole.MSME:
        profile = db.exec(
            select(MSMEProfile).where(MSMEProfile.user_id == current_user.id)
        ).one_or_none()
        if not profile or contract.msme_id != profile.id:
            return {"error": "You do not have permission to view this contract."}

    milestones = db.exec(
        select(Milestone).where(Milestone.contract_id == contract.id)
    ).all()

    completed = sum(1 for m in milestones if m.is_completed)
    total = len(milestones)

    return {
        "contract_id": str(contract.id),
        "status": contract.status.value,
        "agreed_amount": float(contract.agreed_amount),
        "milestones_total": total,
        "milestones_completed": completed,
        "milestones_pending": total - completed,
        "milestone_details": [
            {
                "title": m.title,
                "payout_percentage": m.payout_percentage,
                "is_completed": m.is_completed,
                "due_date": str(m.due_date),
            }
            for m in milestones
        ],
        "summary": (
            f"Contract is currently **{contract.status.value}**. "
            f"{completed}/{total} milestones completed. "
            f"Agreed amount: ₹{contract.agreed_amount:,.2f}."
        ),
    }


_HELP_CONTENT: dict[str, str] = {
    "coms_matching": (
        "**COMS (Capability-Opportunity Matching Score)** uses a hybrid scoring formula:\n"
        "- 70% vector similarity: Sentence-BERT (768-dim) embeddings compare your capability "
        "  profile to opportunity descriptions via Pinecone similarity search.\n"
        "- 30% capability overlap: keyword intersection between your profile and the opportunity.\n"
        "Final COMS score ranges from 0 to 1. Higher is better."
    ),
    "vra_fairness": (
        "**VRA (Visibility Rebalancing Algorithm)** ensures smaller MSMEs aren't buried:\n"
        "VRA_Score = 0.75 × COMS + 0.25 × Discovery_Weight\n"
        "Discovery_Weight is higher for MSMEs that haven't received recent opportunity exposure, "
        "preventing monopoly patterns measured by the OCI (Opportunity Concentration Index)."
    ),
    "subscriptions": (
        "UNIFY offers three subscription tiers:\n"
        "- **Basic** ₹999/month: Up to 10 opportunity searches/day, 5 COMS matches/month.\n"
        "- **Intermediate** ₹2,999/month: Unlimited searches, 50 matches/month, contract management.\n"
        "- **Expert** ₹7,999/month: Everything + AI chatbot, mediation access, analytics."
    ),
    "how_to_apply": (
        "To apply for an opportunity:\n"
        "1. Go to **Opportunities** in the sidebar.\n"
        "2. Search or browse, then click on an opportunity.\n"
        "3. Click **Apply** and fill out the application form.\n"
        "4. Your application will be reviewed and a contract may be created."
    ),
    "mediation": (
        "**Mediation** is UNIFY's dispute resolution service:\n"
        "- Available for active contracts that enter a **DISPUTED** status.\n"
        "- An AI mediation agent reviews milestone history and chat logs.\n"
        "- Platform admins are notified and can intervene.\n"
        "- Access Mediation from the sidebar under the same name."
    ),
    "contracts": (
        "**Contracts** on UNIFY go through these stages:\n"
        "UNDER_REVIEW → VERIFIED → ESCROW_PENDING → ACTIVE → COMPLETED (or DISPUTED)\n"
        "- Only ADMINs and CONSULTANTs can change contract status.\n"
        "- MSMEs can mark milestones complete once the contract is ACTIVE."
    ),
    "digital_maturity": (
        "**Digital Maturity Score** (0–100) reflects how complete and rich your MSME profile is:\n"
        "- Upload capability vectors (automatic from profile parsing).\n"
        "- Add Udyam/GST registration.\n"
        "- Complete your capability tags.\n"
        "A higher score improves your COMS matches."
    ),
    "general": (
        "**UNIFY** is an AI-powered B2B procurement intelligence platform for MSMEs.\n"
        "Key features:\n"
        "- Semantic opportunity search and matching (COMS)\n"
        "- Algorithmic fairness engine (VRA + OCI)\n"
        "- Contract lifecycle management\n"
        "- Mediation and dispute support\n"
        "Ask me about any specific feature for more detail!"
    ),
}


def _exec_platform_help(args: dict[str, Any]) -> dict[str, Any]:
    topic: str = args.get("topic", "general").lower()
    content = _HELP_CONTENT.get(topic, _HELP_CONTENT["general"])
    return {"topic": topic, "content": content}


# ---------------------------------------------------------------------------
# Main streaming generator
# ---------------------------------------------------------------------------

def build_system_prompt(current_user: User) -> str:
    role_context = {
        UserRole.MSME: "You are talking to an MSME business owner on the UNIFY platform.",
        UserRole.ADMIN: "You are talking to a UNIFY platform administrator.",
        UserRole.CONSULTANT: "You are talking to a consultant who helps MSMEs on UNIFY.",
        UserRole.VENDOR: "You are talking to a vendor/supplier on the UNIFY platform.",
    }.get(current_user.role, "You are talking to a UNIFY platform user.")

    return (
        "You are UNIFY Assistant, a helpful AI assistant embedded in the UNIFY platform. "
        f"{role_context} "
        "You help users understand opportunities, their match scores, contract status, and how the platform works. "
        "Always be concise and professional. Use markdown formatting for structured answers. "
        "When the user asks about opportunities, matches, contracts, or platform features, "
        "use the available tools to fetch real data instead of making things up. "
        "If you don't know something, say so honestly."
    )


def stream_chat_response(
    db: Session,
    current_user: User,
    messages: list[dict[str, Any]],
) -> Generator[str, None, None]:
    """
    Stream chat response as SSE events. Each yield is a complete SSE data line.
    Yields: 'data: <json>\\n\\n' events, ending with 'data: [DONE]\\n\\n'
    """
    from app.core.config import get_settings
    from openai import OpenAI

    settings = get_settings()
    if not settings.gemini_api_key:
        yield f"data: {json.dumps({'delta': 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.', 'done': False, 'type': 'text'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    client = OpenAI(
        api_key=settings.gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    system_message = {"role": "system", "content": build_system_prompt(current_user)}
    full_messages = [system_message] + messages

    # First API call (may trigger tool use)
    try:
        response = client.chat.completions.create(
            model="gemini-3.8-flash",
            messages=full_messages,  # type: ignore[arg-type]
            tools=CHAT_TOOLS,  # type: ignore[arg-type]
            tool_choice="auto",
            stream=True,
        )
    except Exception as exc:
        yield f"data: {json.dumps({'delta': f'Error connecting to AI service: {exc}', 'done': False, 'type': 'text'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    # Stream first response, collecting tool calls
    accumulated_content = ""
    tool_calls_acc: dict[int, dict[str, Any]] = {}
    finish_reason = None

    for chunk in response:
        choice = chunk.choices[0] if chunk.choices else None
        if not choice:
            continue

        finish_reason = choice.finish_reason
        delta = choice.delta

        # Stream text tokens
        if delta.content:
            accumulated_content += delta.content
            yield f"data: {json.dumps({'delta': delta.content, 'done': False, 'type': 'text'})}\n\n"

        # Accumulate tool call deltas
        if delta.tool_calls:
            for tc_delta in delta.tool_calls:
                idx = tc_delta.index
                if idx not in tool_calls_acc:
                    tool_calls_acc[idx] = {
                        "id": "",
                        "type": "function",
                        "function": {"name": "", "arguments": ""},
                    }
                if tc_delta.id:
                    tool_calls_acc[idx]["id"] += tc_delta.id
                if tc_delta.function:
                    if tc_delta.function.name:
                        tool_calls_acc[idx]["function"]["name"] += tc_delta.function.name
                    if tc_delta.function.arguments:
                        tool_calls_acc[idx]["function"]["arguments"] += tc_delta.function.arguments

    # If tool calls were requested, execute them
    if finish_reason == "tool_calls" and tool_calls_acc:
        tool_calls_list = list(tool_calls_acc.values())

        # Notify the client that tool calls are being made
        tool_names = [tc["function"]["name"] for tc in tool_calls_list]
        yield f"data: {json.dumps({'delta': '', 'done': False, 'type': 'tool_start', 'tools': tool_names})}\n\n"

        # Build the assistant message with tool_calls
        tool_messages: list[dict[str, Any]] = [
            {
                "role": "assistant",
                "content": accumulated_content or None,
                "tool_calls": [
                    {
                        "id": tc["id"],
                        "type": "function",
                        "function": {
                            "name": tc["function"]["name"],
                            "arguments": tc["function"]["arguments"],
                        },
                    }
                    for tc in tool_calls_list
                ],
            }
        ]

        # Execute each tool and collect results
        tool_result_messages: list[dict[str, Any]] = []
        for tc in tool_calls_list:
            fn_name = tc["function"]["name"]
            try:
                fn_args = json.loads(tc["function"]["arguments"] or "{}")
            except json.JSONDecodeError:
                fn_args = {}

            try:
                if fn_name == "search_opportunities":
                    result = _exec_search_opportunities(db, fn_args)
                elif fn_name == "explain_match":
                    result = _exec_explain_match(db, current_user, fn_args)
                elif fn_name == "get_contract_status":
                    result = _exec_get_contract_status(db, current_user, fn_args)
                elif fn_name == "platform_help":
                    result = _exec_platform_help(fn_args)
                else:
                    result = {"error": f"Unknown tool: {fn_name}"}
            except Exception as exc:
                result = {"error": f"Tool execution failed: {exc}"}

            # Stream structured tool result to client
            yield f"data: {json.dumps({'delta': '', 'done': False, 'type': 'tool_result', 'tool_name': fn_name, 'result': result})}\n\n"

            tool_result_messages.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "content": json.dumps(result),
            })

        # Second API call: get the final assistant response given tool results
        second_messages = full_messages + tool_messages + tool_result_messages  # type: ignore[operator]
        try:
            second_response = client.chat.completions.create(
                model="gemini-3.8-flash",
                messages=second_messages,  # type: ignore[arg-type]
                stream=True,
            )
            for chunk in second_response:
                choice = chunk.choices[0] if chunk.choices else None
                if not choice:
                    continue
                if choice.delta.content:
                    yield f"data: {json.dumps({'delta': choice.delta.content, 'done': False, 'type': 'text'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'delta': f'Error generating final response: {exc}', 'done': False, 'type': 'text'})}\n\n"

    yield "data: [DONE]\n\n"
