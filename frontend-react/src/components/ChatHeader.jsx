import { Link } from "react-router-dom";
import { Home, Menu, PanelLeftOpen, SquarePen } from "lucide-react";

const STATUS_LABEL = { checking: "Connecting…", online: "Groq LLM · Online", offline: "Backend offline" };

export default function ChatHeader({ title, status, sidebarHidden, onShowSidebar, onOpenMenu, onNewChat }) {
  return (
    <header className="chat-header">
      <button type="button" className="icon-btn mobile-only" onClick={onOpenMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      {sidebarHidden && (
        <button
          type="button"
          className="icon-btn desktop-only"
          onClick={onShowSidebar}
          aria-label="Show sidebar"
          title="Show sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <h1 className="chat-title">{title}</h1>
      <span className={`model-chip status-${status}`}>
        <span className="status-dot" />
        {STATUS_LABEL[status]}
      </span>

      <div className="chat-header-actions">
        <button type="button" className="btn btn-soft btn-sm" onClick={onNewChat}>
          <SquarePen size={16} />
          <span className="hide-sm">New chat</span>
        </button>
        <Link to="/" className="btn btn-outline btn-sm" aria-label="Home">
          <Home size={16} />
          <span className="hide-sm">Home</span>
        </Link>
      </div>
    </header>
  );
}
