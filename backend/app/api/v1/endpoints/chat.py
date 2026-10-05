from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.services.chat import stream_chat_response
from sqlmodel import Session


router = APIRouter(tags=["chat"])


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=50)


@router.post("/stream")
def chat_stream(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    SSE streaming chat endpoint.

    Returns a `text/event-stream` response. Each event is a JSON object:
    - `{"delta": "...", "type": "text", "done": false}` — streamed text token
    - `{"delta": "", "type": "tool_start", "tools": [...], "done": false}` — tool call starting
    - `{"delta": "", "type": "tool_result", "tool_name": "...", "result": {...}, "done": false}` — tool result
    - `[DONE]` — stream complete sentinel

    The client should read each `data:` line and parse accordingly.
    """
    messages: list[dict[str, Any]] = [
        {"role": msg.role, "content": msg.content} for msg in payload.messages
    ]

    return StreamingResponse(
        stream_chat_response(db=db, current_user=current_user, messages=messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering
        },
    )
