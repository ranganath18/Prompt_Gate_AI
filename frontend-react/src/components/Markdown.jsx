import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CopyButton from "./CopyButton.jsx";

// react-markdown never renders raw HTML from the AI, so the output is safe to display.

function CodeBlock({ node, children }) {
  const codeElement = Array.isArray(children) ? children[0] : children;
  const className = codeElement?.props?.className ?? "";
  const language = /language-([\w-]+)/.exec(className)?.[1] ?? "code";
  const code = String(codeElement?.props?.children ?? "").replace(/\n$/, "");

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-lang">{language}</span>
        <CopyButton text={code} label="Copy snippet" className="code-copy" />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const components = {
  pre: CodeBlock,
  table: ({ node, ...props }) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
};

export default function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
