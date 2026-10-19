import { useEffect, useRef, useState } from "react";
import { askBackend } from "./api";
import { loadChats, saveChats } from "./storage";
import Sidebar from "./Sidebar";
import Message from "./Message";
import ChatInput from "./ChatInput";

const EXAMPLES = [
  "Where is my order #4821?",
  "I was charged twice for the same payment",
  "What time is it right now?",
  "Hi there!",
];

const uid = () => Math.random().toString(36).slice(2, 10);
const newChat = () => ({ id: uid(), title: "New chat", messages: [] });

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = loadChats();
    return saved.length ? saved : [newChat()];
  });
  const [activeId, setActiveId] = useState(() => (loadChats()[0] || {}).id);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("prompt-gate-chat:theme") || "dark"; } catch { return "dark"; }
  });
  const bottomRef = useRef(null);

  const active = chats.find((c) => c.id === activeId) || chats[0];

  useEffect(() => { if (!activeId) setActiveId(chats[0].id); }, [activeId, chats]);
  useEffect(() => { saveChats(chats.filter((c) => c.messages.length)); }, [chats]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("prompt-gate-chat:theme", theme); } catch { /* ignore */ }
  }, [theme]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages]);

  const patchChat = (id, fn) => setChats((all) => all.map((c) => (c.id === id ? fn(c) : c)));

  async function ask(chatId, text, replaceId) {
    const pendingId = replaceId || uid();
    setBusy(true);
    patchChat(chatId, (c) => ({
      ...c,
      messages: replaceId
        ? c.messages.map((m) => (m.id === replaceId ? { id: replaceId, role: "assistant", pending: true } : m))
        : [...c.messages, { id: pendingId, role: "assistant", pending: true }],
    }));
    try {
      const data = await askBackend(text);
      const reply = {
        id: pendingId,
        role: "assistant",
        content: data.response_markdown,
        meta: {
          intent: data.intent,
          priority: data.priority,
          risk_profile: data.risk_profile,
          requires_action: data.requires_action,
          summary: data.summary,
          token_metadata: data.token_metadata,
        },
        question: text,
      };
      patchChat(chatId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === pendingId ? reply : m)) }));
    } catch (err) {
      const failed = { id: pendingId, role: "assistant", error: err.message, question: text };
      patchChat(chatId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === pendingId ? failed : m)) }));
    } finally {
      setBusy(false);
    }
  }

  function send(textOverride) {
    const text = (textOverride ?? draft).trim();
    if (!text || busy || !active) return;
    setDraft("");
    patchChat(active.id, (c) => ({
      ...c,
      title: c.messages.length ? c.title : text.slice(0, 40),
      messages: [...c.messages, { id: uid(), role: "user", content: text }],
    }));
    ask(active.id, text);
  }

  function startNewChat() {
    // Reuse an empty chat instead of piling up blank ones.
    const empty = chats.find((c) => c.messages.length === 0);
    if (empty) setActiveId(empty.id);
    else {
      const c = newChat();
      setChats((all) => [c, ...all]);
      setActiveId(c.id);
    }
    setSidebarOpen(false);
  }

  function deleteChat(id) {
    const rest = chats.filter((c) => c.id !== id);
    const next = rest.length ? rest : [newChat()];
    setChats(next);
    if (id === activeId) setActiveId(next[0].id);
  }

  const history = chats.filter((c) => c.messages.length);

  return (
    <div className="app">
      <Sidebar
        chats={history}
        activeId={active?.id}
        open={sidebarOpen}
        onNew={startNewChat}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onDelete={deleteChat}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main className="main">
        <header className="topbar">
          <button type="button" className="icon-btn menu" aria-label="Open chat history" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="title">Prompt Gate AI</span>
        </header>

        <div className="thread" role="log" aria-live="polite">
          {active?.messages.length === 0 ? (
            <div className="empty">
              <div className="avatar big" aria-hidden="true">AI</div>
              <h1>How can I help you today?</h1>
              <p className="muted">Ask a customer question. I detect the intent, then write a reply.</p>
              <div className="suggestions">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" className="suggestion" onClick={() => send(ex)} disabled={busy}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {active.messages.map((m) => (
                <Message key={m.id} msg={m} onRetry={() => ask(active.id, m.question, m.id)} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <ChatInput value={draft} onChange={setDraft} onSend={() => send()} disabled={busy} />
      </main>
    </div>
  );
}
