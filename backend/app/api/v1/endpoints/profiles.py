from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_db, require_roles
from app.api.v1.schemas import MSMEProfileCreate, MSMEProfileRead
from app.db.models import MSMEProfile, User, UserRole


router = APIRouter(tags=["profiles"])


@router.post(
    "/msme",
    response_model=MSMEProfileRead,
    status_code=status.HTTP_200_OK,
)
def upsert_msme_profile(
    payload: MSMEProfileCreate,
    current_user: User = Depends(require_roles([UserRole.MSME])),
    db: Session = Depends(get_db),
) -> MSMEProfile:
    profile = db.exec(select(MSMEProfile).where(MSMEProfile.user_id == current_user.id)).one_or_none()
    if profile is None:
        profile = MSMEProfile(
            user_id=current_user.id,
            company_name=payload.company_name,
            udyam_registration=payload.udyam_registration,
            capabilities=payload.capabilities,
        )
        db.add(profile)
    else:
        profile.company_name = payload.company_name
        profile.udyam_registration = payload.udyam_registration
        profile.capabilities = payload.capabilities

    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/msme/me",
    response_model=MSMEProfileRead,
    status_code=status.HTTP_200_OK,
)
def read_my_msme_profile(
    current_user: User = Depends(require_roles([UserRole.MSME])),
    db: Session = Depends(get_db),
) -> MSMEProfile:
    profile = db.exec(select(MSMEProfile).where(MSMEProfile.user_id == current_user.id)).one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MSME profile not found")
    return profile
