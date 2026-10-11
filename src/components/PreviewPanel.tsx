"use client";

import { useEffect, useRef } from "react";
import { MonitorPlay, Maximize2, Minimize2 } from "lucide-react";
import type { ConsoleKind } from "@/lib/runner";

type Props = {
  html: string | null;
  onEntry?: (kind: ConsoleKind, text: string) => void;
  title?: string;
  /** 全画面モードかどうか（親が管理） */
  fullscreen?: boolean;
  /** 全画面モードとの切り替え時に呼ばれる */
  onFullscreenChange?: (next: boolean) => void;
};

/** HTMLプレビュー iframe。内部の console 出力を親へ転送する。 */
export default function PreviewPanel({
  html,
  onEntry,
  title = "プレビュー",
  fullscreen = false,
  onFullscreenChange,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onEntryRef = useRef(onEntry);
  onEntryRef.current = onEntry;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.__cbPreview !== true) return;
      onEntryRef.current?.(d.type as ConsoleKind, String(d.payload ?? ""));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const PreviewBody = html === null ? (
    <div className="flex flex-1 items-center justify-center p-6 text-center text-[12.5px] text-zinc-600">
      HTML ファイルを「実行」すると、ここにプレビューが表示されます。
    </div>
  ) : (
    <iframe
      ref={iframeRef}
      key={html.length}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={html}
      title={title}
      className="min-h-0 flex-1 bg-white"
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0C0E11] px-4">
          <MonitorPlay className="h-4 w-4 text-[#7C9CFF]" />
          <span className="text-[12.5px] font-medium text-zinc-200">
            全画面プレビュー
          </span>
          <button
            onClick={() => onFullscreenChange?.(false)}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-zinc-100 transition-colors hover:bg-white/[0.12]"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            元に戻す
            <kbd className="ml-1 rounded border border-white/20 px-1 text-[10px] opacity-70">
              Esc
            </kbd>
          </button>
        </div>
        <div className="flex min-h-0 flex-1">{PreviewBody}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0A0C0F]">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#1D2129] px-3">
        <MonitorPlay className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
          {title}
        </span>
        <span className="ml-auto text-[10px] text-zinc-600">
          sandbox: allow-scripts
        </span>
        <button
          onClick={() => onFullscreenChange?.(true)}
          disabled={html === null}
          title="全画面でプレビュー"
          className="ml-2 flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
        >
          <Maximize2 className="h-3 w-3" />
          全画面
        </button>
      </div>
      {PreviewBody}
    </div>
  );
}
