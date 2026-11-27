import { useState } from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

import {
  Code2,
  Terminal,
  FolderTree,
  Monitor,
  RotateCcw,
} from "lucide-react";

export default function FrameworkPlayground({
  framework,
}) {
  const [showFiles, setShowFiles] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  function resetPlayground() {
    if (
      window.confirm(
        "Reset all files to the default template?"
      )
    ) {
      setResetKey((previous) => previous + 1);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#11111f]">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-4">

        <div className="flex items-center gap-3">

          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl font-bold"
            style={{ color: framework.color }}
          >
            {framework.symbol}
          </div>

          <div>
            <h2 className="font-semibold">
              {framework.name} Playground
            </h2>

            <p className="text-xs text-gray-500">
              {framework.description}
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() => setShowFiles(!showFiles)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              showFiles
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-white/10 text-gray-400"
            }`}
          >
            <FolderTree size={16} />
            Files
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              showConsole
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-white/10 text-gray-400"
            }`}
          >
            <Terminal size={16} />
            Console
          </button>

          <button
            onClick={resetPlayground}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Reset
          </button>

        </div>
      </div>

      {/* Sandpack Environment */}
      <SandpackProvider
        key={`$î€€DIL3î€-$î€€DIL4î€`}
        template={framework.template}
        files={framework.files}
        theme="dark"
        options={{
            activeFile: framework.activeFile,
            autorun: true,
            autoReload: true,
            recompileMode: "delayed",
            recompileDelay: 700,
        }}
        >

        <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-2">

          {/* Editor */}
          <div className="min-w-0 bg-[#11111f]">

            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm">
              <Code2
                size={17}
                className="text-purple-400"
              />
              Code Editor
            </div>

            <SandpackLayout
              style={{
                border: "none",
                borderRadius: 0,
              }}
            >

              {showFiles && (
                <SandpackFileExplorer
                  style={{
                    height: 520,
                    minWidth: 130,
                    maxWidth: 180,
                  }}
                />
              )}

              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                showRunButton
                showRefreshButton
                wrapContent
                closableTabs
                style={{ height: 520 }}
              />

            </SandpackLayout>

          </div>

          {/* Preview */}
          <div className="min-w-0 bg-[#11111f]">

            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm">
              <Monitor
                size={17}
                className="text-purple-400"
              />

              Live Preview

              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-green-400" />
            </div>

            <SandpackPreview
              showNavigator
              showRefreshButton
              showOpenInCodeSandbox={false}
              style={{ height: 520 }}
            />

          </div>

        </div>

        {/* Console */}
        {showConsole && (
          <div className="border-t border-white/10">

            <div className="flex items-center gap-2 px-4 py-3 text-sm">
              <Terminal
                size={17}
                className="text-purple-400"
              />
              Console Output
            </div>

            <SandpackConsole
              showHeader
              showResetConsoleButton
              style={{ height: 180 }}
            />

          </div>
        )}

      </SandpackProvider>

    </section>
  );
}
