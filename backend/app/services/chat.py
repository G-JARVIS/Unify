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

        vector_score = 0.0
        try:
            from app.services.embedding import generate_embedding

            profile_vector = _extract_vector(profile.capabilities)
            if not profile_vector:
                text_parts = _flatten_text_values(profile.capabilities)
                profile_vector = generate_embedding(" ".join(text_parts) if text_parts else profile.company_name)
            opp_vector = generate_embedding(
                " ".join([opportunity.title, opportunity.description, opportunity.sector, opportunity.organization])
            )
            dot = sum(a * b for a, b in zip(profile_vector, opp_vector))
            norm = math.sqrt(sum(a * a for a in profile_vector)) * math.sqrt(sum(b * b for b in opp_vector))
            if norm:
                vector_score = _normalize_vector_score(dot / norm)
        except Exception:
            vector_score = 0.0  # embeddings unavailable: fall back to keyword overlap only

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


GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MAX_TOOL_ROUNDS = 3
MAX_HISTORY_MESSAGES = 20


def _sse(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, default=str)}\n\n"


def _text_event(text: str) -> str:
    return _sse({"delta": text, "done": False, "type": "text"})


def _run_tool(db: Session, current_user: User, name: str, args: dict[str, Any]) -> dict[str, Any]:
    try:
        if name == "search_opportunities":
            return _exec_search_opportunities(db, args)
        if name == "explain_match":
            return _exec_explain_match(db, current_user, args)
        if name == "get_contract_status":
            return _exec_get_contract_status(db, current_user, args)
        if name == "platform_help":
            return _exec_platform_help(args)
        return {"error": f"Unknown tool: {name}"}
    except Exception as exc:
        db.rollback()
        return {"error": f"Tool execution failed: {exc}"}


def _friendly_error(exc: Exception) -> str:
    text = str(exc)
    status = getattr(exc, "status_code", None)
    if status == 401 or "invalid_api_key" in text:
        return "The Groq API key is invalid. Please check GROQ_API_KEY in backend/.env."
    if status == 429:
        return "The AI service is rate-limited right now. Please try again in a moment."
    if status == 404 or "model_not_found" in text:
        return "The configured Groq model was not found. Please check GROQ_MODEL in backend/.env."
    return f"Error connecting to AI service: {text}"


def stream_chat_response(
    db: Session,
    current_user: User,
    messages: list[dict[str, Any]],
) -> Generator[str, None, None]:
    """Stream a Groq chat completion (with tool use) as SSE events.

    Each yield is a complete ``data: <json>\\n\\n`` line, ending with ``data: [DONE]``.
    """
    from app.core.config import get_settings
    from openai import OpenAI

    settings = get_settings()
    if not settings.groq_api_key:
        yield _text_event("Groq API key is not configured. Please add GROQ_API_KEY to your .env file.")
        yield "data: [DONE]\n\n"
        return

    client = OpenAI(api_key=settings.groq_api_key, base_url=GROQ_BASE_URL, max_retries=2, timeout=60.0)
    model = settings.groq_model

    conversation: list[dict[str, Any]] = [
        {"role": "system", "content": build_system_prompt(current_user)},
        *messages[-MAX_HISTORY_MESSAGES:],
    ]

    use_tools = True
    round_no = 0
    while True:
        round_no += 1
        offer_tools = use_tools and round_no <= MAX_TOOL_ROUNDS
        kwargs: dict[str, Any] = {"model": model, "messages": conversation, "stream": True, "temperature": 0.3}
        if offer_tools:
            kwargs["tools"] = CHAT_TOOLS
            kwargs["tool_choice"] = "auto"

        content = ""
        tool_calls_acc: dict[int, dict[str, Any]] = {}
        try:
            stream = client.chat.completions.create(**kwargs)
            for chunk in stream:
                choice = chunk.choices[0] if chunk.choices else None
                if choice is None:
                    continue
                delta = choice.delta
                if delta.content:
                    content += delta.content
                    yield _text_event(delta.content)
                for tc in delta.tool_calls or []:
                    slot = tool_calls_acc.setdefault(
                        tc.index, {"id": "", "type": "function", "function": {"name": "", "arguments": ""}}
                    )
                    if tc.id:
                        slot["id"] = tc.id
                    if tc.function:
                        if tc.function.name:
                            slot["function"]["name"] += tc.function.name
                        if tc.function.arguments:
                            slot["function"]["arguments"] += tc.function.arguments
        except Exception as exc:
            # Models occasionally emit malformed tool calls (Groq 400
            # "tool_use_failed"). Retry once without tools so the user still gets an answer.
            if offer_tools and not content and getattr(exc, "status_code", None) == 400:
                use_tools = False
                continue
            yield _text_event(_friendly_error(exc))
            break

        calls = [tc for _, tc in sorted(tool_calls_acc.items()) if tc["function"]["name"]]
        if not calls:
            break

        for n, tc in enumerate(calls):
            tc["id"] = tc["id"] or f"call_{round_no}_{n}"

        yield _sse({"delta": "", "done": False, "type": "tool_start", "tools": [tc["function"]["name"] for tc in calls]})
        conversation.append({"role": "assistant", "content": content or None, "tool_calls": calls})

        for tc in calls:
            name = tc["function"]["name"]
            try:
                args = json.loads(tc["function"]["arguments"] or "{}")
                if not isinstance(args, dict):
                    args = {}
            except json.JSONDecodeError:
                args = {}
            result = _run_tool(db, current_user, name, args)
            yield _sse({"delta": "", "done": False, "type": "tool_result", "tool_name": name, "result": result})
            conversation.append({"role": "tool", "tool_call_id": tc["id"], "content": json.dumps(result, default=str)})

    yield "data: [DONE]\n\n"
