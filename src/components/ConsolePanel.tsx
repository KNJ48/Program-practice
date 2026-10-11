"use client";

import { useEffect, useRef } from "react";
import { Terminal, Trash2, Loader2 } from "lucide-react";
import type { ConsoleEntry, RunnerStatus } from "@/lib/runner";

const KIND_STYLE: Record<string, string> = {
  log: "text-zinc-200",
  info: "text-sky-300",
  warn: "text-amber-300",
  error: "text-red-400",
  system: "text-zinc-500 italic",
};

export default function ConsolePanel({
  entries,
  status,
  onClear,
  title = "出力",
}: {
  entries: ConsoleEntry[];
  status: RunnerStatus;
  onClear: () => void;
  title?: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0A0C0F]">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#1D2129] px-3">
        <Terminal className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
          {title}
        </span>
        {status !== "idle" && (
          <span className="ml-1 flex items-center gap-1.5 text-[11px] text-[#7C9CFF]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status === "loading" ? "環境を準備中" : "実行中"}
          </span>
        )}
        <button
          onClick={onClear}
          className="ml-auto flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
          title="コンソールをクリア"
        >
          <Trash2 className="h-3 w-3" />
          クリア
        </button>
      </div>
      <div
        ref={bodyRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-[family-name:var(--font-jb-mono)] text-[12.5px] leading-relaxed"
      >
        {entries.length === 0 ? (
          <p className="text-zinc-600">
            「実行」を押すと、ここに結果が表示されます。
          </p>
        ) : (
          entries.map((e) => (
            <div
              key={e.id}
              className={`console-line border-b border-white/[0.03] py-1 break-words whitespace-pre-wrap ${KIND_STYLE[e.kind]} ${e.kind === "error" ? "border-l-2 border-red-500/50 pl-2" : ""}`}
            >
              {e.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
