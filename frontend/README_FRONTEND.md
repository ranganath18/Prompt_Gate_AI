# Prompt Gate AI — Frontend

A responsive, dependency-free single-page interface for the Prompt Gate AI message-classification API. It uses HTML, CSS, and vanilla JavaScript; there is no frontend build step.

## Features

- Customer message input with a 5,000-character counter and clear button.
- Example messages for greetings, order tracking, payment issues, current-time questions, and an instruction-injection test.
- API health indicator.
- Processing pipeline showing message, AI model, and schema-gate status.
- Human-readable classification results and a formatted JSON view.
- Copy JSON action.
- Recent analysis history stored in browser `localStorage` (up to six results).
- Light/dark theme with the selection stored in `localStorage`.
- Loading state, request timeout handling, and readable handling of common API errors.
- Keyboard shortcut: `Ctrl+Enter` (or `Cmd+Enter` on macOS) submits the message.

## Technology stack

- HTML5
- CSS3 with responsive layout and light/dark themes
- Vanilla JavaScript using `fetch`
- FastAPI backend API
- Optional Google Fonts loaded from Google Fonts when network access is available

## Expected files

```text
frontend/
├── index.html
├── style.css
├── script.js
└── README.md
```

Keep these filenames as shown: `index.html` loads `style.css` and `script.js`. If your downloaded files have suffixes such as `(1)`, rename them before running the app.

## Prerequisites

1. Python installed, for serving the static files.
2. The Prompt Gate AI backend running at `http://127.0.0.1:8000` by default.

The frontend does not call Groq directly. All model requests go through the backend, so the Groq API key must remain on the backend and must never be placed in frontend JavaScript.

## Run locally

Start the backend first. See the backend README for setup and API configuration.

Then, from the **project root**, serve the frontend directory.

### Windows PowerShell

```powershell
python -m http.server 5500 --bind 127.0.0.1 --directory frontend
```

Open `http://127.0.0.1:5500` in your browser. Stop the server with `Ctrl+C`.

If you are already inside the `frontend` directory, you can instead run:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Do not open `index.html` directly with a `file://` URL; use a local static server.

## Using the interface

1. Enter a customer message or choose one of the example cards.
2. Select **Analyze message** or press `Ctrl+Enter` / `Cmd+Enter`.
3. Watch the processing pipeline as the request is sent to the API.
4. Review the intent, summary, risk profile, priority, follow-up requirement, and estimated input-token count.
5. Switch between **Summary** and **JSON** to inspect the structured response.
6. Select **Copy JSON** to copy a successful result.
7. Select a recent history item to reopen its stored result. Use **Clear history** to remove the saved entries.
8. Use the theme button to switch between light and dark themes.

## Backend API contract

The frontend expects these endpoints:

### `GET /health`

Used to update the API status indicator.

Expected successful shape:

```json
{
  "status": "ok",
  "message": "Prompt Gate AI API is running"
}
```

### `POST /api/analyze`

Request:

```json
{
  "message": "Where is my order?"
}
```

A successful response contains:

```json
{
  "intent": "order_tracking",
  "risk_profile": "medium",
  "priority": "medium",
  "requires_action": true,
  "summary": "The customer is asking about an order.",
  "token_metadata": {
    "estimated_input_tokens": 7,
    "note": "Estimated locally; may differ from provider token counts."
  }
}
```

The response values above are examples of the expected structure, not guaranteed model outputs.

The UI handles:
- `422`: invalid request input.
- `502` with a structured validation-error detail: model output rejected by the schema gate.
- `502` with a string detail: upstream LLM request failure.
- Other non-success responses: unexpected API errors.
- Connection failures and requests that exceed the 30-second frontend timeout.

## Configure the API URL

At the top of `script.js`:

```javascript
const API_URL = "http://127.0.0.1:8000";
```

Change this value if the backend is running on a different host or port. For a deployed frontend, use the publicly reachable backend URL and configure the backend's CORS allowlist to include the frontend origin.

## File responsibilities

| File | Purpose |
|---|---|
| `index.html` | Page structure, input area, examples, pipeline, result views, and history section |
| `style.css` | Layout, responsive behavior, visual states, and light/dark themes |
| `script.js` | Health checks, API requests, rendering, error handling, JSON copying, theme preference, and recent history |

## Important limitations

- The application classifies messages only. It does not retrieve orders, process payments, or fetch the current time.
- The token count is a local estimate and must not be used as a billing record.
- Recent history and theme preferences are stored in the current browser's `localStorage`; they are not shared across devices and may be cleared by the browser.
- Do not enter real customer secrets or sensitive personal information into a demo unless the environment is approved for that data.
- The frontend uses a fixed API URL by default. Production deployments need environment-specific configuration and appropriate HTTPS/CORS settings.

## Troubleshooting

- **API offline:** start the FastAPI backend and verify `http://127.0.0.1:8000/health`.
- **Cannot reach backend:** check `API_URL`, backend port, firewall settings, and browser console errors.
- **422 error:** provide a non-empty message of no more than 5,000 characters.
- **502 error:** inspect the backend terminal and verify the Groq key and model configuration.
- **Styles or JavaScript missing:** verify the files are named exactly `style.css` and `script.js` and are beside `index.html`.
- **Clipboard copy fails:** use the displayed JSON and copy it manually; clipboard permissions depend on browser context.

## License

Add the license and attribution terms appropriate for your repository.
