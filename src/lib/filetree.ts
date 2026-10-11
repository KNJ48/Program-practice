import { isValidNodeName } from "@/lib/languages";
import type { FileNodeDTO } from "@/lib/types";

/** フリースペースのツリー操作・バリデーション（ブラウザ内データ用） */

export function validateCreate(
  nodes: FileNodeDTO[],
  parentId: string | null,
  name: string,
): string | null {
  if (!isValidNodeName(name)) {
    return "名前が不正です（1〜64文字、/ \\ : * ? \" < > | は使用不可）";
  }
  if (parentId) {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent || parent.type !== "folder") {
      return "親フォルダが見つかりません";
    }
  }
  if (nodes.some((n) => n.parentId === parentId && n.name === name)) {
    return "同じ名前の項目がすでに存在します";
  }
  return null;
}

export function validateRename(
  nodes: FileNodeDTO[],
  id: string,
  name: string,
): string | null {
  if (!isValidNodeName(name)) {
    return "名前が不正です（1〜64文字、/ \\ : * ? \" < > | は使用不可）";
  }
  const node = nodes.find((n) => n.id === id);
  if (!node) return "項目が見つかりません";
  if (
    nodes.some(
      (n) => n.parentId === node.parentId && n.name === name && n.id !== id,
    )
  ) {
    return "同じ名前の項目がすでに存在します";
  }
  return null;
}

export function descendantIds(nodes: FileNodeDTO[], rootId: string): string[] {
  const result: string[] = [];
  const walk = (parentId: string) => {
    for (const n of nodes) {
      if (n.parentId === parentId) {
        result.push(n.id);
        if (n.type === "folder") walk(n.id);
      }
    }
  };
  walk(rootId);
  return result;
}

export function makeNode(
  parentId: string | null,
  type: "file" | "folder",
  name: string,
  content: string,
): FileNodeDTO {
  return {
    id: crypto.randomUUID(),
    parentId,
    type,
    name,
    content,
    updatedAt: new Date().toISOString(),
  };
}
