"use client";

import { Loader2 } from "lucide-react";
import TrackCard from "@/components/TrackCard";
import type { AppView, TrackDTO } from "@/lib/types";

export default function LearnIndexView({
  tracks,
  onNavigate,
}: {
  tracks: TrackDTO[] | null;
  onNavigate: (view: AppView) => void;
}) {
  if (!tracks) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        読み込み中…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <p className="font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-[#7C9CFF] uppercase">
        Learn — Curriculum
      </p>
      <h1 className="mt-3 text-[26px] font-bold tracking-tight text-zinc-50">
        学習モード
      </h1>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-7 text-zinc-400">
        言語ごとのカリキュラムを順に進めるチュートリアルです。各レッスンは
        「解説を読む → 演習コードを書く → 実行して確認する」という流れで構成されています。
        出力が期待結果と一致すると、レッスンは自動で完了になります。
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t) => (
          <TrackCard key={t.slug} track={t} onNavigate={onNavigate} />
        ))}
      </div>
    </main>
  );
}
