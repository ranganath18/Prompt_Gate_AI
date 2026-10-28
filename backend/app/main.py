from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.schemas.ingestion import IngestionRequest, RespondResult
from app.services.conversation_service import (
    add_message,
    clear_session,
    get_conversation_messages,
    get_history,
    list_conversations,
)
from app.services.llm_service import analyze_message, generate_response
from app.utils.token_counter import estimate_tokens

app = FastAPI(
    title="Enterprise Structured Ingestion Firewall",
    description="Classifies user messages and validates structured AI output.",
    version="1.0.0",
)

# Simple local-development CORS configuration. Restrict this in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def validate_session_id(session_id: str) -> str:
    try:
        UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="session_id must be a valid UUID.")
    return session_id


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Ingestion Firewall API is running"}


@app.post("/api/respond", response_model=RespondResult)
@app.post("/api/analyze", response_model=RespondResult)
def respond(request: IngestionRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    session_id = validate_session_id(request.session_id or str(uuid4()))

    try:
        # Read history BEFORE saving the current message, so it isn't sent twice.
        history = get_history(session_id)
        analysis = analyze_message(message)
        analysis.token_metadata.estimated_input_tokens = estimate_tokens(message)
        markdown = generate_response(message, analysis, history=history)

        # Save only after the LLM succeeded, so a failed request leaves no half-saved turn.
        add_message(session_id, "user", message)
        add_message(session_id, "assistant", markdown)

        return RespondResult(
            **analysis.model_dump(), session_id=session_id, response_markdown=markdown
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=502, detail="The model response did not pass validation."
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="LLM request failed. Check the API key, model name, network, and provider limits.",
        ) from exc


@app.get("/api/conversations")
def conversations():
    return {"items": list_conversations()}


@app.get("/api/conversations/{session_id}/messages")
def conversation_messages(session_id: str):
    try:
        UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")
    return {"session_id": session_id, "items": get_conversation_messages(session_id)}


@app.delete("/api/conversations/{session_id}")
def delete_conversation(session_id: str):
    validate_session_id(session_id)
    clear_session(session_id)
    return {"status": "cleared", "session_id": session_id}