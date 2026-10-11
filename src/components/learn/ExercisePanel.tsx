"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Dumbbell,
  ChevronRight,
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import ConsolePanel from "@/components/ConsolePanel";
import PreviewPanel from "@/components/PreviewPanel";
import { useRunner } from "@/lib/runner";
import { buildPreviewDocument } from "@/lib/preview";

type Props = {
  language: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string | null;
  accent: string;
  onPassed: () => void;
};

type CheckResult = { ok: boolean; actual: string };

/** 全画面中に Esc で抜ける共通フック */
function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onClose]);
}

export default function ExercisePanel({
  language,
  starterCode,
  solutionCode,
  expectedOutput,
  accent,
  onPassed,
}: Props) {
  const [code, setCode] = useState(starterCode);
  const [backup, setBackup] = useState<string | null>(null);
  const [checked, setChecked] = useState<CheckResult | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [tab, setTab] = useState<"console" | "preview">(
    language === "html" ? "preview" : "console",
  );
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const runner = useRunner();
  const isHtml = language === "html";
  const busy = runner.status !== "idle";

  // 全画面モード中は Esc で抜けられるようにする
  const setFs = useCallback((next: boolean) => setPreviewFullscreen(next), []);
  useEscape(previewFullscreen, () => setFs(false));

  if (isHtml && previewFullscreen && previewHtml !== null) {
    return (
      <PreviewPanel
        html={previewHtml}
        onEntry={runner.push}
        fullscreen
        onFullscreenChange={setFs}
      />
    );
  }

  const showSolution = backup !== null;

  const run = useCallback(async () => {
    if (busy) return;
    setChecked(null);
    runner.push(
      "system",
      `── 実行 ${new Date().toLocaleTimeString("ja-JP", { hour12: false })} ──`,
    );
    if (isHtml) {
      const doc = buildPreviewDocument(code, () => null);
      setPreviewHtml(doc);
      setTab("preview");
      return;
    }
    const startIdx = runner.entriesRef.current.length;
    if (language === "python") {
      await runner.runPython(code);
    } else if (language === "typescript") {
      await runner.runTypeScript(code);
    } else {
      await runner.runJavaScript(code);
    }
    if (expectedOutput != null) {
      const actual = runner.entriesRef.current
        .slice(startIdx)
        .filter((e) => e.kind !== "system")
        .map((e) => e.text)
        .join("\n")
        .trim();
      const ok = actual === expectedOutput.trim();
      setChecked({ ok, actual });
      if (ok) onPassed();
    }
  }, [busy, code, expectedOutput, isHtml, language, onPassed, runner]);

  const toggleSolution = () => {
    if (showSolution) {
      setCode(backup);
      setBackup(null);
    } else {
      if (
        code.trim() !== solutionCode.trim() &&
        !window.confirm(
          "現在のコードを解答で上書きします。よろしいですか？（もう一度押すと元に戻ります）",
        )
      ) {
        return;
      }
      setBackup(code);
      setCode(solutionCode);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ヘッダー */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#1D2129] bg-[#0E1013] px-3">
        <span
          className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase"
          style={{ color: accent }}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          演習
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={run}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md bg-[#2F6BFF] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#4480ff] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isHtml ? "プレビュー実行" : "実行"}
            <kbd className="ml-1 hidden rounded border border-white/20 px-1 text-[10px] opacity-70 md:inline">
              ⌘↵
            </kbd>
          </button>
          <button
            onClick={() => {
              if (
                code === starterCode ||
                window.confirm("コードを初期状態に戻します。よろしいですか？")
              ) {
                setCode(starterCode);
                setBackup(null);
              }
            }}
            title="初期コードに戻す"
            className="flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            リセット
          </button>
          {solutionCode && (
            <button
              onClick={toggleSolution}
              title="解答例を表示 / 元に戻す"
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
                showSolution
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : "border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              {showSolution ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              解答
            </button>
          )}
        </div>
      </div>

      {/* エディタ */}
      <div className="min-h-0 flex-1">
        <CodeEditor
          value={code}
          language={language}
          onChange={setCode}
          onRunShortcut={run}
        />
      </div>

      {/* 出力チェック */}
      {checked && expectedOutput != null && (
        <div
          className={`shrink-0 border-t px-4 py-3 ${
            checked.ok
              ? "border-emerald-500/30 bg-emerald-500/[0.07]"
              : "border-amber-500/30 bg-amber-500/[0.06]"
          }`}
        >
          {checked.ok ? (
            <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              出力が期待結果と一致しました。このレッスンは完了です。
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              <span className="opacity-80">下部の「次のレッスン」へ進みましょう。</span>
            </p>
          ) : (
            <div className="text-[13px]">
              <p className="flex items-center gap-2 font-medium text-amber-300">
                <XCircle className="h-4 w-4 shrink-0" />
                出力が期待結果と一致しません。
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] tracking-wider text-zinc-500 uppercase">
                    期待される出力
                  </p>
                  <pre className="max-h-28 overflow-auto rounded border border-white/10 bg-black/40 p-2 font-[family-name:var(--font-jb-mono)] text-[11.5px] whitespace-pre-wrap text-emerald-200/80">
                    {expectedOutput}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[11px] tracking-wider text-zinc-500 uppercase">
                    実際の出力
                  </p>
                  <pre className="max-h-28 overflow-auto rounded border border-white/10 bg-black/40 p-2 font-[family-name:var(--font-jb-mono)] text-[11.5px] whitespace-pre-wrap text-amber-200/80">
                    {checked.actual || "（出力なし）"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 出力 / プレビュー */}
      <div className="flex h-[38%] min-h-[140px] shrink-0 flex-col border-t border-[#1D2129]">
        {isHtml ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-8 shrink-0 items-center gap-1 border-b border-[#1D2129] bg-[#0E1013] px-2">
              {(
                [
                  { id: "preview", label: "プレビュー" },
                  { id: "console", label: "出力" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    tab === t.id
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1">
              {tab === "preview" ? (
                <PreviewPanel
                  html={previewHtml}
                  onEntry={runner.push}
                  onFullscreenChange={setFs}
                />
              ) : (
                <ConsolePanel
                  entries={runner.entries}
                  status={runner.status}
                  onClear={runner.clear}
                />
              )}
            </div>
          </div>
        ) : (
          <ConsolePanel
            entries={runner.entries}
            status={runner.status}
            onClear={runner.clear}
          />
        )}
      </div>
    </div>
  );
}
