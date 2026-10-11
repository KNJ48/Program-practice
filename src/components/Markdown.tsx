import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** レッスン本文用のMarkdownレンダラ（シンプルで誠実な教科書スタイル） */
export default function Markdown({ content }: { content: string }) {
  return (
    <div className="lesson-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-zinc-100">
              <span className="h-4 w-[3px] rounded-full bg-[#7C9CFF]" />
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="my-3 text-[14.5px] leading-8 text-zinc-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-6 text-[14.5px] leading-7 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-6 text-[14.5px] leading-7 text-zinc-300">
              {children}
            </ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[#7C9CFF] underline decoration-[#7C9CFF]/40 underline-offset-4 hover:decoration-[#7C9CFF]"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return <code className={className}>{children}</code>;
            }
            return (
              <code className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-[family-name:var(--font-jb-mono)] text-[12.5px] text-[#A5D6A7]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg border border-[#222834] bg-[#0C0E12] p-4 font-[family-name:var(--font-jb-mono)] text-[12.5px] leading-relaxed text-zinc-200">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-[#222834]">
              <table className="w-full border-collapse text-[13.5px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.04] text-zinc-200">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[#222834] px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/[0.05] px-3 py-2 text-zinc-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-[#222834]" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
