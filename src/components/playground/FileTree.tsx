"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  FileCode2,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import type { FileNodeDTO } from "@/lib/types";
import { EXT_COLOR, extOf } from "@/lib/languages";

export type CreatingState = { parentId: string | null; type: "file" | "folder" } | null;

type Props = {
  nodes: FileNodeDTO[];
  activeId: string | null;
  selectedId: string | null;
  expanded: Record<string, boolean>;
  creating: CreatingState;
  renamingId: string | null;
  error: string | null;
  onSelect: (node: FileNodeDTO) => void;
  onToggleFolder: (id: string) => void;
  onStartCreate: (state: CreatingState) => void;
  onSubmitCreate: (name: string) => void;
  onCancelCreate: () => void;
  onStartRename: (id: string) => void;
  onSubmitRename: (name: string) => void;
  onCancelRename: () => void;
  onDelete: (node: FileNodeDTO) => void;
  onUpload: (files: FileList) => void;
};

function fileIcon(name: string) {
  const ext = extOf(name);
  if (["js", "ts", "py", "html", "css", "json", "sql"].includes(ext)) return FileCode2;
  if (ext === "md" || ext === "txt") return FileText;
  return FileIcon;
}

function InlineNameInput({
  initial,
  onSubmit,
  onCancel,
  placeholder,
}: {
  initial: string;
  onSubmit: (v: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    if (initial.includes(".")) {
      const dot = initial.lastIndexOf(".");
      ref.current?.setSelectionRange(0, dot);
    } else {
      ref.current?.select();
    }
  }, [initial]);

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(value.trim());
  };

  return (
    <input
      ref={ref}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") onCancel();
      }}
      onBlur={() => {
        if (!submittedRef.current) submit();
      }}
      className="w-full rounded border border-[#7C9CFF]/60 bg-[#0C0E12] px-1.5 py-0.5 text-[12px] text-zinc-100 outline-none"
    />
  );
}

export default function FileTree({
  nodes,
  activeId,
  selectedId,
  expanded,
  creating,
  renamingId,
  error,
  onSelect,
  onToggleFolder,
  onStartCreate,
  onSubmitCreate,
  onCancelCreate,
  onStartRename,
  onSubmitRename,
  onCancelRename,
  onDelete,
  onUpload,
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, FileNodeDTO[]>();
    for (const n of nodes) {
      const key = n.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name, "ja");
      });
    }
    return map;
  }, [nodes]);

  const targetFolderForCreate: string | null = useMemo(() => {
    if (!selectedId) return null;
    const sel = nodes.find((n) => n.id === selectedId);
    if (!sel) return null;
    return sel.type === "folder" ? sel.id : sel.parentId;
  }, [nodes, selectedId]);

  const renderRows = (parentId: string | null, depth: number): React.ReactNode[] => {
    const list = childrenOf.get(parentId) ?? [];
    const rows: React.ReactNode[] = [];

    for (const node of list) {
      const isFolder = node.type === "folder";
      const isOpen = !!expanded[node.id];
      const isActive = node.id === activeId;
      const isSelected = node.id === selectedId;
      const Icon = isFolder ? (isOpen ? FolderOpen : Folder) : fileIcon(node.name);
      const extColor = EXT_COLOR[extOf(node.name)];

      rows.push(
        <div
          key={node.id}
          onClick={() => onSelect(node)}
          onDoubleClick={() => isFolder && onToggleFolder(node.id)}
          className={`group relative flex h-7 cursor-pointer items-center gap-1.5 pr-1 text-[12.5px] transition-colors ${
            isActive
              ? "bg-[#7C9CFF]/[0.14] text-zinc-100"
              : isSelected
                ? "bg-white/[0.06] text-zinc-200"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          }`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          {isFolder ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolder(node.id);
              }}
              className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-600"
            >
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: isFolder ? "#8B93A1" : (extColor ?? "#8B93A1") }}
          />
          {renamingId === node.id ? (
            <span className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
              <InlineNameInput
                initial={node.name}
                placeholder="名前"
                onSubmit={onSubmitRename}
                onCancel={onCancelRename}
              />
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
          )}
          <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
            <button
              title="名前を変更"
              onClick={(e) => {
                e.stopPropagation();
                onStartRename(node.id);
              }}
              className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              title="削除"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="rounded p-1 text-zinc-500 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        </div>,
      );

      if (isFolder && isOpen) {
        rows.push(...renderRows(node.id, depth + 1));
        if (creating?.parentId === node.id) {
          rows.push(renderCreateRow(depth + 1));
        }
      }
    }

    if (parentId === null && creating?.parentId === null) {
      rows.push(renderCreateRow(0));
    }
    return rows;
  };

  const renderCreateRow = (depth: number) => (
    <div
      key="__creating__"
      className="flex h-7 items-center gap-1.5 pr-1"
      style={{ paddingLeft: `${8 + depth * 14 + 16}px` }}
    >
      {creating?.type === "folder" ? (
        <Folder className="h-3.5 w-3.5 shrink-0 text-[#8B93A1]" />
      ) : (
        <FileIcon className="h-3.5 w-3.5 shrink-0 text-[#8B93A1]" />
      )}
      <InlineNameInput
        initial={creating?.type === "folder" ? "新規フォルダ" : ""}
        placeholder={creating?.type === "folder" ? "フォルダ名" : "example.js"}
        onSubmit={onSubmitCreate}
        onCancel={onCancelCreate}
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[#1D2129] px-2.5">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
          Files
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            title="新規ファイル（選択中のフォルダ内）"
            onClick={() => onStartCreate({ parentId: targetFolderForCreate, type: "file" })}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
          </button>
          <button
            title="新規フォルダ（選択中のフォルダ内）"
            onClick={() => onStartCreate({ parentId: targetFolderForCreate, type: "folder" })}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            title="ファイルをアップロード"
            onClick={() => uploadRef.current?.click()}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          <input
            ref={uploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) onUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && (
        <p className="shrink-0 border-b border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-[11.5px] leading-snug text-red-300">
          {error}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
        {nodes.length === 0 && !creating ? (
          <p className="px-4 py-6 text-[12px] leading-relaxed text-zinc-600">
            まだファイルがありません。
            <br />
            右上のボタンから作成するか、ファイルをアップロードしてください。
          </p>
        ) : (
          renderRows(null, 0)
        )}
      </div>
    </div>
  );
}
