import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const MAX_LENGTH = 5000; // Same limit as IngestionRequest in the backend.

export default function Composer({ onSend, disabled, placeholder = "Ask anything…" }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Grow the textarea with its content, up to the CSS max-height.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        rows={2}
        value={text}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Message"
      />
      <div className="composer-bar">
        <span className="composer-hint">
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for a new line
        </span>
        {text.length > MAX_LENGTH - 500 && (
          <span className="composer-count">
            {text.length}/{MAX_LENGTH}
          </span>
        )}
        <button type="submit" className="send-btn" disabled={disabled || !text.trim()} aria-label="Send message">
          <ArrowUp size={20} />
        </button>
      </div>
    </form>
  );
}
