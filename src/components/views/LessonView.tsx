"use client";

import LessonShell from "@/components/learn/LessonShell";
import { buildLessonBundle, type ProgressMap } from "@/lib/content";
import type { AppView } from "@/lib/types";

export default function LessonView({
  trackSlug,
  lessonSlug,
  progress,
  onNavigate,
  onProgressChanged,
}: {
  trackSlug: string;
  lessonSlug: string;
  progress: ProgressMap;
  onNavigate: (view: AppView) => void;
  onProgressChanged?: () => void;
}) {
  const data = buildLessonBundle(trackSlug, lessonSlug, progress);

  if (!data) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-3 text-zinc-500">
        <p className="text-[14px]">レッスンが見つかりませんでした。</p>
        <button
          onClick={() => onNavigate({ kind: "track", trackSlug })}
          className="text-[13px] text-[#7C9CFF] hover:underline"
        >
          カリキュラムに戻る
        </button>
      </div>
    );
  }

  return (
    <LessonShell
      lesson={data.lesson}
      track={{ slug: data.track.slug, name: data.track.name, color: data.track.color }}
      siblings={data.siblings}
      prev={data.prev}
      next={data.next}
      onNavigate={onNavigate}
      onProgressChanged={onProgressChanged}
    />
  );
}
