import { useEffect, useRef } from "react";
import { AlertCircle, Sparkles, User } from "lucide-react";

import CopyButton from "./CopyButton.jsx";
import Markdown from "./Markdown.jsx";
import { intentLabel } from "../lib/intents.js";
import { formatTime } from "../lib/time.js";

function UserMessage({ message }) {
  return (
    <div className="msg-user">
      <div className="msg-user-row">
        <div className={`user-bubble ${message.failed ? "is-failed" : ""}`}>{message.content}</div>
        <span className="avatar avatar-user" aria-hidden="true">
          <User size={16} />
        </span>
      </div>
      <span className="msg-meta">
        {message.failed ? (
          <span className="msg-failed">
            <AlertCircle size={13} /> Not sent
          </span>
        ) : (
          <>You · {formatTime(message.createdAt)}</>
        )}
      </span>
    </div>
  );
}

function AnalysisStrip({ analysis }) {
  return (
    <div className="analysis-strip">
      <span className={`level-chip level-${analysis.risk_profile}`}>Risk: {analysis.risk_profile}</span>
      <span className={`level-chip level-${analysis.priority}`}>Priority: {analysis.priority}</span>
      <span className={`level-chip ${analysis.requires_action ? "level-medium" : "level-low"}`}>
        {analysis.requires_action ? "Follow-up needed" : "No action needed"}
      </span>
    </div>
  );
}

function AssistantMessage({ message }) {
  const { analysis } = message;

  return (
    <div className="msg-assistant">
      <span className="avatar avatar-ai" aria-hidden="true">
        <Sparkles size={16} />
      </span>
      <div className="assistant-body">
        <div className="assistant-head">
          <span className="assistant-name">AI Assistant</span>
          {analysis && <span className="intent-badge">{intentLabel(analysis.intent)}</span>}
          <span className="msg-time">{formatTime(message.createdAt)}</span>
        </div>

        <div className="assistant-card">
          <Markdown>{message.content}</Markdown>
          {analysis && <AnalysisStrip analysis={analysis} />}
          <div className="assistant-foot">
            <CopyButton text={message.content} label="Copy" />
            {analysis && (
              <span className="mono-note">
                ~{analysis.token_metadata?.estimated_input_tokens ?? 0} input tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThinkingMessage() {
  return (
    <div className="msg-assistant">
      <span className="avatar avatar-ai is-busy" aria-hidden="true">
        <Sparkles size={16} />
      </span>
      <div className="thinking">
        <div className="thinking-bubble">
          <span className="typing-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Detecting intent and writing a reply…
        </div>
        <span className="thinking-note">Classify → validate → respond</span>
      </div>
    </div>
  );
}

export default function MessageList({ messages, pending }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
      {pending && <ThinkingMessage />}
      <div ref={endRef} />
    </div>
  );
}
