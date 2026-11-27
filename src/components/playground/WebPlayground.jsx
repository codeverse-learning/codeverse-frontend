
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import Editor from "@monaco-editor/react";

import DevicePreview, {
  DeviceControls,
} from "./DevicePreview";

import {
  Play,
  RotateCcw,
  Globe,
  Copy,
  Check,
  Terminal,
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
  Code2,
  GripVertical,
  AlertCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";

const DEFAULT_HTML = `<div class="card">
  <span class="badge">CODEVERSE PLAYGROUND</span>

  <h1>Hello, CODEVERSE!</h1>

  <p>Start your coding journey today.</p>

  <button id="helloBtn">Get Started</button>

  <p id="message"></p>
</div>`;

const DEFAULT_CSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #080812;
  font-family: Arial, sans-serif;
  color: white;
}

.card {
  width: 90%;
  max-width: 400px;
  padding: 40px 24px;
  text-align: center;
  background: #171729;
  border: 1px solid #8b5cf650;
  border-radius: 20px;
  box-shadow: 0 0 40px #8b5cf620;
}

.badge {
  font-size: 10px;
  letter-spacing: 2px;
  color: #a78bfa;
}

h1 {
  color: #c4b5fd;
  font-size: 28px;
}

p {
  color: #94a3b8;
  line-height: 1.6;
}

button {
  background: linear-gradient(
    135deg, #7c3aed, #2563eb
  );
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  opacity: 0.85;
}

