"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Braces,
  FileCode2,
  FileText,
  FolderGit2,
  Loader2,
  MonitorPlay,
  TerminalSquare,
} from "lucide-react";
import TrackCard from "@/components/TrackCard";
import { initFiles } from "@/lib/storage";
import type { AppView, TrackDTO } from "@/lib/types";

type RecentFile = { id: string; name: string; updatedAt: string };

export default function DashboardView({
  tracks,
  onNavigate,
}: {
  tracks: TrackDTO[] | null;
  onNavigate: (view: AppView) => void;
}) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[] | null>(null);

  useEffect(() => {
    const files = initFiles()
      .filter((n) => n.type === "file")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((n) => ({ id: n.id, name: n.name, updatedAt: n.updatedAt }));
    setRecentFiles(files);
  }, []);

  if (!tracks) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        読み込み中…
      </div>
    );
  }

  const totalLessons = tracks.reduce((a, t) => a + t.lessonCount, 0);
  const totalCompleted = tracks.reduce((a, t) => a + t.completedCount, 0);
  const totalPct =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* ヒーロー */}
      <section>
        <p className="font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-[#7C9CFF] uppercase">
          CodeBase — Programming Learning Platform
        </p>
        <h1 className="mt-3 max-w-2xl text-[30px] leading-snug font-bold tracking-tight text-zinc-50 md:text-[38px]">
          コードを書いて、
          <br className="sm:hidden" />
          動かして、学ぶ。
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] leading-7 text-zinc-400">
          HTML・CSS・JavaScript・TypeScript・Python
          の5言語に対応した学習環境です。すべてのコードはブラウザ上で実行されるため、環境構築は不要。
          段階的なカリキュラムの「学習モード」と、自由にファイルを作成・実行できる「フリースペース」の2つを使い分けながら進められます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate({ kind: "learn" })}
            className="flex items-center gap-2 rounded-lg bg-[#2F6BFF] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#4480ff]"
          >
            <BookOpen className="h-4 w-4" />
            学習モードへ
          </button>
          <button
            onClick={() => onNavigate({ kind: "playground" })}
            className="flex items-center gap-2 rounded-lg border border-[#2A3341] bg-[#12151A] px-5 py-2.5 text-[13.5px] font-semibold text-zinc-200 transition-colors hover:border-[#3A4453] hover:bg-[#161A21]"
          >
            <FolderGit2 className="h-4 w-4" />
            フリースペースへ
          </button>
        </div>

        {/* 統計 */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#1D2129] bg-[#1D2129] md:grid-cols-4">
          {[
            { label: "学習できる言語", value: String(tracks.length), unit: "言語" },
            { label: "総レッスン数", value: String(totalLessons), unit: "本" },
            { label: "完了したレッスン", value: String(totalCompleted), unit: "本" },
            { label: "全体の進捗率", value: String(totalPct), unit: "%" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0E1013] px-5 py-4">
              <p className="text-[10.5px] tracking-wider text-zinc-500 uppercase">
                {s.label}
              </p>
              <p className="mt-1 font-[family-name:var(--font-jb-mono)] text-[24px] font-semibold text-zinc-100">
                {s.value}
                <span className="ml-1 text-[12px] font-normal text-zinc-500">
                  {s.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 学習モード */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
              Section 01 — Tutorial
            </p>
            <h2 className="mt-2 text-[20px] font-bold tracking-tight text-zinc-50">
              学習モード
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              チュートリアル形式のレッスン。解説を読み、演習を実行して進みます。
            </p>
          </div>
          <button
            onClick={() => onNavigate({ kind: "learn" })}
            className="hidden items-center gap-1 text-[12.5px] text-[#7C9CFF] transition-colors hover:text-[#9DB4FF] sm:flex"
          >
            すべてのカリキュラム
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <TrackCard key={t.slug} track={t} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* フリースペース */}
      <section className="mt-14">
        <p className="font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
          Section 02 — Workspace
        </p>
        <h2 className="mt-2 text-[20px] font-bold tracking-tight text-zinc-50">
          フリースペース
        </h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-[#1D2129] bg-[#0E1013]">
          <div className="grid md:grid-cols-2">
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C9CFF]/15 text-[#7C9CFF]">
                  <FolderGit2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-zinc-50">
                    自分だけの作業場
                  </h3>
                  <p className="text-[11.5px] text-zinc-500">
                    保存はすべてブラウザ内に永続化されます
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-[13px] leading-relaxed text-zinc-400">
                <li className="flex gap-2.5">
                  <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  フォルダを自由に作成し、ファイルを階層で整理できます
                </li>
                <li className="flex gap-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  手元のテキストファイル（.js / .py / .html / .css など）をアップロードして続きを書けます
                </li>
                <li className="flex gap-2.5">
                  <TerminalSquare className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  JavaScript / TypeScript / Python はワンクリックでコンソール実行
                </li>
                <li className="flex gap-2.5">
                  <MonitorPlay className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  HTML はプレビュー表示。同じ場所の CSS / JS を相対パスで自動読み込みします
                </li>
              </ul>
              <button
                onClick={() => onNavigate({ kind: "playground" })}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#7C9CFF]/40 bg-[#7C9CFF]/10 px-5 py-2.5 text-[13px] font-semibold text-[#A9BDFF] transition-colors hover:bg-[#7C9CFF]/20"
              >
                フリースペースを開く
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="border-t border-[#1D2129] bg-[#0B0D10] p-6 md:border-t-0 md:border-l">
              <p className="text-[10.5px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                最近更新したファイル
              </p>
              {recentFiles === null ? (
                <p className="mt-4 flex items-center gap-2 text-[12.5px] text-zinc-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  読み込み中…
                </p>
              ) : recentFiles.length === 0 ? (
                <p className="mt-4 text-[12.5px] text-zinc-600">
                  まだファイルがありません。フリースペースで作成すると、ここに表示されます。
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {recentFiles.map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() =>
                          onNavigate({ kind: "playground", fileId: f.id })
                        }
                        className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <Braces className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-[#7C9CFF]" />
                        <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-jb-mono)] text-[12.5px] text-zinc-300">
                          {f.name}
                        </span>
                        <span className="font-[family-name:var(--font-jb-mono)] text-[10.5px] text-zinc-600">
                          {new Date(f.updatedAt).toLocaleString("ja-JP", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 実行環境について */}
      <section className="mt-14 mb-4">
        <p className="font-[family-name:var(--font-jb-mono)] text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
          Section 03 — Runtime
        </p>
        <h2 className="mt-2 text-[20px] font-bold tracking-tight text-zinc-50">
          実行環境について
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: TerminalSquare,
              title: "JavaScript / TypeScript",
              body: "サンドボックス化された iframe 内で安全にコードを実行し、console.log の内容をリアルタイムに表示します。TypeScript はブラウザ内で JavaScript に変換してから実行します。",
            },
            {
              icon: Braces,
              title: "Python（Pyodide）",
              body: "CPython を WebAssembly に移植した Pyodide により、本物の Python がブラウザ内で動きます。初回実行時のみランタイムのダウンロードに数秒かかります。",
            },
            {
              icon: MonitorPlay,
              title: "HTML / CSS",
              body: "HTMLファイルはライブプレビューで描画します。link / script タグの相対パス参照を解決し、同じフォルダにある CSS や JS を自動で読み込みます。",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-[#1D2129] bg-[#0E1013] p-5"
            >
              <c.icon className="h-5 w-5 text-[#7C9CFF]" />
              <h3 className="mt-3 text-[14px] font-bold text-zinc-100">{c.title}</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-500">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
