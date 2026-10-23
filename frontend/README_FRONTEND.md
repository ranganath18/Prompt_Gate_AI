# Prompt Gate AI: Frontend

A ChatGPT-style React interface for the Prompt Gate AI backend.

## Features

- Sidebar with saved chats, a New chat button and delete
- Welcome screen with clickable example questions
- Message thread: your messages on the right, AI replies on the left
- Replies rendered from Markdown with `react-markdown` and `remark-gfm`
- Labels on each reply: intent, priority, risk, follow-up flag, token estimate, plus the summary
- Chat bar that grows as you type. Enter sends, Shift+Enter adds a new line
- Typing indicator, error message with a Retry button, and a Copy button on replies
- Dark and light themes, and a mobile layout
- Chats are saved in the browser (`localStorage`) and survive a refresh

## Tech stack

React, Vite, react-markdown, remark-gfm. No UI library.

## Folder structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          App entry point
    ├── App.jsx           Chat state and sending messages
    ├── Sidebar.jsx       Chat history, new chat, theme toggle
    ├── Message.jsx       One message with Markdown and labels
    ├── ChatInput.jsx     The chat bar
    ├── api.js            Calls the backend (set API_URL here)
    ├── storage.js        Saves chats in the browser
    └── index.css         All styling
```

## Requirements

- Node.js (LTS)
- The backend running on `http://127.0.0.1:8000` (see `backend/README_BACKEND.md`)

## Run

From the `frontend` folder:

```cmd
npm install
npm run dev
```

Open the address it prints, usually `http://localhost:5173`.

Other commands:

```cmd
npm run build      Production build into dist/
npm run preview    Serve the production build locally
```

## Configuration

The backend address is set at the top of `src/api.js`:

```js
export const API_URL = "http://127.0.0.1:8000";
```

Change it if the backend runs on another host or port.

To change the look, edit the colour variables at the top of `src/index.css`.

## How it talks to the backend

`api.js` sends `POST /api/respond` with `{ "message": "..." }`. The response's `response_markdown` is shown as the reply, and the other fields are shown as labels. The Groq API key is never used in the frontend.

Each message is answered on its own. The backend does not receive earlier messages from the same chat.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing script: "dev"` | Run the command in the folder that contains `package.json` |
| `npm` is not recognized | Install Node.js LTS and reopen the terminal |
| "Cannot reach the backend" | Start the backend, and check the port matches `API_URL` |
| Old design still shows | Hard-refresh with Ctrl+Shift+R |
| Blank page | Press F12 and read the red error in the Console tab |
