/**
 * プログラミング言語・ファイル名に関するユーティリティ
 *
 * ブラウザ・Next.js SSRの両方で使用可能
 */

/**
 * ファイル・フォルダ名のバリデーション
 *
 * ルール:
 * - 1〜64文字
 * - 空文字は禁止
 * - 使用禁止文字: / \ : * ? " < > |
 */
export function isValidNodeName(name: string): boolean {
  if (typeof name !== "string") {
    return false;
  }

  // 1〜64文字
  if (name.length < 1 || name.length > 64) {
    return false;
  }

  // 空白のみは禁止
  if (name.trim().length === 0) {
    return false;
  }

  // 使用禁止文字
  const invalidChars = /[\/\\:*?"<>|]/;

  if (invalidChars.test(name)) {
    return false;
  }

  // 改行・制御文字は禁止
  if (/[\x00-\x1F\x7F]/.test(name)) {
    return false;
  }

  return true;
}
