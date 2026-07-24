from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import UserRole


EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(pattern=EMAIL_PATTERN)
    password: str = Field(min_length=8)
    role: UserRole = UserRole.MSME


class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(pattern=EMAIL_PATTERN)
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    email: str
    role: UserRole


class Token(BaseModel):
    model_config = ConfigDict(extra="forbid")

    access_token: str
    token_type: str = "bearer"


class MSMEProfileCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company_name: str = Field(min_length=1, max_length=255)
    udyam_registration: str | None = Field(default=None, max_length=100)
    capabilities: dict[str, Any] = Field(default_factory=dict)


class MSMEProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    user_id: UUID
    company_name: str
    udyam_registration: str | None
    digital_maturity_score: int
    fairness_score: float
    capabilities: dict[str, Any]
    certifications: list[str] | dict[str, Any] | None = None
