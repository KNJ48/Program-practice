import type { TrackSeed } from "./types";
import { htmlTrack } from "./track-html";
import { cssTrack } from "./track-css";
import { javascriptTrack } from "./track-javascript";
import { typescriptTrack } from "./track-typescript";
import { pythonTrack } from "./track-python";

export const TRACK_SEEDS: TrackSeed[] = [
  htmlTrack,
  cssTrack,
  javascriptTrack,
  typescriptTrack,
  pythonTrack,
];

export type PlaygroundSeedNode = {
  parent: string | null; // 先に作ったノードの name パス（ samples/ など）
  type: "file" | "folder";
  name: string;
  content?: string;
};

/** フリースペースの初期サンプル（プレイグラウンドが空のときのみ投入） */
export const PLAYGROUND_SAMPLES: PlaygroundSeedNode[] = [
  { parent: null, type: "folder", name: "samples" },
  {
    parent: "samples",
    type: "file",
    name: "index.html",
    content: [
      "<!doctype html>",
      '<html lang="ja">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>サンプルページ</title>",
      '  <link rel="stylesheet" href="./style.css">',
      "</head>",
      "<body>",
      "  <main>",
      "    <h1>フリースペースへようこそ</h1>",
      "    <p>左のツリーでフォルダやファイルを作り、自由にコードを書けます。</p>",
      '    <button id="btn">クリックしてみる</button>',
      "    <p id=\"msg\"></p>",
      "  </main>",
      '  <script src="./script.js"></' + "script>",
      "</body>",
      "</html>",
      "",
    ].join("\n"),
  },
  {
    parent: "samples",
    type: "file",
    name: "style.css",
    content: [
      "body {",
      "  font-family: system-ui, sans-serif;",
      "  margin: 24px;",
      "  color: #1f2937;",
      "}",
      "",
      "h1 { color: #2563eb; }",
      "",
      "button {",
      "  background: #2563eb;",
      "  color: #fff;",
      "  border: none;",
      "  padding: 8px 16px;",
      "  border-radius: 6px;",
      "  cursor: pointer;",
      "}",
      "",
    ].join("\n"),
  },
  {
    parent: "samples",
    type: "file",
    name: "script.js",
    content: [
      "document.getElementById(\"btn\").addEventListener(\"click\", () => {",
      "  document.getElementById(\"msg\").textContent =",
      "    \"JavaScript が動きました。コンソールにもログが出ています。\";",
      "  console.log(\"ボタンがクリックされました\");",
      "});",
      "",
      "console.log(\"プレビュー内の console.log は「出力」タブに表示されます\");",
      "",
    ].join("\n"),
  },
  { parent: null, type: "folder", name: "python" },
  {
    parent: "python",
    type: "file",
    name: "fizzbuzz.py",
    content: [
      "def fizzbuzz(n):",
      "    for i in range(1, n + 1):",
      "        if i % 15 == 0:",
      "            print(\"FizzBuzz\")",
      "        elif i % 3 == 0:",
      "            print(\"Fizz\")",
      "        elif i % 5 == 0:",
      "            print(\"Buzz\")",
      "        else:",
      "            print(i)",
      "",
      "",
      "fizzbuzz(15)",
      "",
    ].join("\n"),
  },
  {
    parent: null,
    type: "file",
    name: "hello.js",
    content: [
      "// JavaScript ファイルは「実行」ボタンでコンソールに出力できます",
      'const langs = ["HTML", "CSS", "JavaScript", "TypeScript", "Python"];',
      "",
      "for (const lang of langs) {",
      "  console.log(`学習できる言語: ${lang}`);",
      "}",
      "",
    ].join("\n"),
  },
];
