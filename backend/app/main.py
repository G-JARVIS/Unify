from __future__ import annotations

from fastapi import FastAPI

from app.api.router import api_router


app = FastAPI(title="UNIFY API", version="0.1.0")
app.include_router(api_router)
