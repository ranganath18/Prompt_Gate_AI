"""In-memory conversation store for Week 3.

Everything lives in a Python dictionary, so it is cleared when the server restarts.
(Later weeks replace this with a database.)
"""
from datetime import datetime, timezone
from threading import RLock
from typing import Any

MAX_HISTORY_MESSAGES = 12  # only the latest 12 messages are sent to the LLM

# { session_id: {"title": str, "updated_at": str, "messages": [ {role, content, created_at} ]} }
_conversations: dict[str, dict[str, Any]] = {}
_lock = RLock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_history(session_id: str) -> list[dict[str, str]]:
    """Last 12 messages as {role, content}, ready to send to Groq."""
    with _lock:
        conv = _conversations.get(session_id)
        if not conv:
            return []
        recent = conv["messages"][-MAX_HISTORY_MESSAGES:]
        return [{"role": m["role"], "content": m["content"]} for m in recent]


def add_message(session_id: str, role: str, content: str) -> None:
    if role not in {"user", "assistant"}:
        raise ValueError("Conversation role must be 'user' or 'assistant'.")
    now = _now()
    with _lock:
        conv = _conversations.setdefault(
            session_id, {"title": "New Chat", "updated_at": now, "messages": []}
        )
        if role == "user" and conv["title"] == "New Chat":
            conv["title"] = content[:70] or "New Chat"
        conv["messages"].append({"role": role, "content": content, "created_at": now})
        conv["updated_at"] = now


def list_conversations(limit: int = 30) -> list[dict[str, Any]]:
    """Newest first, for the sidebar."""
    with _lock:
        items = []
        for sid, conv in _conversations.items():
            last_user = next(
                (m["content"] for m in reversed(conv["messages"]) if m["role"] == "user"),
                None,
            )
            items.append({
                "session_id": sid,
                "title": conv["title"],
                "updated_at": conv["updated_at"],
                "preview": last_user or "Start a conversation",
            })
    items.sort(key=lambda c: c["updated_at"], reverse=True)
    return items[:limit]


def get_conversation_messages(session_id: str) -> list[dict[str, Any]]:
    """Full conversation (not just the last 12), for reopening a chat."""
    with _lock:
        conv = _conversations.get(session_id)
        return [dict(m) for m in conv["messages"]] if conv else []


def clear_session(session_id: str) -> None:
    with _lock:
        _conversations.pop(session_id, None)


def clear_all_sessions() -> None:
    """For tests and local development only."""
    with _lock:
        _conversations.clear()