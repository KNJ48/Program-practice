"use client";

import { useCallback, useRef, useState } from "react";

export type ConsoleKind = "log" | "info" | "warn" | "error" | "system";
export type ConsoleEntry = { id: number; kind: ConsoleKind; text: string };
export type RunnerStatus = "idle" | "loading" | "running";

const PYODIDE_VERSION = "v0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const TS_CDN_PRIMARY =
  "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.5.4/typescript.min.js";
const TS_CDN_FALLBACK =
  "https://cdn.jsdelivr.net/npm/typescript@5.5.4/lib/typescript.js";

/**
 * ユーザーコードを実行するためのサンドボックス iframe ハーネス。
 * console 系と例外を親ウィンドウに postMessage で転送する。
 */
const JS_HARNESS = `<!doctype html>
<html><head><meta charset="utf-8"></head><body><script>
(function () {
  function fmt(v) {
    if (typeof v === "string") return v;
    if (v === undefined) return "undefined";
    if (typeof v === "function") return String(v);
    try {
      var s = JSON.stringify(v);
      return s === undefined ? String(v) : s;
    } catch (e) {
      return String(v);
    }
  }
  function send(type, payload) {
    parent.postMessage({ __cbRunner: true, type: type, payload: payload }, "*");
  }
  ["log", "info", "warn", "error"].forEach(function (k) {
    console[k] = function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) parts.push(fmt(arguments[i]));
      send(k, parts.join(" "));
    };
  });
  window.addEventListener("error", function (e) {
    send("error", String((e.error && e.error.stack) || e.message || e));
  });
  window.addEventListener("unhandledrejection", function (e) {
    send("error", "Unhandled Promise rejection: " + fmt(e.reason));
  });
  /* 非同期処理（setTimeout / async-await 経由のタイマー）の完了を追跡する。
     保留中のタイマーが 0 になってから done を通知し、出力の取りこぼしを防ぐ。 */
  var pendingTimers = 0;
  var doneSent = false;
  function maybeDone() {
    if (doneSent) return;
    if (pendingTimers > 0) return;
    doneSent = true;
    send("done", null);
  }
  var rawSetTimeout = window.setTimeout.bind(window);
  var rawClearTimeout = window.clearTimeout.bind(window);
  window.setTimeout = function (fn, ms) {
    var rest = Array.prototype.slice.call(arguments, 2);
    pendingTimers++;
    var id = rawSetTimeout.apply(window, [function () {
      pendingTimers = Math.max(0, pendingTimers - 1);
      try { fn.apply(null, rest); }
      catch (err) { send("error", String((err && err.stack) || err)); }
      maybeDone();
    }, ms].concat(rest));
    return id;
  };
  window.clearTimeout = function (id) {
    pendingTimers = Math.max(0, pendingTimers - 1);
    rawClearTimeout(id);
  };
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.__cbRun !== true) return;
    try {
      (0, eval)(d.code);
    } catch (err) {
      send("error", String((err && err.stack) || err));
    }
    /* 同期的に終わった場合は即 done、タイマーが残っていればポーリングで待つ */
    (function waitFinish() {
      if (pendingTimers > 0 && !doneSent) {
        rawSetTimeout(waitFinish, 100);
      } else {
        maybeDone();
      }
    })();
  });
  send("ready", null);
})();
<\/script></body></html>`;

let scriptLoadCache = new Map<string, Promise<void>>();

function injectScript(src: string): Promise<void> {
  const cached = scriptLoadCache.get(src);
  if (cached) return cached;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("failed to load " + src));
    document.head.appendChild(el);
  });
  scriptLoadCache.set(src, p);
  return p;
}

