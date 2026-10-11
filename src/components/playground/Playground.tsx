"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanelLeft,
  Play,
  Save,
  Download,
  X,
  Loader2,
  CircleSlash,
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import ConsolePanel from "@/components/ConsolePanel";
import PreviewPanel from "@/components/PreviewPanel";
import FileTree, { type CreatingState } from "@/components/playground/FileTree";
import { useRunner } from "@/lib/runner";
import { buildPathIndex, buildPreviewDocument } from "@/lib/preview";
import {
  EXT_LABEL,
  UPLOADABLE_EXTS,
  extOf,
  languageOf,
  runKindOf,
} from "@/lib/languages";
import {
  descendantIds,
  makeNode,
  validateCreate,
  validateRename,
} from "@/lib/filetree";
import { initFiles, saveFiles } from "@/lib/storage";
import type { FileNodeDTO } from "@/lib/types";

function defaultContentFor(name: string, type: "file" | "folder"): string {
  if (type === "folder") return "";
  const ext = extOf(name);
  if (ext === "html")
    return [
      "<!doctype html>",
      '<html lang="ja">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>ドキュメント</title>",
      "</head>",
      "<body>",
      "  <h1>Hello</h1>",
      "</body>",
      "</html>",
      "",
    ].join("\n");
  if (ext === "css") return "/* " + name + " */\n\n";
  if (ext === "py") return "# " + name + "\n\n";
  if (ext === "md") return "# \n\n";
  return "// " + name + "\n\n";
}

