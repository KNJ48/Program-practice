"use client";

import { useRef, useCallback } from "react";
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

type Props = {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  onRunShortcut?: () => void;
  onSaveShortcut?: () => void;
  readOnly?: boolean;
  height?: string;
};

const beforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("codebase-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6B7688", fontStyle: "italic" },
      { token: "keyword", foreground: "7C9CFF" },
      { token: "string", foreground: "A5D6A7" },
      { token: "number", foreground: "F2B97C" },
    ],
    colors: {
      "editor.background": "#0C0E12",
      "editor.lineHighlightBackground": "#FFFFFF07",
      "editorLineNumber.foreground": "#39414E",
      "editorLineNumber.activeForeground": "#7C9CFF",
      "editorCursor.foreground": "#7C9CFF",
      "editorIndentGuide.background1": "#FFFFFF0A",
      "editorIndentGuide.activeBackground1": "#FFFFFF1E",
      "editorWidget.background": "#12151B",
      "editorWidget.border": "#242A35",
      "editor.selectionBackground": "#7C9CFF33",
      "scrollbar.shadow": "#00000000",
      "minimap.background": "#0C0E12",
    },
  });
};

export default function CodeEditor({
  value,
  language,
  onChange,
  onRunShortcut,
  onSaveShortcut,
  readOnly,
  height = "100%",
}: Props) {
  const runRef = useRef(onRunShortcut);
  runRef.current = onRunShortcut;
  const saveRef = useRef(onSaveShortcut);
  saveRef.current = onSaveShortcut;

  const onMount: OnMount = useCallback((editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runRef.current?.();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveRef.current?.();
    });
  }, []);

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      theme="codebase-dark"
      beforeMount={beforeMount}
      onMount={onMount}
      loading={
        <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          エディタを読み込み中…
        </div>
      }
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13.5,
        fontFamily: "var(--font-jb-mono), Consolas, monospace",
        fontLigatures: false,
        lineHeight: 1.65,
        padding: { top: 14, bottom: 14 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        tabSize: 2,
        renderLineHighlight: "all",
        automaticLayout: true,
        fixedOverflowWidgets: true,
        wordWrap: "off",
      }}
    />
  );
}
