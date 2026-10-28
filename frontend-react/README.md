# Frontend (React + Vite)

The AI Assistant web app: a landing page and a chat workspace, built with **React** and **Vite** in plain **JavaScript**. It talks to the FastAPI backend in `../backend`.

## Run it

You need **Node.js 18+** (check with `node --version`) and the backend running on port 8000.

```powershell
cd frontend-react
npm install        # first time only
npm run dev
```

Open http://localhost:5173

| Page | URL |
|---|---|
| Landing page | http://localhost:5173/ |
| New chat | http://localhost:5173/chat |
| A saved chat | http://localhost:5173/chat/<session_id> |

Stop it with `Ctrl + C`.

## How it connects to the backend

`vite.config.js` has a **proxy**: when the app calls `/api/...` or `/health`, Vite forwards the request to `http://127.0.0.1:8000`. The browser only ever talks to port 5173, so there are no CORS problems.

All requests are in **`src/lib/api.js`**:

| Function | Backend endpoint | Used for |
|---|---|---|
| `api.health()` | `GET /health` | Green/red status dot |
| `api.listConversations()` | `GET /api/conversations` | Sidebar "Recent conversations" |
| `api.getMessages(id)` | `GET /api/conversations/{id}/messages` | Opening a saved chat |
| `api.analyze(message, id)` | `POST /api/analyze` | Sending a message |

The first message of a new chat is sent **without** a `session_id`. The backend creates one, and the app moves to `/chat/<session_id>`. Every later message sends that id, so the backend can use the conversation history.

## Project structure

```text
frontend-react/
├── index.html               ← page shell, loads fonts and src/main.jsx
├── vite.config.js           ← dev server + backend proxy
├── public/favicon.svg
└── src/
    ├── main.jsx             ← starts React, loads the CSS
    ├── App.jsx              ← routes: "/" and "/chat/:sessionId?"
    ├── pages/
    │   ├── Landing.jsx      ← marketing page
    │   └── Chat.jsx         ← chat state + all backend calls (start here!)
    ├── components/
    │   ├── Sidebar.jsx      ← New Chat, saved conversations, status, theme
    │   ├── ChatHeader.jsx   ← title + connection chip
    │   ├── EmptyState.jsx   ← "What can I help you with?" + starter cards
    │   ├── MessageList.jsx  ← user bubbles, AI answer cards, typing indicator
    │   ├── Markdown.jsx     ← renders the AI's Markdown (code blocks, tables)
    │   ├── Composer.jsx     ← message box (Enter = send, Shift+Enter = new line)
    │   ├── InsightsPanel.jsx← right panel: intent, risk, priority, follow-ups
    │   ├── CopyButton.jsx, Logo.jsx, ThemeToggle.jsx
    ├── hooks/
    │   ├── useBackendStatus.js ← checks /health every 15 s
    │   └── useTheme.js         ← light/dark mode, remembered in localStorage
    ├── lib/
    │   ├── api.js           ← every fetch() to the backend
    │   ├── intents.js       ← labels + follow-up prompts per intent
    │   └── time.js          ← "10:41 AM", "2m", "Yesterday"
    └── styles/
        ├── global.css       ← colours (light + dark), buttons, Markdown styles
        ├── landing.css
        └── chat.css
```

## Libraries

| Library | Why |
|---|---|
| `react-router-dom` | Page routes (`/`, `/chat/...`) |
| `react-markdown` + `remark-gfm` | Shows the AI's Markdown answer safely (no raw HTML), including tables |
| `lucide-react` | Icons |

## Build for production

```powershell
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally to check it
```

The proxy only works with `npm run dev`. For a deployed build, set the backend address in `frontend-react/.env.local`:

```env
VITE_API_URL=https://your-backend.example.com
```

## Common problems

| What you see | Fix |
|---|---|
| Red dot / "Backend offline" | Start the backend: `uvicorn app.main:app --reload --port 8000` in `backend` |
| "Cannot reach the backend" error | Same as above |
| `npm` is not recognized | Install Node.js from https://nodejs.org, then reopen the terminal |
| Port 5173 in use | Another Vite server is running. Stop it with `Ctrl + C`, or use the URL Vite prints |
| Right-hand insights panel missing | It only shows on wide screens (over 1240px) |
