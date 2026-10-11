/**
 * ファイル名・拡張子・プログラミング言語の管理
 */

// ========================================
// ファイル名バリデーション
// ========================================

export function isValidNodeName(name: string): boolean {
  if (typeof name !== "string") return false;

  if (name.length < 1 || name.length > 64) {
    return false;
  }

  if (name.trim().length === 0) {
    return false;
  }

  if (/[\/\\:*?"<>|]/.test(name)) {
    return false;
  }

  if (/[\x00-\x1F\x7F]/.test(name)) {
    return false;
  }

  return true;
}

// ========================================
// 拡張子取得
// ========================================

export function extOf(filename: string): string {
  const name = filename.split("/").pop() ?? filename;

  const index = name.lastIndexOf(".");

  if (index <= 0) return "";

  return name.slice(index + 1).toLowerCase();
}

// ========================================
// 拡張子ラベル
// ========================================

export const EXT_LABEL: Record<string, string> = {
  js: "JavaScript",
  jsx: "React JSX",
  ts: "TypeScript",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  py: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  h: "C Header",
  cs: "C#",
  go: "Go",
  rs: "Rust",
  rb: "Ruby",
  php: "PHP",
  swift: "Swift",
  kt: "Kotlin",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  md: "Markdown",
  txt: "Text",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
  vue: "Vue",
  svelte: "Svelte",
};

// ========================================
// 拡張子カラー
// ========================================

export const EXT_COLOR: Record<string, string> = {
  js: "#f7df1e",
  jsx: "#61dafb",
  ts: "#3178c6",
  tsx: "#61dafb",
  html: "#e34f26",
  css: "#1572b6",
  json: "#a3a3a3",
  py: "#3776ab",
  java: "#ed8b00",
  c: "#a8b9cc",
  cpp: "#00599c",
  h: "#a8b9cc",
  cs: "#68217a",
  go: "#00add8",
  rs: "#dea584",
  rb: "#cc342d",
  php: "#777bb4",
  swift: "#fa7343",
  kt: "#7f52ff",
  sql: "#336791",
  sh: "#4eaa25",
  bash: "#4eaa25",
  md: "#64748b",
  txt: "#94a3b8",
  xml: "#f97316",
  yaml: "#cb171e",
  yml: "#cb171e",
  vue: "#42b883",
  svelte: "#ff3e00",
};

// ========================================
// アップロード可能な拡張子
// ========================================

export const UPLOADABLE_EXTS = new Set<string>([
  "js",
  "jsx",
  "ts",
  "tsx",
  "html",
  "css",
  "json",
  "py",
  "java",
  "c",
  "cpp",
  "h",
  "cs",
  "go",
  "rs",
  "rb",
  "php",
  "swift",
  "kt",
  "sql",
  "sh",
  "bash",
  "md",
  "txt",
  "xml",
  "yaml",
  "yml",
  "vue",
  "svelte",
]);

// ========================================
// エディタ言語判定
// ========================================

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  css: "css",
  json: "json",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "c",
  cs: "csharp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  sql: "sql",
  sh: "shell",
  bash: "shell",
  md: "markdown",
  txt: "plaintext",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  vue: "html",
  svelte: "html",
};

export function languageOf(filename: string): string {
  const ext = extOf(filename);

  return LANGUAGE_MAP[ext] ?? "plaintext";
}

// ========================================
// コード実行方式判定
// ========================================

export type RunKind =
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "preview"
  | "none"
  | "unsupported";

export function runKindOf(filename: string): RunKind {
  const ext = extOf(filename);

  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";

    case "ts":
    case "tsx":
      return "typescript";

    case "py":
      return "python";

    case "html":
      return "preview";

    default:
      return "none";
  }
}
