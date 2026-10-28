// All calls to the FastAPI backend live here.
// In development the Vite proxy forwards /api and /health to http://127.0.0.1:8000.
// To call a backend somewhere else, set VITE_API_URL in frontend-react/.env.local.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function errorMessage(data, status) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
  if (detail?.error) return detail.error;
  return `Request failed (${status}).`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the backend. Is FastAPI running on port 8000?");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some error pages are not JSON; fall through with data = null.
  }

  if (!response.ok) throw new Error(errorMessage(data, response.status));
  return data;
}

export const api = {
  /** GET /health → { status, message, database } */
  health: () => request("/health"),

  /** GET /api/conversations → [{ session_id, title, updated_at, preview }] */
  listConversations: () => request("/api/conversations").then((data) => data.items),

  /** GET /api/conversations/:id/messages → [{ role, content, created_at }] */
  getMessages: (sessionId) =>
    request(`/api/conversations/${sessionId}/messages`).then((data) => data.items),

  /**
   * POST /api/analyze → intent analysis + response_markdown + session_id.
   * Leave sessionId empty to start a new conversation.
   */
  analyze: (message, sessionId) =>
    request("/api/analyze", {
      method: "POST",
      body: JSON.stringify(sessionId ? { message, session_id: sessionId } : { message }),
    }),
};