export default function Playground({
  initialFileId = null,
}: {
  initialFileId?: string | null;
}) {
  const [nodes, setNodes] = useState<FileNodeDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState<CreatingState>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [outTab, setOutTab] = useState<"console" | "preview">("console");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const runner = useRunner();

  // 全画面モード中は Esc で抜ける
  useEffect(() => {
    if (!previewFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFullscreen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [previewFullscreen]);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const activeNode = useMemo(
    () => nodes.find((n) => n.id === activeId && n.type === "file") ?? null,
    [nodes, activeId],
  );

  const dirtyOf = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return false;
      return drafts[id] !== undefined && drafts[id] !== node.content;
    },
    [nodes, drafts],
  );

  const anyDirty = useMemo(
    () => Object.keys(drafts).some((id) => dirtyOf(id)),
    [drafts, dirtyOf],
  );

  const showTreeError = (msg: string) => {
    setTreeError(msg);
    window.setTimeout(() => setTreeError(null), 5000);
  };

  /** state 更新と localStorage 永続化をまとめて行う */
  const persist = useCallback((next: FileNodeDTO[]) => {
    setNodes(next);
    if (!saveFiles(next)) {
      showTreeError(
        "保存に失敗しました。ブラウザの保存容量（localStorage）の上限に達した可能性があります。",
      );
    }
  }, []);

  // 初期ロード（ブラウザ内ストレージから）
  useEffect(() => {
    const initial = initFiles();
    setNodes(initial);
    setExpanded(
      Object.fromEntries(
        initial.filter((n) => n.type === "folder").map((n) => [n.id, true]),
      ),
    );
    // ダッシュボードの「最近更新したファイル」から指定開き
    if (initialFileId) {
      const target = initial.find(
        (n) => n.id === initialFileId && n.type === "file",
      );
      if (target) {
        setOpenIds([target.id]);
        setActiveId(target.id);
        setSelectedId(target.id);
      }
    }
    setLoaded(true);
  }, [initialFileId]);

  // 保存（ローカル）
  const saveFile = useCallback(
    (id: string) => {
      const node = nodesRef.current.find((n) => n.id === id);
      const content = draftsRef.current[id];
      if (!node || content === undefined || content === node.content) return;
      const next = nodesRef.current.map((n) =>
        n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n,
      );
      persist(next);
      setLastSavedAt(new Date());
    },
    [persist],
  );
  const saveFileRef = useRef(saveFile);
  saveFileRef.current = saveFile;

  const onChangeCode = useCallback((id: string, value: string) => {
    setDrafts((d) => ({ ...d, [id]: value }));
    const timers = timersRef.current;
    const existing = timers.get(id);
    if (existing) clearTimeout(existing);
    timers.set(
      id,
      setTimeout(() => {
        saveFileRef.current(id);
      }, 1200),
    );
  }, []);

  // 未保存のまま離脱するのを防止
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (anyDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [anyDirty]);

  // ---- ツリー操作 ----

  const targetFolder = (): string | null => {
    const sel = nodesRef.current.find((n) => n.id === selectedIdRef.current);
    if (!sel) return null;
    return sel.type === "folder" ? sel.id : sel.parentId;
  };

  const handleSelect = (node: FileNodeDTO) => {
    setSelectedId(node.id);
    if (node.type === "folder") {
      setExpanded((e) => ({ ...e, [node.id]: !e[node.id] }));
    } else {
      setOpenIds((ids) => (ids.includes(node.id) ? ids : [...ids, node.id]));
      setActiveId(node.id);
      setCreating(null);
      setRenamingId(null);
    }
  };

  const handleStartCreate = (state: CreatingState) => {
    setRenamingId(null);
    setCreating(state);
    if (state?.parentId) {
      setExpanded((e) => ({ ...e, [state.parentId!]: true }));
    }
  };

  const handleSubmitCreate = (name: string) => {
    if (!creating) return;
    const state = creating;
    setCreating(null);
    if (!name) return;

    const error = validateCreate(nodesRef.current, state.parentId, name);
    if (error) {
      showTreeError(error);
      return;
    }
    const node = makeNode(
      state.parentId,
      state.type,
      name,
      defaultContentFor(name, state.type),
    );
    persist([...nodesRef.current, node]);
    setSelectedId(node.id);
    if (node.type === "file") {
      setOpenIds((ids) => [...ids, node.id]);
      setActiveId(node.id);
    }
  };

  const handleSubmitRename = (name: string) => {
    const id = renamingId;
    setRenamingId(null);
    if (!id || !name) return;
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node || node.name === name) return;

    const error = validateRename(nodesRef.current, id, name);
    if (error) {
      showTreeError(error);
      return;
    }
    persist(
      nodesRef.current.map((n) =>
        n.id === id ? { ...n, name, updatedAt: new Date().toISOString() } : n,
      ),
    );
  };

  const handleDelete = (node: FileNodeDTO) => {
    const message =
      node.type === "folder"
        ? `フォルダ「${node.name}」と中身のすべてを削除します。よろしいですか？`
        : `「${node.name}」を削除します。よろしいですか？`;
    if (!window.confirm(message)) return;

    const ids = [node.id, ...descendantIds(nodesRef.current, node.id)];
    persist(nodesRef.current.filter((n) => !ids.includes(n.id)));
    setOpenIds((prev) => prev.filter((id) => !ids.includes(id)));
    setDrafts((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    if (activeId && ids.includes(activeId)) setActiveId(null);
    if (selectedId && ids.includes(selectedId)) setSelectedId(null);
  };

  const handleUpload = async (fileList: FileList) => {
    const parentId = targetFolder();
    const failures: string[] = [];
    const created: FileNodeDTO[] = [];

    for (const file of Array.from(fileList)) {
      const ext = extOf(file.name);
      if (!UPLOADABLE_EXTS.has(ext)) {
        failures.push(`${file.name}: 対応していない拡張子です`);
        continue;
      }
      if (file.size > 200 * 1024) {
        failures.push(`${file.name}: 200KB を超えています`);
        continue;
      }
      const text = await file.text();
      const current = [...nodesRef.current, ...created];
      const error = validateCreate(current, parentId, file.name);
      if (error) {
        failures.push(`${file.name}: ${error}`);
        continue;
      }
      created.push(makeNode(parentId, "file", file.name, text));
    }

    if (created.length > 0) {
      persist([...nodesRef.current, ...created]);
      const last = created[created.length - 1];
      setSelectedId(last.id);
      if (parentId) setExpanded((e) => ({ ...e, [parentId]: true }));
    }
    if (failures.length > 0) showTreeError(failures.join(" / "));
  };

  // ---- 実行 ----

  const runningRef = useRef(false);
  const run = useCallback(async () => {
    if (runningRef.current) return;
    const node = nodesRef.current.find((n) => n.id === activeId);
    if (!node || node.type !== "file") return;
    const kind = runKindOf(node.name);
    if (kind === "none") return;
    runningRef.current = true;
    try {
      saveFileRef.current(node.id);
      const content = draftsRef.current[node.id] ?? node.content;
      if (kind === "preview") {
        const previewNodes = nodesRef.current.map((n) => ({
          ...n,
          content: draftsRef.current[n.id] ?? n.content,
        }));
        const { resolve } = buildPathIndex(previewNodes);
        const doc = buildPreviewDocument(content, (rel) => resolve(node.id, rel));
        setPreviewHtml(doc);
        setOutTab("preview");
        runner.push("system", `プレビューを更新しました — ${node.name}`);
      } else {
        setOutTab("console");
        runner.push(
          "system",
          `── ${node.name} を実行 ${new Date().toLocaleTimeString("ja-JP", { hour12: false })} ──`,
        );
        const ext = extOf(node.name);
        if (ext === "py") await runner.runPython(content);
        else if (ext === "ts") await runner.runTypeScript(content);
        else await runner.runJavaScript(content);
      }
    } finally {
      runningRef.current = false;
    }
  }, [activeId, runner]);

  // ---- タブ ----

  const closeTab = (id: string) => {
    if (dirtyOf(id)) {
      const node = nodesRef.current.find((n) => n.id === id);
      if (!window.confirm(`「${node?.name}」の未保存の変更を破棄しますか？`)) return;
    }
    setOpenIds((prev) => prev.filter((x) => x !== id));
    if (activeId === id) {
      const idx = openIds.indexOf(id);
      const next = openIds.filter((x) => x !== id);
      setActiveId(next[Math.max(0, idx - 1)] ?? null);
    }
  };

  const downloadActive = () => {
    if (!activeNode) return;
    const content = drafts[activeNode.id] ?? activeNode.content;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeNode.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { pathOf } = useMemo(() => buildPathIndex(nodes), [nodes]);
  const activePath = activeId ? pathOf(activeId).join(" / ") : null;
  const activeKind = activeNode ? runKindOf(activeNode.name) : "none";
  const activeDirty = activeId ? dirtyOf(activeId) : false;

  if (!loaded) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        フリースペースを読み込み中…
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden">
      {previewFullscreen && previewHtml !== null && (
        <PreviewPanel
          html={previewHtml}
          onEntry={runner.push}
          fullscreen
          onFullscreenChange={setPreviewFullscreen}
        />
      )}
      {/* サイドバー */}
      {treeOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setTreeOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-[#1D2129] bg-[#0C0E11] md:static md:z-auto">
            <FileTree
              nodes={nodes}
              activeId={activeId}
              selectedId={selectedId}
              expanded={expanded}
              creating={creating}
              renamingId={renamingId}
              error={treeError}
              onSelect={(n) => handleSelect(n)}
              onToggleFolder={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
              onStartCreate={handleStartCreate}
              onSubmitCreate={handleSubmitCreate}
              onCancelCreate={() => setCreating(null)}
              onStartRename={setRenamingId}
              onSubmitRename={handleSubmitRename}
              onCancelRename={() => setRenamingId(null)}
              onDelete={handleDelete}
              onUpload={handleUpload}
            />
          </aside>
        </>
      )}

      {/* メイン */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* タブバー + アクション */}
        <div className="flex h-11 shrink-0 items-center border-b border-[#1D2129] bg-[#0C0E11]">
          <button
            onClick={() => setTreeOpen((v) => !v)}
            title="ファイルツリーの表示切替"
            className="mx-2 rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-0.5 self-stretch overflow-x-auto">
            {openIds.map((id) => {
              const node = nodes.find((n) => n.id === id);
              if (!node) return null;
              const dirty = dirtyOf(id);
              const active = id === activeId;
              return (
                <div
                  key={id}
                  onClick={() => setActiveId(id)}
                  className={`group flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[12px] whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#7C9CFF]/[0.14] text-zinc-100"
                      : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
                  }`}
                >
                  {node.name}
                  {dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(id);
                    }}
                    className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
                    title="閉じる"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 px-2">
            <button
              onClick={downloadActive}
              disabled={!activeNode}
              title="このファイルをダウンロード"
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-zinc-200 disabled:opacity-30"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => activeId && saveFile(activeId)}
              disabled={!activeId || !activeDirty}
              title="保存 （⌘/Ctrl + S）"
              className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
            >
              <Save className="h-3.5 w-3.5" />
              保存
            </button>
            <button
              onClick={run}
              disabled={!activeNode || activeKind === "none" || runner.status !== "idle"}
              title="実行 （⌘/Ctrl + Enter）"
              className="flex items-center gap-1.5 rounded-md bg-[#2F6BFF] px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#4480ff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" />
              {activeKind === "preview" ? "プレビュー" : "実行"}
            </button>
          </div>
        </div>

        {/* エディタ + 出力 */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 min-w-0 flex-1">
            {activeNode ? (
              <CodeEditor
                key={activeNode.id}
                value={drafts[activeNode.id] ?? activeNode.content}
                language={languageOf(activeNode.name)}
                onChange={(v) => onChangeCode(activeNode.id, v)}
                onRunShortcut={run}
                onSaveShortcut={() => saveFile(activeNode.id)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
                <PanelLeft className="h-8 w-8 opacity-40" />
                <p className="text-[13px]">
                  左のツリーからファイルを開くか、新しく作成してください。
                </p>
              </div>
            )}
          </div>
          <div className="flex h-[38%] min-h-0 shrink-0 flex-col border-t border-[#1D2129] md:h-auto md:w-[42%] md:border-t-0 md:border-l">
            <div className="flex h-9 shrink-0 items-center gap-1 border-b border-[#1D2129] bg-[#0C0E11] px-2">
              {(
                [
                  { id: "console", label: "出力" },
                  { id: "preview", label: "プレビュー" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOutTab(t.id)}
                  className={`rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    outTab === t.id
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1">
              {outTab === "console" ? (
                <ConsolePanel
                  entries={runner.entries}
                  status={runner.status}
                  onClear={runner.clear}
                />
              ) : (
                <PreviewPanel
                  html={previewHtml}
                  onEntry={runner.push}
                  onFullscreenChange={setPreviewFullscreen}
                />
              )}
            </div>
          </div>
        </div>

        {/* ステータスバー */}
        <div className="flex h-7 shrink-0 items-center gap-4 border-t border-[#1D2129] bg-[#0C0E11] px-3 text-[11px] text-zinc-500">
          {activeNode ? (
            <>
              <span className="truncate font-[family-name:var(--font-jb-mono)]">
                {activePath}
              </span>
              <span>{EXT_LABEL[extOf(activeNode.name)] ?? "Plain Text"}</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <CircleSlash className="h-3 w-3" />
              ファイル未選択
            </span>
          )}
          <span className="ml-auto flex items-center gap-3">
            {activeNode && activeKind === "none" && (
              <span className="text-zinc-600">このファイルは直接実行できません</span>
            )}
            {activeDirty ? (
              <span className="text-amber-400/90">未保存の変更（自動保存されます）</span>
            ) : lastSavedAt ? (
              <span className="text-zinc-600">
                保存済み {lastSavedAt.toLocaleTimeString("ja-JP", { hour12: false })}
              </span>
            ) : null}
            <span className="hidden text-zinc-600 lg:inline">⌘S 保存 / ⌘↵ 実行</span>
          </span>
        </div>
      </div>
    </div>
  );
}
