import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Copy,
  Database,
  Gauge,
  History,
  Lightbulb,
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Tags,
  User,
} from "lucide-react";

import Logo from "../components/Logo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const REPO_URL = "https://github.com/ProHireNetworks/Ai-Engineer-workshop";

function HeroPreview() {
  return (
    <div className="preview-window">
      <div className="preview-chrome">
        <span className="chrome-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-model">
          <span className="status-dot status-online" /> Groq LLM
        </span>
        <span className="preview-label">Workspace: Customer support</span>
      </div>

      <div className="preview-body">
        <div className="preview-user">
          <span className="preview-user-bubble">My payment was deducted twice. What should I do?</span>
          <span className="avatar avatar-user">
            <User size={14} />
          </span>
        </div>

        <div className="preview-assistant">
          <span className="avatar avatar-ai">
            <Sparkles size={14} />
          </span>
          <div className="preview-card">
            <div className="preview-card-head">
              <strong>AI Assistant</strong>
              <span className="intent-badge">Payment issue</span>
              <span className="msg-time">just now</span>
            </div>
            <p>
              Sorry about the double charge. First, check whether the second payment is still
              <em> pending</em>: these often drop off within a few days. If it has settled, contact
              support with both transaction IDs so they can refund it.
            </p>

            <div className="flow-box">
              <span className="flow-title">
                <Lightbulb size={14} /> How this reply was made
              </span>
              <div className="flow-steps">
                <div>
                  <small>01. Classify</small>
                  <span>payment_issue · high</span>
                </div>
                <div>
                  <small>02. Validate</small>
                  <span>Pydantic schema passed</span>
                </div>
                <div>
                  <small>03. Respond</small>
                  <span>Markdown answer + memory</span>
                </div>
              </div>
            </div>

            <div className="preview-actions">
              <span className="ghost-btn">
                <Copy size={13} /> Copy
              </span>
              <span className="mono-note">~12 input tokens</span>
            </div>
          </div>
        </div>
      </div>

      <Link to="/chat" className="preview-input">
        <span>Ask a follow-up question…</span>
        <span className="send-btn send-btn-sm" aria-hidden="true">
          <ArrowUp size={16} />
        </span>
      </Link>
    </div>
  );
}

const FEATURES = [
  {
    icon: MessagesSquare,
    tone: "indigo",
    title: "Smart Conversations",
    text: "Every message is classified first, so the answer matches what you actually need, whether that's a refund, an order or a quick question.",
    visual: (
      <div className="mini-card">
        <div className="mini-row">
          <span className="mini-label">“Where is my order?”</span>
        </div>
        <div className="mini-chips">
          <span className="intent-badge">Order tracking</span>
          <span className="level-chip level-medium">medium</span>
        </div>
      </div>
    ),
  },
  {
    icon: History,
    tone: "violet",
    title: "Organized Chat History",
    text: "Conversations are kept in memory while the server runs. Come back to any chat from the sidebar and the assistant still remembers the context.",
    visual: (
      <div className="mini-card mini-list">
        <div className="mini-row">
          <MessageSquare size={14} /> <span>Where is my order?</span> <small>2m</small>
        </div>
        <div className="mini-row">
          <History size={14} /> <span>Refund policy question</span> <small>Yesterday</small>
        </div>
      </div>
    ),
  },
  {
    icon: Gauge,
    tone: "green",
    title: "Clear Insights",
    text: "See how each message was understood: intent, risk, priority and an estimated token count, all validated against a strict schema.",
    visual: (
      <div className="mini-card">
        <div className="mini-meter">
          <span>Risk</span>
          <span className="meter">
            <i style={{ width: "80%" }} className="meter-danger" />
          </span>
        </div>
        <div className="mini-meter">
          <span>Priority</span>
          <span className="meter">
            <i style={{ width: "55%" }} className="meter-warning" />
          </span>
        </div>
      </div>
    ),
  },
];

const PIPELINE = [
  { title: "Your message", detail: "Checked: 1–5000 characters" },
  { title: "Classify", detail: "Groq LLM + Instructor" },
  { title: "Validate", detail: "Pydantic schema" },
  { title: "Respond", detail: "Answer with recent history" },
  { title: "Save", detail: "In-memory chat history" },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="site-nav">
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Main">
            <a href="#top" className="is-active">
              Home
            </a>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
            <Link to="/chat" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero container">
          <span className="pill">
            <Sparkles size={14} /> Your intent-aware AI assistant <span className="pill-sep" /> v4.0
          </span>
          <h1>
            Ask Anything. <span className="nowrap">Get Clear</span> Answers.
          </h1>
          <p className="hero-sub">
            A personal AI workspace for customer-support questions. Every message is understood,
            validated and answered in simple, organized conversations.
          </p>
          <div className="hero-actions">
            <Link to="/chat" className="btn btn-primary">
              Get Started <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn btn-outline">
              Explore Features <ChevronDown size={16} />
            </a>
          </div>
          <ul className="trust-row">
            <li>
              <ShieldCheck size={15} /> Validated output
            </li>
            <li>
              <Tags size={15} /> Intent detection
            </li>
            <li>
              <Database size={15} /> Session memory
            </li>
          </ul>

          <HeroPreview />
        </section>

        <section id="features" className="section container">
          <span className="eyebrow-pill">What it does</span>
          <h2>Designed for focus and clarity</h2>
          <p className="section-sub">
            No noise, just the pieces you need: understand the question, answer it well, and keep
            the conversation organized.
          </p>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, tone, title, text, visual }) => (
              <article key={title} className="feature-card">
                <span className={`tile-icon tone-${tone}`}>
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                {visual}
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="container">
          <div className="how-band">
            <div className="how-text">
              <span className="eyebrow">Under the hood</span>
              <h3>Every reply starts with understanding.</h3>
              <p>
                Before answering, the assistant classifies your message into a fixed set of intents
                and checks the result against a strict schema. Only validated data is used to write
                the reply.
              </p>
              <div className="stats">
                <div>
                  <strong>6</strong>
                  <span>Intent categories</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>Messages of memory</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>LLM calls per reply</span>
                </div>
              </div>
            </div>

            <ol className="pipeline">
              {PIPELINE.map((step, index) => (
                <li key={step.title}>
                  <span className="pipeline-step">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                  </div>
                  {index === 2 && <CheckCircle2 size={16} className="text-success pipeline-check" />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container">
          <div className="cta-card">
            <span className="cta-icon">
              <MessagesSquare size={22} />
            </span>
            <h2>Ready to Start a Conversation?</h2>
            <p>Get answers, explore ideas, and keep every conversation organized with your personal assistant.</p>
            <div className="hero-actions">
              <Link to="/chat" className="btn btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-soft">
                <BookOpen size={16} /> Read Documentation
              </a>
            </div>
            <small>Runs locally · Chat history stays in backend/data/chat.db</small>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Logo />
            <p>An intent-aware assistant that understands, validates and answers support questions.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#top">Home</a>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <Link to="/chat">Open app</Link>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 AI Assistant · Built for the AI Engineer workshop</span>
          <span>FastAPI · Groq · React</span>
        </div>
      </footer>
    </div>
  );
}
