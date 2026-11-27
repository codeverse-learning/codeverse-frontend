import { useEffect, useState, useCallback, useRef } from "react";
import DevicePreview, { DeviceControls } from "./DevicePreview";
import Editor from "@monaco-editor/react";

import {
  Play,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Braces,
} from "lucide-react";

const DEFAULT_HTML = `<div class="card">
  <h1>Hello, CODEVERSE!</h1>
  <p>Start your coding journey today.</p>
  <button id="helloBtn">Click Me</button>
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
  border: 1px solid #8b5cf6;
  border-radius: 20px;
  box-shadow: 0 0 30px #8b5cf633;
}

h1 {
  color: #a78bfa;
}

p {
  color: #cbd5e1;
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
}

button:hover {
  opacity: 0.85;
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
    color: "#fb923c",
    file: "index.html",
  },
  {
    id: "css",
    label: "CSS",
    color: "#60a5fa",
    file: "style.css",
  },
  {
    id: "javascript",
    label: "JavaScript",
    color: "#facc15",
    file: "script.js",
  },
];


export default function WebPlayground() {
  const previewRef = useRef(null);
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [javascript, setJavascript] = useState(DEFAULT_JS);

  const [activeTab, setActiveTab] = useState("html");
  const [device, setDevice] = useState("desktop");
  const [autoRun, setAutoRun] = useState(true);

  const [srcDoc, setSrcDoc] = useState("");
  const [previewKey, setPreviewKey] = useState(0);

  // Build isolated preview document
  const buildPreview = useCallback(() => {
    const safeScript = javascript.replace(
      /<\/script/gi,
      "<\\/script"
    );

    const safeCss = css.replace(
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
</head>

<body>
  ${html}

  <script>${safeScript}</script>
</body>
</html>`;
  }, [html, css, javascript]);

  // Automatically update preview
  useEffect(() => {
    if (!autoRun) return;

    const timer = setTimeout(() => {
      setSrcDoc(buildPreview());
    }, 700);

    return () => clearTimeout(timer);
  }, [buildPreview, autoRun]);

  // Manually run code
  function runCode() {
    setSrcDoc(buildPreview());
    setPreviewKey((previous) => previous + 1);
  }

  // Reset all editors
  function resetCode() {
    const confirmed = window.confirm(
      "Reset all code to the default example?"
    );

    if (!confirmed) return;

    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
    setJavascript(DEFAULT_JS);
    setActiveTab("html");
    setAutoRun(true);
    setPreviewKey((previous) => previous + 1);
  }

  // Get active editor content
  function getEditorValue() {
    switch (activeTab) {
      case "html":
        return html;

      case "css":
        return css;

      case "javascript":
        return javascript;

      default:
        return "";
    }
  }

  // Update active editor
  function updateCode(value) {
    const code = value ?? "";

    switch (activeTab) {
      case "html":
        setHtml(code);
        break;

      case "css":
        setCss(code);
        break;

      case "javascript":
        setJavascript(code);
        break;

      default:
        break;
    }
  }

  const activeFile = TABS.find(
    (tab) => tab.id === activeTab
  );


  return (
    <section className="w-full">

      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#11111f] p-2">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-purple-500/15 p-3">
            <Globe
              className="text-purple-400"
              size={22}
            />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Web Playground
            </h2>

            <p className="text-xs text-gray-500">
              HTML · CSS · JavaScript
            </p>
          </div>

        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">

            <input
              type="checkbox"
              checked={autoRun}
              onChange={(event) =>
                setAutoRun(event.target.checked)
              }
              className="accent-purple-500"
            />

            Auto Run

          </label>

          <button
            onClick={resetCode}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            onClick={runCode}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-blue-500"
          >
            <Play size={16} />
            Run Code
          </button>

        </div>

      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

        {/* Code Editor */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11111f] h-[var(--workspace-height)]">

          {/* Editor Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">

            <div className="flex items-center gap-2">

              <Braces
                size={18}
                className="text-purple-400"
              />

              <span className="text-sm font-semibold text-white">
                Code Editor
              </span>

            </div>

            <span className="text-xs text-gray-500">
              Monaco Editor
            </span>

          </div>

          {/* Language Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0c0c18] p-2">

            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition ${
                  activeTab === tab.id
                    ? "bg-purple-500/15 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >

                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: tab.color,
                  }}
                />

                {tab.label}

              </button>
            ))}

          </div>

          {/* Monaco Editor */}
          <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            path={activeFile?.file}
            language={activeTab}
            theme="vs-dark"
            value={getEditorValue()}
            onChange={updateCode}
            options={{
              fontSize: 14,
              fontFamily: "Consolas, monospace",
              minimap: {
                enabled: false,
              },
              automaticLayout: true,
              wordWrap: "on",
              tabSize: 2,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              padding: {
                top: 16,
              },
              formatOnPaste: true,
              formatOnType: true,
              lineNumbers: "on",
              bracketPairColorization: {
                enabled: true,
              },
              cursorBlinking: "smooth",
            }}
          />
          </div>

        </div>

        {/* Live Preview */}
        <div ref={previewRef} className="flex h-[var(--workspace-height)] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11111f] fullscreen:h-screen">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <h2 className="text-sm font-semibold">Live Preview</h2>
            <DeviceControls device={device} setDevice={setDevice} target={previewRef} />
          </div>
          <DevicePreview device={device}>{({ width, height }) => <iframe key={previewKey} title="CODEVERSE Live Preview" srcDoc={srcDoc} sandbox="allow-scripts" referrerPolicy="no-referrer" style={{ width, height, border: 0 }} />}</DevicePreview>
        </div>
      </div>

      {/* Workspace Status */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">

        <span>
          HTML5 · CSS3 · JavaScript
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Sandboxed browser preview
        </span>

      </div>

    </section>
  );
}
