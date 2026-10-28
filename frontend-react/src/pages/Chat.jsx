import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";

import ChatHeader from "../components/ChatHeader.jsx";
import Composer from "../components/Composer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import InsightsPanel from "../components/InsightsPanel.jsx";
import MessageList from "../components/MessageList.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useBackendStatus } from "../hooks/useBackendStatus.js";
import { api } from "../lib/api.js";

const newId = () => crypto.randomUUID();

export default function Chat() {
  const { sessionId } = useParams(); // undefined on /chat (a brand-new conversation)
  const navigate = useNavigate();
  const status = useBackendStatus();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The conversation currently on screen, readable inside async callbacks.
  const activeSessionRef = useRef(sessionId);
  // Set when *we* navigate to a new chat's id, so we don't reload what's already shown.
  const skipHistoryLoadRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await api.listConversations());
    } catch {
      // The sidebar just keeps its previous list; the status pill shows if the backend is down.
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load a saved conversation whenever the URL's session id changes.
  useEffect(() => {
    activeSessionRef.current = sessionId;
    setError("");
    setMobileMenuOpen(false);

    if (!sessionId) {
      setMessages([]);
      return undefined;
    }
    if (skipHistoryLoadRef.current === sessionId) {
      skipHistoryLoadRef.current = null;
      return undefined;
    }

    let cancelled = false;
    setMessages([]);
    setLoadingHistory(true);
    api
      .getMessages(sessionId)
      .then((items) => {
        if (cancelled) return;
        setMessages(
          items.map((item) => ({
            id: newId(),
            role: item.role,
            content: item.content,
            createdAt: item.created_at,
          })),
        );
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoadingHistory(false));

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || pending) return;

    const requestSession = sessionId;
    const userMessage = { id: newId(), role: "user", content: message, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setError("");
    setPending(true);

    try {
      const data = await api.analyze(message, requestSession);
      const { response_markdown: content, session_id: savedSession, ...analysis } = data;

      // The user switched to another chat while waiting: the reply is saved, just not shown here.
      if (activeSessionRef.current !== requestSession) {
        refreshConversations();
        return;
      }

      setMessages((current) => [
        ...current,
        { id: newId(), role: "assistant", content, createdAt: new Date().toISOString(), analysis },
      ]);

      if (savedSession !== requestSession) {
        skipHistoryLoadRef.current = savedSession;
        activeSessionRef.current = savedSession;
        navigate(`/chat/${savedSession}`);
      }
      refreshConversations();
    } catch (err) {
      if (activeSessionRef.current === requestSession) {
        setMessages((current) =>
          current.map((item) => (item.id === userMessage.id ? { ...item, failed: true } : item)),
        );
        setError(err.message);
      }
    } finally {
      setPending(false);
    }
  };

  const startNewChat = () => {
    setMobileMenuOpen(false);
    navigate("/chat");
  };

  const latestAnalysis = useMemo(
    () => [...messages].reverse().find((item) => item.analysis)?.analysis ?? null,
    [messages],
  );

  const title =
    conversations.find((item) => item.session_id === sessionId)?.title ??
    (messages[0]?.content.slice(0, 60) || "New Conversation");

  const showEmptyState = messages.length === 0 && !loadingHistory && !pending;

  return (
    <div className={`chat-layout ${sidebarHidden ? "sidebar-hidden" : ""} ${mobileMenuOpen ? "menu-open" : ""}`}>
      <Sidebar
        conversations={conversations}
        status={status}
        onNewChat={startNewChat}
        onCollapse={() => setSidebarHidden(true)}
        onNavigate={() => setMobileMenuOpen(false)}
      />
      <button
        type="button"
        className="sidebar-scrim"
        aria-label="Close menu"
        onClick={() => setMobileMenuOpen(false)}
      />

      <main className="chat-main">
        <ChatHeader
          title={title}
          status={status}
          sidebarHidden={sidebarHidden}
          onShowSidebar={() => setSidebarHidden(false)}
          onOpenMenu={() => setMobileMenuOpen(true)}
          onNewChat={startNewChat}
        />

        <div className="chat-scroll">
          {showEmptyState ? (
            <EmptyState onPick={sendMessage} disabled={pending} />
          ) : loadingHistory ? (
            <div className="history-loading">Loading conversation…</div>
          ) : (
            <MessageList messages={messages} pending={pending} />
          )}
        </div>

        <div className="composer-wrap">
          {error && (
            <div className="error-banner" role="alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
              <button type="button" className="icon-btn" onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          <Composer
            onSend={sendMessage}
            disabled={pending}
            placeholder={messages.length ? "Ask a follow-up question…" : "Ask anything…"}
          />
          <p className="disclaimer">AI responses may not always be accurate. Please verify important information.</p>
        </div>
      </main>

      <InsightsPanel analysis={latestAnalysis} onAsk={sendMessage} disabled={pending} />
    </div>
  );
}
