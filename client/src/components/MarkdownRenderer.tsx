import { Check, Copy } from "lucide-react";
import {
  isValidElement,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content min-w-0 max-w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ children, className, inline, ...props }: CodeProps) => (
            <code
              {...props}
              className={`${className ?? ""}${inline ? " markdown-inline-code" : ""}`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = getTextContent(children).replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="markdown-code-block group relative my-4 max-w-full overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => void copy()}
        className="absolute right-2 top-2 z-10 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface/90 px-2.5 text-xs font-bold text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100"
        aria-label={copied ? "Code copied" : "Copy code"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-secondary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      {children}
    </div>
  );
}

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return "";
}
