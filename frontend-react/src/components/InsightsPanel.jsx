import { ArrowRight, BarChart3, Flag, Gauge, Hash, ListChecks, Tag, Workflow } from "lucide-react";

import { FOLLOW_UPS, intentLabel } from "../lib/intents.js";

function InsightRow({ icon: Icon, label, value, tone }) {
  return (
    <div className="insight-row">
      <Icon size={16} className={`insight-icon ${tone ? `text-${tone}` : ""}`} />
      <span className="insight-label">{label}</span>
      <span className="insight-value">{value}</span>
    </div>
  );
}

const LEVEL_TONE = { low: "success", medium: "warning", high: "danger", unknown: "muted" };

export default function InsightsPanel({ analysis, onAsk, disabled }) {
  return (
    <aside className="insights">
      <div className="insights-head">
        <BarChart3 size={20} className="text-primary" />
        <h2>Message Insights</h2>
        <span className={`soft-badge ${analysis ? "is-live" : ""}`}>{analysis ? "Live" : "Waiting"}</span>
      </div>

      {analysis ? (
        <>
          <div className="insight-summary">
            <span className="tile-icon tone-indigo">
              <Tag size={18} />
            </span>
            <div>
              <strong>{intentLabel(analysis.intent)}</strong>
              <p>{analysis.summary}</p>
            </div>
          </div>

          <p className="section-label">Detected classification</p>
          <div className="insight-rows">
            <InsightRow icon={Tag} label="Intent" value={analysis.intent} />
            <InsightRow
              icon={Gauge}
              label="Risk profile"
              value={analysis.risk_profile}
              tone={LEVEL_TONE[analysis.risk_profile]}
            />
            <InsightRow
              icon={Flag}
              label="Priority"
              value={analysis.priority}
              tone={LEVEL_TONE[analysis.priority]}
            />
            <InsightRow
              icon={ListChecks}
              label="Requires action"
              value={analysis.requires_action ? "yes" : "no"}
            />
            <InsightRow
              icon={Hash}
              label="Input tokens (est.)"
              value={analysis.token_metadata?.estimated_input_tokens ?? 0}
            />
          </div>

          <p className="section-label">Suggested follow-ups</p>
          <div className="follow-ups">
            {(FOLLOW_UPS[analysis.intent] ?? FOLLOW_UPS.unknown).map((prompt) => (
              <button key={prompt} type="button" className="follow-up" onClick={() => onAsk(prompt)} disabled={disabled}>
                <span>{prompt}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="insights-empty">
          Send a message to see how it was classified: intent, risk, priority and token estimate.
        </div>
      )}

      <div className="pipeline-card">
        <span className="pipeline-icon">
          <Workflow size={18} />
        </span>
        <strong>How each reply is made</strong>
        <ol>
          <li>Classify the intent (Week 1)</li>
          <li>Validate it with Pydantic</li>
          <li>Write the answer using recent history (Weeks 2–3)</li>
        </ol>
      </div>
    </aside>
  );
}
