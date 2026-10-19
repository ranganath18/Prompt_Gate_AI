// Backend address. Change it here if your FastAPI server runs elsewhere.
export const API_URL = "http://127.0.0.1:8000";

// POST /api/respond -> { intent, risk_profile, priority, requires_action,
//                        summary, token_metadata, response_markdown }
export async function askBackend(message) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_URL}. Is uvicorn running?`);
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d) => d.msg).join("; ");
    } catch {
      /* response was not JSON */
    }
    throw new Error(detail || `Request failed (HTTP ${res.status}).`);
  }
  return res.json();
}
