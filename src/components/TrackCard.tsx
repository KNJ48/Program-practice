"use client";

import { ArrowRight, BookOpen, CheckCircle2, MonitorPlay, TerminalSquare } from "lucide-react";
import type { AppView, TrackDTO } from "@/lib/types";

const RUN_MODE: Record<string, { icon: typeof TerminalSquare; label: string }> = {
  html: { icon: MonitorPlay, label: "プレビュー実行" },
  css: { icon: MonitorPlay, label: "プレビュー実行" },
  javascript: { icon: TerminalSquare, label: "コンソール実行" },
  typescript: { icon: TerminalSquare, label: "コンソール実行" },
  python: { icon: TerminalSquare, label: "コンソール実行" },
};

export default function TrackCard({
  track,
  onNavigate,
}: {
  track: TrackDTO;
  onNavigate: (view: AppView) => void;
}) {
  const pct =
    track.lessonCount > 0
      ? Math.round((track.completedCount / track.lessonCount) * 100)
      : 0;
  const done = track.lessonCount > 0 && track.completedCount === track.lessonCount;
  const started = track.completedCount > 0;
  const mode = RUN_MODE[track.slug];

  const goContinue = () => {
    if (track.nextLessonSlug) {
      onNavigate({
        kind: "lesson",
        trackSlug: track.slug,
        lessonSlug: track.nextLessonSlug,
      });
    } else {
      onNavigate({ kind: "track", trackSlug: track.slug });
    }
  };
  const goTrack = () => onNavigate({ kind: "track", trackSlug: track.slug });

  return (
    <div className="group flex flex-col rounded-xl border border-[#1D2129] bg-[#0E1013] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2C3442] hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[16px] font-bold"
          style={{ backgroundColor: track.color + "1A", color: track.color }}
        >
          {track.name.slice(0, 1)}
        </span>
        {mode && (
          <span className="flex items-center gap-1 rounded-full border border-[#242B36] px-2 py-1 text-[10px] text-zinc-500">
            <mode.icon className="h-3 w-3" />
            {mode.label}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-[17px] font-bold tracking-tight text-zinc-50">
        {track.name}
      </h3>
      <p className="mt-0.5 text-[12px] font-medium" style={{ color: track.color }}>
        {track.subtitle}
      </p>
      <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-500">
        {track.description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
        <BookOpen className="h-3 w-3" />
        <span className="font-[family-name:var(--font-jb-mono)]">
          {track.lessonCount} レッスン
        </span>
        {done && (
          <span className="ml-auto flex items-center gap-1 font-medium text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            完了
          </span>
        )}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: done ? "#34D399" : track.color,
          }}
        />
      </div>
      <p className="mt-1.5 text-right font-[family-name:var(--font-jb-mono)] text-[10.5px] text-zinc-600">
        {track.completedCount} / {track.lessonCount}（{pct}%）
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={goContinue}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white transition-colors"
          style={{ backgroundColor: track.color === "#F7DF1E" ? "#C9B11C" : track.color }}
        >
          {done ? "復習する" : started ? "続きから学習" : "学習をはじめる"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={goTrack}
          className="flex items-center justify-center rounded-lg border border-[#242B36] px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:border-[#38404E] hover:text-zinc-200"
        >
          カリキュラム
        </button>
      </div>
    </div>
  );
}
