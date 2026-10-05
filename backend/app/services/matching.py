from __future__ import annotations

import math
import uuid
from collections.abc import Iterable
from typing import Any

from sqlalchemy import or_
from sqlmodel import Session, select

from app.db.models import MSMEProfile, Opportunity
from app.services.vector_store import pinecone_configured, query_similar_opportunities


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


_STOPWORDS = frozenset({"and", "or", "the", "for", "with", "of", "in", "to", "a", "an", "on", "at", "by", "&"})


def _tokenize(text: str) -> set[str]:
    return {
        token
        for token in text.lower().replace("/", " ").replace("-", " ").replace(",", " ").split()
        if len(token) > 1 and token not in _STOPWORDS
    }


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


_OPP_VECTOR_CACHE: dict[uuid.UUID, tuple[int, list[float]]] = {}


def _opportunity_vector(opportunity: Opportunity) -> list[float] | None:
    text = " ".join([opportunity.title, opportunity.description, opportunity.sector, opportunity.organization])
    key = hash(text)
    cached = _OPP_VECTOR_CACHE.get(opportunity.id)
    if cached and cached[0] == key:
        return cached[1]
    try:
        from app.services.embedding import generate_embedding
        vec = generate_embedding(text)
    except Exception:
        return None
    _OPP_VECTOR_CACHE[opportunity.id] = (key, vec)
    return vec


def _local_vector_search(
    db: Session, vector: list[float] | None, filter_dict: dict[str, Any] | None
) -> tuple[list[uuid.UUID], dict[uuid.UUID, float]]:
    """In-process similarity search over the SQL opportunities (used when Pinecone is unavailable)."""
    stmt = select(Opportunity)
    if filter_dict:
        sectors = filter_dict.get("sector")
        if sectors:
            sectors = [sectors] if isinstance(sectors, str) else list(sectors)
            stmt = stmt.where(or_(*[Opportunity.sector.ilike(f"%{x.strip()}%") for x in sectors]))
        if isinstance(filter_dict.get("is_verified"), bool):
            stmt = stmt.where(Opportunity.is_verified == filter_dict["is_verified"])
    opportunities = db.exec(stmt).all()

    scores: dict[uuid.UUID, float] = {}
    for opp in opportunities:
        opp_vec = _opportunity_vector(opp) if vector else None
        if vector and opp_vec and len(opp_vec) == len(vector):
            dot = sum(a * b for a, b in zip(vector, opp_vec))
            norm = math.sqrt(sum(a * a for a in vector)) * math.sqrt(sum(b * b for b in opp_vec))
            scores[opp.id] = dot / norm if norm else 0.0
        else:
            scores[opp.id] = 0.0
    ordered = sorted(scores, key=lambda oid: scores[oid], reverse=True)
    return ordered, scores


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

    # If no pre-computed embedding, generate one on-the-fly from capabilities text.
    if not vector:
        text_parts = _flatten_text_values(profile.capabilities)
        search_text = " ".join(text_parts) if text_parts else profile.company_name
        try:
            from app.services.embedding import generate_embedding
            vector = generate_embedding(search_text)
        except Exception:
            vector = None  # rank on capability overlap only

    id_to_score: dict[uuid.UUID, float] = {}
    ordered_ids: list[uuid.UUID] = []
    used_pinecone = False
    if vector and pinecone_configured():
        try:
            vector_matches = query_similar_opportunities(
                vector=vector, top_k=top_k, filter_dict=_build_pinecone_filter(filter_dict)
            )
            used_pinecone = True
        except RuntimeError:
            vector_matches = []  # Pinecone down / bad key -> local fallback below
        for match in vector_matches:
            try:
                opportunity_id = uuid.UUID(str(match.get("id")))
            except ValueError:
                continue
            if opportunity_id not in id_to_score:
                ordered_ids.append(opportunity_id)
            id_to_score[opportunity_id] = float(match.get("score") or 0.0)

    if not used_pinecone:
        ordered_ids, id_to_score = _local_vector_search(db, vector, filter_dict)

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
