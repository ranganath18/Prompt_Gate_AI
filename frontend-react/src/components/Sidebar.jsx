import { NavLink } from "react-router-dom";
import { MessageSquare, PanelLeftClose, Plus } from "lucide-react";

import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { formatRelative } from "../lib/time.js";

const STATUS_TEXT = {
  checking: "Checking backend…",
  online: "Backend connected",
  offline: "Backend offline",
};

export default function Sidebar({ conversations, onNewChat, onCollapse, onNavigate, status }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Logo />
        <button
          type="button"
          className="icon-btn sidebar-collapse"
          onClick={onCollapse}
          aria-label="Hide sidebar"
          title="Hide sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={onNewChat}>
        <Plus size={18} /> New Chat
      </button>

      <p className="section-label">Recent conversations</p>
      <nav className="conversation-list">
        {conversations.length === 0 && (
          <p className="conversation-empty">Your saved chats will appear here.</p>
        )}
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.session_id}
            to={`/chat/${conversation.session_id}`}
            className="conversation-item"
            onClick={onNavigate}
            title={conversation.preview}
          >
            <MessageSquare size={16} className="conversation-icon" />
            <span className="conversation-title">{conversation.title}</span>
            <span className="conversation-time">{formatRelative(conversation.updated_at)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="backend-pill">
          <span className={`status-dot status-${status}`} />
          <div>
            <strong>{STATUS_TEXT[status]}</strong>
            <span>FastAPI · Groq · In-memory</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
