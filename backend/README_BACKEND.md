# Prompt Gate AI: Backend

FastAPI service that classifies a customer message and generates a Markdown reply using Groq.

## How it works

1. `POST /api/respond` receives `{ "message": "..." }`.
2. **Intent detection** (`analyze_message`): Groq, through Instructor, returns a validated `IngestionResult` (intent, risk, priority, summary).
3. **Reply generation** (`generate_response`): the intent result is turned into context for a prompt, and Groq writes a Markdown reply.
4. The API returns the classification and `response_markdown` together.

## Folder structure

```
backend/
├── app/
│   ├── main.py                 API routes and error handling
│   ├── config.py               Loads GROQ_API_KEY and GROQ_MODEL from .env
│   ├── schemas/
│   │   └── ingestion.py        Request and response models (Pydantic)
│   ├── services/
│   │   └── llm_service.py      Intent detection and reply generation
│   └── utils/
│       └── token_counter.py    Local token estimate
├── requirements.txt
├── env.example                 Template for .env
└── .gitignore
```

## Setup

From the `backend` folder:

```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy env.example .env
```

Edit `.env`:

```
GROQ_API_KEY=your_real_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

`GROQ_MODEL` is optional and defaults to `llama-3.3-70b-versatile`. Use any model your Groq account can access.

## Run

```cmd
python -m uvicorn app.main:app --reload --port 8000
```

- Health check: http://127.0.0.1:8000/health
- Interactive docs: http://127.0.0.1:8000/docs

Use `python -m uvicorn` rather than `uvicorn` alone. This avoids launcher errors if the virtual environment was moved.

## API

### `GET /health`

```json
{ "status": "ok", "message": "Ingestion Firewall API is running" }
```

### `POST /api/analyze`

Classification only (Week 1).

Request: `{ "message": "Where is my order?" }`

Response fields: `intent`, `risk_profile`, `priority`, `requires_action`, `summary`, `token_metadata`.

### `POST /api/respond`

Classification plus a generated reply (Week 2).

Request:

```json
{ "message": "Where is my order?" }
```

Response:

```json
{
  "intent": "order_tracking",
  "risk_profile": "medium",
  "priority": "medium",
  "requires_action": true,
  "summary": "Customer asks about the status of an order.",
  "token_metadata": { "estimated_input_tokens": 6, "note": "..." },
  "response_markdown": "Hi! I can help with that.\n\n- Please share your **order ID**..."
}
```

### Intents

`greeting`, `order_tracking`, `payment_issue`, `current_time`, `general_question`, `unknown`

Risk is `low`, `medium`, `high` or `unknown`. Priority is `low`, `medium` or `high`.

## Prompt design

- A shared system prompt asks for a short Markdown reply and forbids inventing order statuses, refund amounts or account data.
- `INTENT_RULES` in `llm_service.py` adds one instruction per intent, for example: ask for the order ID for `order_tracking`, never ask for a full card number or CVV for `payment_issue`.
- The detected intent, priority, risk, summary and the current server time are added as dynamic context.
- The customer's message is treated as untrusted data, not as instructions.

## Error handling

| Status | Meaning |
|--------|---------|
| 422 | Empty or invalid message |
| 502 | The model call failed, or the model output failed schema validation |

The API never returns the API key or internal stack traces.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `GROQ_API_KEY is missing` | Create `backend/.env` with your key |
| `ModuleNotFoundError` | Activate the venv, then run `pip install -r requirements.txt` |
| `Could not import module "app.main"` | Run the command from inside `backend` |
| `Address already in use` | Another server uses port 8000. Close it or use `--port 8001` |
| 502 `LLM request failed` | Check the key, the model name, your internet connection and Groq rate limits |
