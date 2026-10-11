"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ListChecks,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import ExercisePanel from "@/components/learn/ExercisePanel";
import { setLessonProgress } from "@/lib/storage";
import type { AppView, LessonDetailDTO, LessonListItemDTO } from "@/lib/types";

type Props = {
  lesson: LessonDetailDTO;
  track: { slug: string; name: string; color: string };
  siblings: LessonListItemDTO[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  onNavigate: (view: AppView) => void;
  onProgressChanged?: () => void;
};

export default function LessonShell({
  lesson,
  track,
  siblings,
  prev,
  next,
  onNavigate,
  onProgressChanged,
}: Props) {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(siblings.map((s) => [s.id, s.completed])),
  );
  const [saving, setSaving] = useState(false);

  const completedCount = useMemo(
    () => siblings.filter((s) => doneMap[s.id]).length,
    [siblings, doneMap],
  );
  const completed = doneMap[lesson.id] ?? false;

  function setProgress(completedNext: boolean) {
    setDoneMap((m) => ({ ...m, [lesson.id]: completedNext }));
    setSaving(true);
    setLessonProgress(lesson.id, completedNext);
    onProgressChanged?.();
    setSaving(false);
  }

  const currentIndex = siblings.findIndex((s) => s.id === lesson.id);
  const goTrack = () => onNavigate({ kind: "track", trackSlug: track.slug });
  const goLesson = (slug: string) =>
    onNavigate({ kind: "lesson", trackSlug: track.slug, lessonSlug: slug });

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      {/* サイドバー: レッスン一覧 */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[#1D2129] bg-[#0C0E11] lg:flex">
        <div className="border-b border-[#1D2129] p-4">
          <button
            onClick={goTrack}
            className="group flex items-center gap-1.5 text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            カリキュラムに戻る
          </button>
          <div className="mt-3 flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-bold"
              style={{ backgroundColor: track.color + "1A", color: track.color }}
            >
              {track.name.slice(0, 1)}
            </span>
            <div className="text-left">
              <p className="text-[14px] font-semibold text-zinc-100">{track.name}</p>
              <p className="text-[11px] text-zinc-500">
                {completedCount} / {siblings.length} レッスン完了
              </p>
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / Math.max(1, siblings.length)) * 100}%`,
                backgroundColor: track.color,
              }}
            />
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2">
          {siblings.map((s, i) => {
            const isCurrent = s.id === lesson.id;
            const isDone = doneMap[s.id];
            return (
              <button
                key={s.id}
                onClick={() => goLesson(s.slug)}
                className={`mb-0.5 flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isCurrent
                    ? "bg-[#7C9CFF]/[0.12] text-zinc-100"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                    isDone
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                      : isCurrent
                        ? "border-[#7C9CFF]/60 text-[#7C9CFF]"
                        : "border-zinc-700 text-zinc-600"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] leading-snug font-medium">
                    {s.title}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 本文 */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-6 py-8 pb-16">
          <p
            className="text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: track.color }}
          >
            {track.name} — LESSON {String(currentIndex + 1).padStart(2, "0")}
          </p>
          <h1 className="mt-2 text-[26px] leading-tight font-bold tracking-tight text-zinc-50">
            {lesson.title}
          </h1>
          <p className="mt-1.5 text-[14px] text-zinc-500">{lesson.summary}</p>

          <div className="mt-4 border-t border-[#1D2129] pt-2 lg:hidden">
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-[#2A3341] bg-[#12151A] px-3 py-2.5 text-[12.5px] text-zinc-400">
              <ListChecks className="h-4 w-4 shrink-0 text-[#7C9CFF]" />
              画面が狭いため演習エリアは本文の下に表示されます。PC
              に近い環境では左右に並びます。
            </p>
          </div>

          <article className="mt-2">
            <Markdown content={lesson.content} />
          </article>

          {/* モバイル用演習 */}
          <div className="mt-8 h-[560px] overflow-hidden rounded-xl border border-[#1D2129] lg:hidden">
            <ExercisePanel
              key={lesson.id}
              language={lesson.language}
              starterCode={lesson.starterCode}
              solutionCode={lesson.solutionCode}
              expectedOutput={lesson.expectedOutput}
              accent={track.color}
              onPassed={() => setProgress(true)}
            />
          </div>

          {/* 完了 & ナビゲーション */}
          <div className="mt-10 border-t border-[#1D2129] pt-6">
            <button
              onClick={() => setProgress(!completed)}
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[14px] font-medium transition-colors ${
                completed
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  : "border-[#2A3341] bg-[#12151A] text-zinc-300 hover:border-[#7C9CFF]/40 hover:text-zinc-100"
              }`}
            >
              <CircleCheck className="h-4.5 w-4.5" />
              {completed ? "完了済み（クリックで未完了に戻す）" : "このレッスンを完了にする"}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {prev ? (
                <button
                  onClick={() => goLesson(prev.slug)}
                  className="group flex items-center gap-2 rounded-lg border border-[#1D2129] bg-[#0E1013] px-4 py-3 text-left transition-colors hover:border-[#2A3341] hover:bg-[#12151A]"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[10.5px] tracking-wider text-zinc-600 uppercase">
                      前のレッスン
                    </span>
                    <span className="block truncate text-[12.5px] font-medium text-zinc-300">
                      {prev.title}
                    </span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  onClick={() => goLesson(next.slug)}
                  className="group flex items-center justify-end gap-2 rounded-lg border border-[#1D2129] bg-[#0E1013] px-4 py-3 text-right transition-colors hover:border-[#2A3341] hover:bg-[#12151A]"
                >
                  <span className="min-w-0">
                    <span className="block text-[10.5px] tracking-wider text-zinc-600 uppercase">
                      次のレッスン
                    </span>
                    <span className="block truncate text-[12.5px] font-medium text-zinc-300">
                      {next.title}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button
                  onClick={goTrack}
                  className="flex items-center justify-end gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3 text-[13px] font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10"
                >
                  トラック最後のレッスン。カリキュラムへ戻る
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 演習（デスクトップ右ペイン） */}
      <div className="hidden w-[46%] shrink-0 border-l border-[#1D2129] lg:block">
        <ExercisePanel
          key={lesson.id}
          language={lesson.language}
          starterCode={lesson.starterCode}
          solutionCode={lesson.solutionCode}
          expectedOutput={lesson.expectedOutput}
          accent={track.color}
          onPassed={() => setProgress(true)}
        />
      </div>
    </div>
  );
}
