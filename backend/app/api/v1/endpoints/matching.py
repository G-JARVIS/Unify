from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlmodel import Session

from app.api.deps import get_db
from app.services.matching import get_coms_matches


class MatchOpportunitiesRequest(BaseModel):
    msme_id: uuid.UUID | None = None
    top_k: int = Field(default=5, ge=1, le=50)
    sector: list[str] | None = None
    is_verified: bool | None = None

    @model_validator(mode="after")
    def validate_payload(self) -> "MatchOpportunitiesRequest":
        if self.msme_id is None and not self.sector and self.is_verified is None:
            raise ValueError("provide msme_id or at least one filter criterion")
        return self

    def to_filter_dict(self) -> dict[str, Any] | None:
        filter_dict: dict[str, Any] = {}
        if self.sector:
            filter_dict["sector"] = self.sector
        if self.is_verified is not None:
            filter_dict["is_verified"] = self.is_verified
        return filter_dict or None


class OpportunityMatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    opportunity_id: str
    title: str
    organization: str
    sector: str
    opportunity_type: str
    vector_similarity: float
    capability_overlap: float
    coms_score: float
    explainability_tags: list[str]


class MatchOpportunitiesResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    msme_id: str
    top_k: int
    total_matches: int
    matches: list[OpportunityMatch]


router = APIRouter(prefix="/match", tags=["matching"])


@router.post(
    "/opportunities",
    response_model=MatchOpportunitiesResponse,
    status_code=status.HTTP_200_OK,
)
def match_opportunities(
    payload: MatchOpportunitiesRequest,
    db: Session = Depends(get_db),
) -> MatchOpportunitiesResponse:
    if payload.msme_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="msme_id is required for COMS matching",
        )

    try:
        matches = get_coms_matches(
            db=db,
            msme_id=payload.msme_id,
            top_k=payload.top_k,
            filter_dict=payload.to_filter_dict(),
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="vector store unavailable",
        ) from exc

    return MatchOpportunitiesResponse(
        msme_id=str(payload.msme_id),
        top_k=payload.top_k,
        total_matches=len(matches),
        matches=[OpportunityMatch.model_validate(item) for item in matches],
    )
