import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Meta({ meta }) {
  return (
    <div className="chips">
      <span className="chip intent">{meta.intent.replace("_", " ")}</span>
      <span className={`chip pr-${meta.priority}`}>priority: {meta.priority}</span>
      <span className={`chip pr-${meta.risk_profile}`}>risk: {meta.risk_profile}</span>
      {meta.requires_action && <span className="chip">follow-up needed</span>}
      <span className="chip">~{meta.token_metadata?.estimated_input_tokens ?? 0} tokens</span>
    </div>
  );
}

export default function Message({ msg, onRetry }) {
  const [copied, setCopied] = useState(false);

  if (msg.role === "user") {
    return (
      <div className="row-user">
        <div className="bubble">{msg.content}</div>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="row-ai">
      <div className="avatar" aria-hidden="true">AI</div>
      <div className="ai-body">
        {msg.pending && (
          <div className="typing" role="status" aria-label="Generating a reply">
            <span /><span /><span />
          </div>
        )}

        {msg.error && (
          <div className="error" role="alert">
            <span><strong>Something went wrong.</strong> {msg.error}</span>
            <button type="button" className="ghost" onClick={onRetry}>Retry</button>
          </div>
        )}

        {msg.meta && (
          <>
            <Meta meta={msg.meta} />
            <p className="summary">{msg.meta.summary}</p>
          </>
        )}

        {msg.content && (
          <>
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
            <div className="actions">
              <button type="button" className="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
