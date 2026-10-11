"use client";

import { BookOpen, FolderGit2, LayoutDashboard, SquareTerminal } from "lucide-react";
import type { AppView } from "@/lib/types";

const NAV: { kind: AppView["kind"]; label: string; icon: typeof BookOpen }[] = [
  { kind: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { kind: "learn", label: "学習モード", icon: BookOpen },
  { kind: "playground", label: "フリースペース", icon: FolderGit2 },
];

export default function SiteHeader({
  current,
  onNavigate,
  totalLessons,
  completedLessons,
}: {
  current: AppView["kind"];
  onNavigate: (view: AppView) => void;
  totalLessons: number;
  completedLessons: number;
}) {
  const pct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[#1D2129] bg-[#0A0C0F]/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-4 md:px-6">
        <button
          onClick={() => onNavigate({ kind: "dashboard" })}
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#7C9CFF]/15 text-[#7C9CFF] transition-colors group-hover:bg-[#7C9CFF]/25">
            <SquareTerminal className="h-4 w-4" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[14.5px] font-bold tracking-tight text-zinc-50">
              CodeBase
            </span>
            <span className="mt-0.5 hidden text-[9.5px] tracking-[0.16em] text-zinc-500 sm:block">
              PROGRAMMING LEARNING
            </span>
          </span>
        </button>

        <nav className="flex h-full items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.kind === "dashboard"
                ? current === "dashboard"
                : item.kind === "learn"
                  ? current === "learn" || current === "track" || current === "lesson"
                  : current === "playground";
            return (
              <button
                key={item.kind}
                onClick={() => onNavigate({ kind: item.kind } as AppView)}
                className={`relative flex h-full items-center gap-1.5 px-3 text-[12.5px] font-medium transition-colors ${
                  active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[#7C9CFF]" />
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => onNavigate({ kind: "learn" })}
          className="ml-auto flex items-center gap-2 rounded-full border border-[#242B36] bg-[#101318] py-1 pr-3 pl-1.5 transition-colors hover:border-[#7C9CFF]/40"
          title="全体の学習進捗"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <svg viewBox="0 0 20 20" className="h-5 w-5 -rotate-90">
              <circle cx="10" cy="10" r="8" fill="none" stroke="#242B36" strokeWidth="3" />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="#34D399"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 50.3} 50.3`}
              />
            </svg>
          </span>
          <span className="font-[family-name:var(--font-jb-mono)] text-[11px] text-zinc-400">
            {completedLessons}
            <span className="text-zinc-600"> / {totalLessons} 完了</span>
          </span>
        </button>
      </div>
    </header>
  );
}
