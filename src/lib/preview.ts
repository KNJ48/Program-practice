"use client";

/** プレイグラウンドのフラットなノード一覧からパス解決を行うユーティリティ */

export type PreviewNode = {
  id: string;
  parentId: string | null;
  type: "file" | "folder";
  name: string;
  content: string;
};

export function buildPathIndex(nodes: PreviewNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  function pathOf(id: string): string[] {
    const parts: string[] = [];
    let cur: PreviewNode | undefined = byId.get(id);
    let guard = 0;
    while (cur && guard < 64) {
      parts.unshift(cur.name);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
      guard++;
    }
    return parts;
  }

  function resolve(fromFileId: string, relPath: string): PreviewNode | null {
    const from = byId.get(fromFileId);
    if (!from) return null;
    const clean = relPath.split("?")[0].split("#")[0];
    if (!clean || clean.startsWith("http") || clean.startsWith("//") || clean.startsWith("data:")) {
      return null;
    }
    const dirParts = pathOf(from.id).slice(0, -1);
    const stack = [...dirParts];
    for (const part of clean.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    const targetPath = stack.join("/");
    for (const n of nodes) {
      if (n.type !== "file") continue;
      if (pathOf(n.id).join("/") === targetPath) return n;
    }
    return null;
  }

  return { pathOf, resolve };
}

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** プレビュー iframe 内の console / エラーを親へ転送するフック */
export const PREVIEW_CONSOLE_HOOK = `<script>
(function () {
  function fmt(v) {
    if (typeof v === "string") return v;
    try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; }
    catch (e) { return String(v); }
  }
  function send(type, payload) {
    parent.postMessage({ __cbPreview: true, type: type, payload: payload }, "*");
  }
  ["log", "info", "warn", "error"].forEach(function (k) {
    console[k] = function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) parts.push(fmt(arguments[i]));
      send(k, parts.join(" "));
    };
  });
  window.addEventListener("error", function (e) {
    send("error", String((e.error && e.error.message) || e.message || e));
  });
})();
<\/script>`;

/**
 * HTMLファイルをプレビュー用の完全なドキュメントに変換する。
 * 同一フリースペース内の .css / .js への相対参照をインライン化する。
 */
export function buildPreviewDocument(
  html: string,
  resolver: (relPath: string) => PreviewNode | null,
): string {
  let out = html;

  // <link rel="stylesheet" href="./xxx.css"> → <style>
  out = out.replace(
    /<link\b[^>]*>/gi,
    (match) => {
      if (!/rel\s*=\s*["']stylesheet["']/i.test(match)) return match;
      const hrefMatch = match.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!hrefMatch) return match;
      const node = resolver(hrefMatch[1]);
      if (node && ext(node.name) === "css") {
        return `<style>\n${node.content}\n</style>`;
      }
      return match;
    },
  );

  // <script src="./xxx.js"></script> → インライン化
  out = out.replace(
    /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi,
    (match, src: string) => {
      const node = resolver(src);
      if (node && ext(node.name) === "js") {
        return `<script>\n${node.content}\n<\/script>`;
      }
      return match;
    },
  );

  // コンソール転送フックを <head> 直後に差し込む
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${PREVIEW_CONSOLE_HOOK}`);
  } else {
    out = PREVIEW_CONSOLE_HOOK + out;
  }
  return out;
}
