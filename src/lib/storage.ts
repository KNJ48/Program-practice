"use client";

/**
 * ブラウザ（localStorage）への永続化レイヤー。
 * 外部データベースは使わず、進捗とフリースペースのファイルを保存する。
 */
import { PLAYGROUND_SAMPLES } from "@/content";
import type { ProgressMap } from "@/lib/content";
import type { FileNodeDTO } from "@/lib/types";

const PROGRESS_KEY = "codebase:progress:v1";
const FILES_KEY = "codebase:files:v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/* ---- 学習進捗 ---- */

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  return safeParse<ProgressMap>(window.localStorage.getItem(PROGRESS_KEY)) ?? {};
}

export function setLessonProgress(lessonId: string, completed: boolean): void {
  const map = loadProgress();
  map[lessonId] = completed;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // 容量オーバー時は無視（進捗データは微小なので通常起きない）
  }
}

/* ---- フリースペース ---- */

export function loadFiles(): FileNodeDTO[] | null {
  if (typeof window === "undefined") return null;
  return safeParse<FileNodeDTO[]>(window.localStorage.getItem(FILES_KEY));
}

/** 保存。容量超過で失敗したら false を返す */
export function saveFiles(nodes: FileNodeDTO[]): boolean {
  try {
    window.localStorage.setItem(FILES_KEY, JSON.stringify(nodes));
    return true;
  } catch {
    return false;
  }
}

/** 初回利用時にサンプルプロジェクトを展開して保存する */
export function initFiles(): FileNodeDTO[] {
  const existing = loadFiles();
  if (existing) return existing;

  const nodes: FileNodeDTO[] = [];
  const idByPath = new Map<string, string>();
  const now = new Date().toISOString();

  for (const sample of PLAYGROUND_SAMPLES) {
    const id = crypto.randomUUID();
    const parentId = sample.parent ? (idByPath.get(sample.parent) ?? null) : null;
    nodes.push({
      id,
      parentId,
      type: sample.type,
      name: sample.name,
      content: sample.content ?? "",
      updatedAt: now,
    });
    const path = sample.parent ? `${sample.parent}/${sample.name}` : sample.name;
    idByPath.set(path, id);
  }
  saveFiles(nodes);
  return nodes;
}
