from __future__ import annotations

import math
import uuid
from collections.abc import Iterable
from typing import Any

from sqlmodel import Session, select

from app.db.models import MSMEProfile, Opportunity
from app.services.vector_store import query_similar_opportunities


def _extract_vector(capabilities: dict[str, Any]) -> list[float] | None:
    vector_keys = ("embedding", "vector", "capability_vector")
    for key in vector_keys:
        value = capabilities.get(key)
        if isinstance(value, list) and value and all(isinstance(item, (int, float)) for item in value):
            return [float(item) for item in value]
    return None


def _flatten_text_values(value: Any) -> list[str]:
    values: list[str] = []
    if isinstance(value, str):
        stripped = value.strip()
        if stripped:
            values.append(stripped)
        return values

    if isinstance(value, dict):
        for nested in value.values():
            values.extend(_flatten_text_values(nested))
        return values

    if isinstance(value, Iterable) and not isinstance(value, (bytes, bytearray)):
        for nested in value:
            values.extend(_flatten_text_values(nested))
        return values

    return values


def _tokenize(text: str) -> set[str]:
    return {token for token in text.lower().replace("/", " ").replace("-", " ").split() if token}


def _capability_overlap_score(profile: MSMEProfile, opportunity: Opportunity) -> tuple[float, list[str]]:
    capability_values = _flatten_text_values(profile.capabilities)
    profile_tokens: set[str] = set()
    for value in capability_values:
        profile_tokens.update(_tokenize(value))

    opportunity_text = " ".join(
        [opportunity.title, opportunity.description, opportunity.sector, opportunity.organization]
    )
    opportunity_tokens = _tokenize(opportunity_text)

    if not profile_tokens or not opportunity_tokens:
        return 0.0, []

    overlap = profile_tokens.intersection(opportunity_tokens)
    overlap_score = len(overlap) / max(len(profile_tokens), 1)
    tags = [f"capability:{token}" for token in sorted(overlap)[:5]]
    return overlap_score, tags


def _normalize_vector_score(raw_score: float | None) -> float:
    if raw_score is None:
        return 0.0
    if -1.0 <= raw_score <= 1.0:
        return (raw_score + 1.0) / 2.0
    if 0.0 <= raw_score <= 1.0:
        return raw_score
    return max(0.0, min(raw_score, 1.0))


def _build_pinecone_filter(filter_dict: dict[str, Any] | None) -> dict[str, Any] | None:
    if not filter_dict:
        return None

    pinecone_filter: dict[str, Any] = {}
    if "sector" in filter_dict and filter_dict["sector"]:
        sectors = filter_dict["sector"]
        if isinstance(sectors, list):
            pinecone_filter["sector"] = {"$in": sectors}
        elif isinstance(sectors, str):
            pinecone_filter["sector"] = {"$eq": sectors}

    if "is_verified" in filter_dict and isinstance(filter_dict["is_verified"], bool):
        pinecone_filter["is_verified"] = {"$eq": filter_dict["is_verified"]}

    return pinecone_filter or None


def get_coms_matches(
    db: Session,
    msme_id: uuid.UUID,
    top_k: int = 5,
    filter_dict: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Return ranked opportunities using Pinecone similarity + capability overlap."""
    profile = db.get(MSMEProfile, msme_id)
    if profile is None:
        raise LookupError("MSME profile not found")

    vector = _extract_vector(profile.capabilities)
    if not vector:
        raise ValueError("MSME profile capabilities do not include a valid embedding vector")

    pinecone_filter = _build_pinecone_filter(filter_dict)
    vector_matches = query_similar_opportunities(vector=vector, top_k=top_k, filter_dict=pinecone_filter)
    if not vector_matches:
        return []

    id_to_score: dict[uuid.UUID, float] = {}
    ordered_ids: list[uuid.UUID] = []
    for match in vector_matches:
        raw_id = match.get("id")
        if not raw_id:
            continue
        try:
            opportunity_id = uuid.UUID(str(raw_id))
        except ValueError:
            continue

        if opportunity_id not in id_to_score:
            ordered_ids.append(opportunity_id)
        id_to_score[opportunity_id] = float(match.get("score") or 0.0)

    if not ordered_ids:
        return []

    opportunities = db.exec(select(Opportunity).where(Opportunity.id.in_(ordered_ids))).all()
    opportunities_by_id = {opportunity.id: opportunity for opportunity in opportunities}

    recommendations: list[dict[str, Any]] = []
    for opportunity_id in ordered_ids:
        opportunity = opportunities_by_id.get(opportunity_id)
        if opportunity is None:
            continue

        vector_score = _normalize_vector_score(id_to_score.get(opportunity_id))
        capability_score, capability_tags = _capability_overlap_score(profile, opportunity)
        coms_score = (0.7 * vector_score) + (0.3 * capability_score)

        recommendations.append(
            {
                "opportunity_id": str(opportunity.id),
                "title": opportunity.title,
                "organization": opportunity.organization,
                "sector": opportunity.sector,
                "opportunity_type": opportunity.type.value,
                "vector_similarity": round(vector_score, 4),
                "capability_overlap": round(capability_score, 4),
                "coms_score": round(coms_score, 4),
                "explainability_tags": [
                    f"vector_similarity:{round(vector_score, 3)}",
                    *capability_tags,
                ],
            }
        )

    recommendations.sort(key=lambda item: item["coms_score"], reverse=True)
    return recommendations[:top_k]
