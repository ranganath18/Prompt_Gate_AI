import { useEffect, useRef } from "react";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const ref = useRef(null);

  // Grow the box as the user types (up to ~8 lines), like ChatGPT.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const canSend = value.trim() && !disabled;

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          maxLength={5000}
          placeholder="Message Prompt Gate AI…"
          aria-label="Message"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="send" onClick={onSend} disabled={!canSend} aria-label="Send message">
          ↑
        </button>
      </div>
      <p className="hint">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