function formatPyError(err: unknown): string {
  const msg = String((err as { message?: string })?.message ?? err);
  // Pyodide の PythonError は長大な JS スタックを含むので整形
  const idx = msg.indexOf("File \"<exec>\"");
  if (idx >= 0) {
    const head = msg.slice(msg.indexOf("Traceback"), msg.length);
    const cleaned = head.replace(/\n +File "\/lib\/python[^\n]+\n +[^\n]+\n/g, "\n");
    return cleaned.slice(0, 800);
  }
  return msg.slice(0, 800);
}

export function useRunner() {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const idCounter = useRef(0);
  const entriesRef = useRef<ConsoleEntry[]>([]);
  const pyEnvRef = useRef<Promise<unknown> | null>(null);
  const pyReadyRef = useRef(false);
  const tsEnvRef = useRef<Promise<unknown> | null>(null);
  const tsReadyRef = useRef(false);

  const push = useCallback((kind: ConsoleKind, text: string) => {
    idCounter.current += 1;
    const next = [...entriesRef.current, { id: idCounter.current, kind, text }];
    entriesRef.current = next;
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    entriesRef.current = [];
    setEntries([]);
  }, []);

  const runJavaScript = useCallback(
    (code: string) => {
      return new Promise<void>((resolve) => {
        setStatus("running");
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts");
        iframe.style.display = "none";

        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("message", onMessage);
          iframe.remove();
          setStatus("idle");
          resolve();
        };
        const onMessage = (e: MessageEvent) => {
          if (e.source !== iframe.contentWindow) return;
          const d = e.data;
          if (!d || d.__cbRunner !== true) return;
          if (d.type === "ready") {
            iframe.contentWindow?.postMessage({ __cbRun: true, code }, "*");
          } else if (d.type === "done") {
            finish();
          } else {
            push(d.type as ConsoleKind, String(d.payload ?? ""));
          }
        };

        window.addEventListener("message", onMessage);
        iframe.srcdoc = JS_HARNESS;
        document.body.appendChild(iframe);
        // 安全装置: 無限ループなどで done が来ない場合に iframe を破棄
        window.setTimeout(finish, 15000);
      });
    },
    [push],
  );

  const runPython = useCallback(
    async (code: string) => {
      if (!pyReadyRef.current) {
        setStatus("loading");
        push(
          "system",
          "Python 実行環境（Pyodide / WebAssembly）を初期化しています…（初回のみ数秒かかります）",
        );
      } else {
        setStatus("running");
      }
      try {
        if (!pyEnvRef.current) {
          pyEnvRef.current = (async () => {
            await injectScript(`${PYODIDE_URL}pyodide.js`);
            const w = window as unknown as {
              loadPyodide: (opts: { indexURL: string }) => Promise<unknown>;
            };
            return w.loadPyodide({ indexURL: PYODIDE_URL });
          })();
        }
        const py = await pyEnvRef.current;
        pyReadyRef.current = true;
        setStatus("running");
        const pyAny = py as {
          setStdout: (o: { batched: (s: string) => void }) => void;
          setStderr: (o: { batched: (s: string) => void }) => void;
          runPythonAsync: (code: string) => Promise<unknown>;
        };
        pyAny.setStdout({ batched: (s: string) => push("log", s) });
        pyAny.setStderr({ batched: (s: string) => push("error", s) });
        await pyAny.runPythonAsync(code);
      } catch (err) {
        if (!pyReadyRef.current) {
          pyEnvRef.current = null;
          push("error", "Python 環境の初期化に失敗しました。ネットワーク接続を確認してください。");
        } else {
          push("error", formatPyError(err));
        }
      } finally {
        setStatus("idle");
      }
    },
    [push],
  );

  const runTypeScript = useCallback(
    async (code: string) => {
      if (!tsReadyRef.current) {
        setStatus("loading");
        push("system", "TypeScript コンパイラを読み込んでいます…（初回のみ）");
      }
      try {
        if (!tsEnvRef.current) {
          tsEnvRef.current = (async () => {
            try {
              await injectScript(TS_CDN_PRIMARY);
            } catch {
              await injectScript(TS_CDN_FALLBACK);
            }
            return (window as unknown as { ts: unknown }).ts;
          })();
        }
        const ts = await tsEnvRef.current as {
          transpileModule: (
            code: string,
            opts: { compilerOptions: Record<string, unknown>; reportDiagnostics: boolean },
          ) => { outputText: string; diagnostics?: Array<{ messageText: unknown }> };
          ScriptTarget: { ES2020: unknown };
          ModuleKind: { None: unknown };
          flattenDiagnosticMessageText: (m: unknown, sep: string) => string;
        };
        tsReadyRef.current = true;
        const result = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            strict: true,
          },
          reportDiagnostics: true,
        });
        (result.diagnostics ?? []).slice(0, 5).forEach((d) => {
          push("warn", "[TS] " + ts.flattenDiagnosticMessageText(d.messageText, "\n"));
        });
        await runJavaScript(result.outputText);
      } catch (err) {
        if (!tsReadyRef.current) {
          tsEnvRef.current = null;
          push("error", "TypeScript コンパイラの読み込みに失敗しました。");
        } else {
          push("error", "TypeScript の変換に失敗しました: " + String(err));
        }
        setStatus("idle");
      }
    },
    [push, runJavaScript],
  );

  return {
    entries,
    entriesRef,
    status,
    push,
    clear,
    runJavaScript,
    runPython,
    runTypeScript,
  };
}
