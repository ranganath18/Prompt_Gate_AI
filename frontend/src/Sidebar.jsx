export default function Sidebar({ chats, activeId, open, onNew, onSelect, onDelete, onClose, theme, onTheme }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Chat history">
        <button type="button" className="new-chat" onClick={onNew}>
          <span aria-hidden="true">＋</span> New chat
        </button>

        <div className="history-title">Recent</div>
        <nav className="history">
          {chats.length === 0 && <p className="muted small">No chats yet.</p>}
          {chats.map((c) => (
            <div key={c.id} className={`history-item ${c.id === activeId ? "active" : ""}`}>
              <button type="button" className="history-link" onClick={() => onSelect(c.id)} title={c.title}>
                {c.title}
              </button>
              <button
                type="button"
                className="icon-btn del"
                aria-label={`Delete chat: ${c.title}`}
                onClick={() => onDelete(c.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </nav>

        <button type="button" className="theme-btn" onClick={onTheme}>
          {theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}
        </button>
      </aside>
    </>
  );
}