#message {
  color: #a78bfa;
}`;

const DEFAULT_JS = `document
  .getElementById("helloBtn")
  .addEventListener("click", () => {
    document.getElementById("message")
      .textContent = "Happy Coding! 🚀";

    console.log("Button clicked!");
  });`;

const TABS = [
  {
    id: "html",
    label: "HTML",
    symbol: "</>",
    color: "#fb923c",
    file: "index.html",
  },
  {
    id: "css",
    label: "CSS",
    symbol: "#",
    color: "#60a5fa",
    file: "style.css",
  },
  {
    id: "javascript",
    label: "JavaScript",
    symbol: "JS",
    color: "#facc15",
    file: "script.js",
  },
];

const DEFAULT_FILES = {
  html: DEFAULT_HTML,
  css: DEFAULT_CSS,
  javascript: DEFAULT_JS,
};

const CONSOLE_BRIDGE = `
(function () {
  function stringify(value) {
    if (typeof value === "string") return value;

    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }

  function send(level, args) {
    window.parent.postMessage({
      source: "codeverse-preview",
      level: level,
      message: Array.from(args)
        .map(stringify)
        .join(" ")
    }, "*");
  }

  ["log", "info", "warn", "error"].forEach(
    function (level) {
      const original = console[level];

      console[level] = function (...args) {
        send(level, args);
        original.apply(console, args);
      };
    }
  );

  window.addEventListener("error", function (event) {
    send("error", [event.message || "Runtime error"]);
  });

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      send("error", [
        event.reason?.message ||
        event.reason ||
        "Unhandled promise rejection"
      ]);
    }
  );
})();
`;

export default function WebPlayground() {
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const workspaceRef = useRef(null);

  const [files, setFiles] = useState({
    ...DEFAULT_FILES,
  });

  const [activeTab, setActiveTab] = useState("html");
  const [device, setDevice] = useState("desktop");
  const [autoRun, setAutoRun] = useState(true);

  const [srcDoc, setSrcDoc] = useState("");
  const [previewKey, setPreviewKey] = useState(0);

  const [editorWidth, setEditorWidth] = useState(50);
  const [dragging, setDragging] = useState(false);

  const [mobileView, setMobileView] =
    useState("editor");

  const [consoleOpen, setConsoleOpen] =
    useState(false);

  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [cursor, setCursor] = useState({
    line: 1,
    column: 1,
  });

  const copyTimer = useRef(null);

  const activeFile = TABS.find(
    (tab) => tab.id === activeTab
  );

  const errorCount = logs.filter(
    (log) => log.level === "error"
  ).length;

  const warningCount = logs.filter(
    (log) => log.level === "warn"
  ).length;

  // Build sandboxed preview document
  const buildPreview = useCallback(
    (source = files) => {
      const safeScript = source.javascript.replace(
        /<\/script/gi,
        "<\\/script"
      );

      const safeCss = source.css.replace(
        /<\/style/gi,
        "<\\/style"
      );

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta name="viewport"
    content="width=device-width, initial-scale=1.0">

  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
    style-src 'unsafe-inline';
    script-src 'unsafe-inline';
    img-src data: blob:;
    connect-src 'none';
    form-action 'none';
    base-uri 'none';
    object-src 'none';">

  <style>${safeCss}</style>

  <script>${CONSOLE_BRIDGE}</script>
</head>

<body>
  ${source.html}

  <script>${safeScript}</script>
</body>
</html>`;
    },
    [files]
  );

  // Manual code execution
  const runCode = useCallback(() => {
    setLogs([]);
    setSrcDoc(buildPreview());
    setPreviewKey((previous) => previous + 1);
  }, [buildPreview]);

  // Auto run with debounce
  useEffect(() => {
    if (!autoRun) return;

    const timer = setTimeout(() => {
      runCode();
    }, 700);

    return () => clearTimeout(timer);
  }, [autoRun, runCode]);

  // Receive console output from sandbox
  useEffect(() => {
    function handleMessage(event) {
      if (
        event.source !==
        iframeRef.current?.contentWindow
      ) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        data.source !== "codeverse-preview" ||
        !["log", "info", "warn", "error"].includes(
          data.level
        )
      ) {
        return;
      }

      const entry = {
        id:
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2),
        level: data.level,
        message: String(data.message).slice(0, 10000),
        time: new Date().toLocaleTimeString(),
      };

      setLogs((previous) =>
        [...previous, entry].slice(-200)
      );
    }

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleShortcut(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        runCode();
      }
    }

    window.addEventListener(
      "keydown",
      handleShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut
      );
    };
  }, [runCode]);

  // Resize workspace panels
  useEffect(() => {
    if (!dragging) return;

    function handleMove(event) {
      const bounds =
        workspaceRef.current?.getBoundingClientRect();

      if (!bounds || !bounds.width) return;

      const percentage =
        ((event.clientX - bounds.left) /
          bounds.width) *
        100;

      setEditorWidth(
        Math.max(30, Math.min(70, percentage))
      );
    }

    function handleEnd() {
      setDragging(false);
    }

    const oldCursor = document.body.style.cursor;
    const oldSelection =
      document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleEnd
    );

    window.addEventListener(
      "pointercancel",
      handleEnd
    );

    window.addEventListener("blur", handleEnd);

    return () => {
      document.body.style.cursor = oldCursor;
      document.body.style.userSelect = oldSelection;

      window.removeEventListener(
        "pointermove",
        handleMove
      );

      window.removeEventListener(
        "pointerup",
        handleEnd
      );

      window.removeEventListener(
        "pointercancel",
        handleEnd
      );

      window.removeEventListener("blur", handleEnd);
    };
  }, [dragging]);

  useEffect(() => {
    return () => clearTimeout(copyTimer.current);
  }, []);

  // Reset playground
  function resetCode() {
    const confirmed = window.confirm(
      "Reset all files to the default example?"
    );

    if (!confirmed) return;

    setFiles({ ...DEFAULT_FILES });
    setActiveTab("html");
    setLogs([]);
    setCursor({ line: 1, column: 1 });

    setSrcDoc(buildPreview(DEFAULT_FILES));

    setPreviewKey(
      (previous) => previous + 1
    );
  }

  // Update active file
  function updateCode(value) {
    setFiles((previous) => ({
      ...previous,
      [activeTab]: value ?? "",
    }));
  }

  // Copy active file
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(
        files[activeTab]
      );

      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
      setCopied(false);
    }

    clearTimeout(copyTimer.current);

    copyTimer.current = setTimeout(() => {
      setCopied(false);
      setCopyFailed(false);
    }, 1800);
  }

  // Custom Monaco theme
  function configureMonaco(monaco) {
    monaco.editor.defineTheme("codeverse-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0d0d18",
        "editor.foreground": "#d4d4e5",
        "editorLineNumber.foreground": "#505067",
        "editorLineNumber.activeForeground":
          "#c4b5fd",
        "editorCursor.foreground": "#a78bfa",
        "editor.lineHighlightBackground": "#171725",
        "editor.selectionBackground": "#51368a66",
        "editorIndentGuide.background1": "#232333",
        "editorIndentGuide.activeBackground1":
          "#51406c",
      },
    });
  }

  function handleEditorMount(editor) {
    editor.onDidChangeCursorPosition((event) => {
      setCursor({
        line: event.position.lineNumber,
        column: event.position.column,
      });
    });
  }

  return (
    <section className="min-w-0 w-full">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-white/[0.08] bg-[#11111f] px-3 py-2.5">

        {/* Workspace Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Globe size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Web Playground
            </h2>

            <p className="text-[11px] text-gray-500">
              HTML · CSS · JavaScript
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Auto Run */}
          <button
            type="button"
            role="switch"
            aria-checked={autoRun}
            onClick={() =>
              setAutoRun((previous) => !previous)
            }
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-400 hover:text-white"
          >
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                autoRun
                  ? "bg-purple-600"
                  : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  autoRun
                    ? "translate-x-[18px]"
                    : "translate-x-0.5"
                }`}
                style={{ left: 0 }}
              />
            </span>

            Auto Run
          </button>

          <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

          {/* Reset */}
          <button
            type="button"
            onClick={resetCode}
            title="Reset all files"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw size={14} />

            <span className="hidden sm:inline">
              Reset
            </span>
          </button>

          {/* Run */}
          <button
            type="button"
            onClick={() => {
              runCode();
              setMobileView("preview");
            }}
            title="Run code (Ctrl + Enter)"
            className="flex h-9 items-center gap-2 rounded-lg bg-purple-600 px-4 text-xs font-semibold text-white transition hover:bg-purple-500 active:scale-95"
          >
            <Play size={14} fill="currentColor" />

            Run Code

            <kbd className="ml-1 hidden rounded border border-white/20 px-1 text-[10px] text-purple-200 lg:inline">
              Ctrl ↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Mobile Workspace Navigation */}
      <div className="flex border-x border-b border-white/[0.08] bg-[#0d0d18] p-1.5 md:hidden">
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-medium ${
            mobileView === "editor"
              ? "bg-purple-500/15 text-purple-300"
              : "text-gray-500"
          }`}
        >
          <Code2 size={15} />
          Editor
        </button>

        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-medium ${
            mobileView === "preview"
              ? "bg-purple-500/15 text-purple-300"
              : "text-gray-500"
          }`}
        >
          <Eye size={15} />
          Preview
        </button>
      </div>

      {/* Main Workspace */}
      <div
        ref={workspaceRef}
        className="relative flex min-h-[340px] min-w-0 overflow-hidden border-x border-white/[0.08] bg-[#0d0d18]"
        style={{
          height:
            "max(340px, calc(var(--workspace-height, 600px) - 100px))",
          "--editor-width": `${editorWidth}%`,
        }}
      >
        {/* Editor Panel */}
        <div
          className={`${
            mobileView === "editor"
              ? "flex"
              : "hidden"
          } w-full min-w-0 flex-col md:flex md:w-[var(--editor-width)] md:shrink-0`}
        >
          {/* File Tabs */}
          <div className="flex h-11 shrink-0 items-stretch border-b border-white/[0.08] bg-[#11111f]">
            <div
              role="group"
              aria-label="Source files"
              className="flex min-w-0 flex-1 overflow-x-auto"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCopied(false);
                    setCopyFailed(false);
                  }}
                  className={`relative flex shrink-0 items-center gap-2 border-r border-white/[0.05] px-3 text-xs transition ${
                    activeTab === tab.id
                      ? "bg-[#0d0d18] text-white"
                      : "text-gray-500 hover:bg-white/[0.03] hover:text-gray-300"
                  }`}
                >
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-purple-500" />
                  )}

                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: tab.color }}
                  >
                    {tab.symbol}
                  </span>

                  {tab.file}
                </button>
              ))}
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={copyCode}
              title={
                copied
                  ? "Copied!"
                  : copyFailed
                    ? "Clipboard unavailable"
                    : "Copy active file"
              }
              aria-label="Copy active file"
              className="flex w-10 shrink-0 items-center justify-center border-l border-white/[0.06] text-gray-500 hover:bg-white/5 hover:text-white"
            >
              {copied ? (
                <Check
                  size={15}
                  className="text-green-400"
                />
              ) : copyFailed ? (
                <AlertCircle
                  size={15}
                  className="text-red-400"
                />
              ) : (
                <Copy size={15} />
              )}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="min-h-0 min-w-0 flex-1">
            <Editor
              height="100%"
              path={`codeverse-web/${activeFile.file}`}
              language={activeTab}
              theme="codeverse-dark"
              beforeMount={configureMonaco}
              onMount={handleEditorMount}
              value={files[activeTab]}
              onChange={updateCode}
              saveViewState
              options={{
                fontSize: 14,
                lineHeight: 23,
                fontFamily:
                  "'JetBrains Mono', Consolas, monospace",
                fontLigatures: true,
                minimap: {
                  enabled: false,
                },
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
                insertSpaces: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
                formatOnPaste: true,
                formatOnType: true,
                folding: true,
                lineNumbers: "on",
                bracketPairColorization: {
                  enabled: true,
                },
                padding: {
                  top: 14,
                  bottom: 14,
                },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>

          {/* Editor Status */}
          <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] bg-[#10101b] px-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: activeFile.color,
                }}
              />

              {activeFile.label}
            </span>

            <div className="flex items-center gap-3">
              <span>
                Ln {cursor.line}, Col {cursor.column}
              </span>

              <span className="hidden lg:inline">
                Spaces: 2
              </span>

              <span className="hidden lg:inline">
                UTF-8
              </span>
            </div>
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          role="separator"
          aria-label="Resize editor and preview"
          aria-orientation="vertical"
          aria-valuemin={30}
          aria-valuemax={70}
          aria-valuenow={Math.round(editorWidth)}
          tabIndex={0}
          title="Drag to resize. Double-click to reset."
          onPointerDown={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDoubleClick={() => setEditorWidth(50)}
          onKeyDown={(event) => {
            if (
              event.key === "ArrowLeft" ||
              event.key === "ArrowRight"
            ) {
              event.preventDefault();

              setEditorWidth((previous) =>
                Math.max(
                  30,
                  Math.min(
                    70,
                    previous +
                      (event.key === "ArrowRight"
                        ? 2
                        : -2)
                  )
                )
              );
            }
          }}
          className={`group relative z-10 hidden w-2 shrink-0 cursor-col-resize touch-none items-center justify-center border-x border-white/[0.05] transition md:flex ${
            dragging
              ? "bg-purple-500/40"
              : "bg-[#171725] hover:bg-purple-500/30"
          }`}
        >
          <GripVertical
            size={12}
            className="text-gray-600 group-hover:text-purple-300"
          />
        </div>

        {/* Preview Panel */}
        <div
          ref={previewRef}
          className={`${
            mobileView === "preview"
              ? "flex"
              : "hidden"
          } min-h-0 min-w-0 flex-1 flex-col bg-[#11111f] md:flex fullscreen:h-screen fullscreen:w-screen`}
        >
          {/* Preview Toolbar */}
          <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              <span className="text-xs font-semibold text-gray-200">
                Live Preview
              </span>

              <button
                type="button"
                onClick={runCode}
                title="Refresh preview"
                aria-label="Refresh preview"
                className="rounded-md p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <DeviceControls
              device={device}
              setDevice={setDevice}
              target={previewRef}
            />
          </div>

          {/* Browser Address Bar */}
          <div className="flex h-9 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#0d0d18] px-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
              <span className="h-2 w-2 rounded-full bg-green-400/70" />
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-white/[0.04] px-2 py-1">
              <Globe
                size={11}
                className="shrink-0 text-gray-500"
              />

              <span className="truncate text-[10px] text-gray-500">
                codeverse / local-preview
              </span>
            </div>
          </div>

          {/* Preview Canvas */}
          <DevicePreview device={device}>
            {({ width, height }) => (
              <iframe
                ref={iframeRef}
                key={previewKey}
                title="CODEVERSE Live Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                referrerPolicy="no-referrer"
                style={{
                  width,
                  height,
                  border: 0,
                  display: "block",
                  background: "white",
                  pointerEvents: dragging
                    ? "none"
                    : "auto",
                }}
              />
            )}
          </DevicePreview>
        </div>
      </div>

      {/* Console Panel */}
      <div className="overflow-hidden rounded-b-xl border border-white/[0.08] bg-[#0d0d18]">

        {/* Console Header */}
        <div className="flex h-10 items-center justify-between bg-[#11111f] px-3">
          <button
            type="button"
            onClick={() =>
              setConsoleOpen((previous) => !previous)
            }
            aria-expanded={consoleOpen}
            className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-300 hover:text-white"
          >
            <Terminal
              size={15}
              className="text-purple-400"
            />

            Console

            {logs.length > 0 && (
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-gray-400">
                {logs.length}
              </span>
            )}

            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle size={12} />
                {errorCount}
              </span>
            )}

            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle size={12} />
                {warningCount}
              </span>
            )}

            {consoleOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] text-gray-500 sm:inline">
              Sandboxed preview
            </span>

            <button
              type="button"
              onClick={() => setLogs([])}
              title="Clear console"
              aria-label="Clear console"
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Console Output */}
        {consoleOpen && (
          <div
            aria-label="Console output"
            className="h-36 overflow-auto border-t border-white/[0.06] font-mono text-xs"
          >
            {logs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-600">
                <Terminal size={22} />

                <span>No console messages yet.</span>

                <span className="text-[10px]">
                  JavaScript output will appear here.
                </span>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 border-b border-white/[0.04] px-3 py-2 ${
                    log.level === "error"
                      ? "bg-red-500/[0.06] text-red-400"
                      : log.level === "warn"
                        ? "bg-yellow-500/[0.04] text-yellow-400"
                        : "text-gray-300"
                  }`}
                >
                  <span className="shrink-0 text-[10px] text-gray-600">
                    {log.time}
                  </span>

                  <span className="w-10 shrink-0 uppercase">
                    {log.level}
                  </span>

                  <span className="min-w-0 whitespace-pre-wrap break-all">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
