from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.opportunities import router as opportunities_router
from app.api.v1.endpoints.matching import router as matching_router
from app.api.v1.endpoints.profiles import router as profiles_router


api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(profiles_router, prefix="/profiles")
api_router.include_router(opportunities_router, prefix="/opportunities")
api_router.include_router(matching_router)
