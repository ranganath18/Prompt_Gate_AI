import { ArrowUpRight, CheckCircle2, CreditCard, Lightbulb, Package, Sparkles } from "lucide-react";

const STARTERS = [
  {
    icon: CreditCard,
    tone: "violet",
    title: "Sort out a payment",
    prompt: "My payment was deducted twice. What should I do?",
  },
  {
    icon: Package,
    tone: "indigo",
    title: "Track an order",
    prompt: "Where is my order? It was due yesterday.",
  },
  {
    icon: Lightbulb,
    tone: "green",
    title: "Ask anything",
    prompt: "How can I reset my password?",
  },
];

const CAPABILITIES = ["Intent detection", "Pydantic-validated output", "Remembers this conversation"];

export default function EmptyState({ onPick, disabled }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sparkles size={30} />
        <span className="empty-icon-dot" />
      </div>
      <h2>What can I help you with?</h2>
      <p>Ask a question about an order, a payment, or anything else to get started.</p>

      <div className="starter-grid">
        {STARTERS.map(({ icon: Icon, tone, title, prompt }) => (
          <button
            key={title}
            type="button"
            className="starter-card"
            onClick={() => onPick(prompt)}
            disabled={disabled}
          >
            <span className="starter-top">
              <span className={`tile-icon tone-${tone}`}>
                <Icon size={18} />
              </span>
              <ArrowUpRight size={18} className="starter-arrow" />
            </span>
            <strong>{title}</strong>
            <span className="starter-example">e.g., {prompt}</span>
          </button>
        ))}
      </div>

      <div className="capabilities">
        <span>Capabilities:</span>
        {CAPABILITIES.map((item) => (
          <span key={item} className="capability-chip">
            <CheckCircle2 size={14} /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}
