"use client";

import { useCallback, useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import DashboardView from "@/components/views/DashboardView";
import LearnIndexView from "@/components/views/LearnIndexView";
import TrackView from "@/components/views/TrackView";
import LessonView from "@/components/views/LessonView";
import Playground from "@/components/playground/Playground";
import { buildTracks, type ProgressMap } from "@/lib/content";
import { loadProgress } from "@/lib/storage";
import type { AppView } from "@/lib/types";

const VIEW_TITLES: Record<AppView["kind"], string> = {
  dashboard: "CodeBase — プログラミング学習プラットフォーム",
  learn: "学習モード | CodeBase",
  track: "カリキュラム | CodeBase",
  lesson: "レッスン | CodeBase",
  playground: "フリースペース | CodeBase",
};

export default function AppShell() {
  const [view, setView] = useState<AppView>({ kind: "dashboard" });
  const [progress, setProgress] = useState<ProgressMap | null>(null);

  const reloadProgress = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    reloadProgress();
  }, [reloadProgress]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    document.title = VIEW_TITLES[view.kind];
  }, [view]);

  const tracks = progress ? buildTracks(progress) : null;
  const total = tracks?.reduce((a, t) => a + t.lessonCount, 0) ?? 0;
  const completed = tracks?.reduce((a, t) => a + t.completedCount, 0) ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        current={view.kind}
        onNavigate={setView}
        totalLessons={total}
        completedLessons={completed}
      />
      {view.kind === "dashboard" && (
        <DashboardView tracks={tracks} onNavigate={setView} />
      )}
      {view.kind === "learn" && (
        <LearnIndexView tracks={tracks} onNavigate={setView} />
      )}
      {view.kind === "track" && progress && (
        <TrackView
          key={view.trackSlug}
          trackSlug={view.trackSlug}
          progress={progress}
          onNavigate={setView}
        />
      )}
      {view.kind === "lesson" && progress && (
        <LessonView
          key={`${view.trackSlug}/${view.lessonSlug}`}
          trackSlug={view.trackSlug}
          lessonSlug={view.lessonSlug}
          progress={progress}
          onNavigate={setView}
          onProgressChanged={reloadProgress}
        />
      )}
      {view.kind === "playground" && (
        <Playground
          key={view.fileId ?? "default"}
          initialFileId={view.fileId ?? null}
        />
      )}
    </div>
  );
}
