"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  MonitorPlay,
  TerminalSquare,
} from "lucide-react";
import { buildTrackDetail, type ProgressMap } from "@/lib/content";
import type { AppView } from "@/lib/types";

export default function TrackView({
  trackSlug,
  progress,
  onNavigate,
}: {
  trackSlug: string;
  progress: ProgressMap;
  onNavigate: (view: AppView) => void;
}) {
  const track = buildTrackDetail(trackSlug, progress);

  if (!track) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-3 text-zinc-500">
        <p className="text-[14px]">カリキュラムが見つかりませんでした。</p>
        <button
          onClick={() => onNavigate({ kind: "learn" })}
          className="text-[13px] text-[#7C9CFF] hover:underline"
        >
          学習モードに戻る
        </button>
      </div>
    );
  }

  const pct =
    track.lessonCount > 0
      ? Math.round((track.completedCount / track.lessonCount) * 100)
      : 0;
  const isPreview = track.slug === "html" || track.slug === "css";
  const ModeIcon = isPreview ? MonitorPlay : TerminalSquare;

  const goLesson = (slug: string) =>
    onNavigate({ kind: "lesson", trackSlug: track.slug, lessonSlug: slug });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <button
        onClick={() => onNavigate({ kind: "learn" })}
        className="group flex w-fit items-center gap-1.5 text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        カリキュラム一覧に戻る
      </button>

      {/* ヘッダー */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#1D2129] bg-[#0E1013]">
        <div className="h-1" style={{ backgroundColor: track.color }} />
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[24px] font-bold"
              style={{ backgroundColor: track.color + "1A", color: track.color }}
            >
              {track.name.slice(0, 1)}
            </span>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-zinc-50">
                {track.name}
              </h1>
              <p className="text-[13px] font-medium" style={{ color: track.color }}>
                {track.subtitle}
              </p>
            </div>
          </div>
          <p className="mt-5 text-[13.5px] leading-7 text-zinc-400">
            {track.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
              <BookOpen className="h-3.5 w-3.5" />
              {track.lessonCount} レッスン
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {track.completedCount} 完了（{pct}%）
            </span>
            {track.nextLessonSlug && (
              <button
                onClick={() => goLesson(track.nextLessonSlug!)}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor:
                    track.color === "#F7DF1E" ? "#C9B11C" : track.color,
                }}
              >
                {track.completedCount > 0 ? "続きから再開" : "最初のレッスンへ"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: track.color }}
            />
          </div>
        </div>
      </div>

      {/* カリキュラム */}
      <h2 className="mt-10 font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
        Curriculum
      </h2>
      <ol className="mt-4 space-y-2">
        {track.lessons.map((lesson, i) => (
          <li key={lesson.id}>
            <button
              onClick={() => goLesson(lesson.slug)}
              className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all md:items-center ${
                lesson.completed
                  ? "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/35"
                  : "border-[#1D2129] bg-[#0E1013] hover:border-[#2C3442] hover:bg-[#101318]"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-jb-mono)] text-[13px] font-semibold ${
                  lesson.completed
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-white/[0.05] text-zinc-400"
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[14px] font-semibold ${
                    lesson.completed ? "text-zinc-300" : "text-zinc-100"
                  }`}
                >
                  {lesson.title}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-zinc-500">
                  {lesson.summary}
                </span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-[#242B36] px-2 py-1 text-[10px] text-zinc-500 sm:flex">
                <ModeIcon className="h-3 w-3" />
                {isPreview ? "プレビュー" : "コンソール"}
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300 md:mt-0" />
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}
