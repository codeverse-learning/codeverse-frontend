
import { useState, useRef } from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";

import {
  Code2,
  Terminal,
  FolderTree,
  RotateCcw,
  Play,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import DevicePreview, {
  DeviceControls,
} from "./DevicePreview";

const control =
  "flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white";

function FrameworkWorkspace({
  framework,
  onReset,
}) {
  const { sandpack } = useSandpack();

  const [showFiles, setShowFiles] = useState(true);
  const [showConsole, setShowConsole] = useState(false);

  const [device, setDevice] = useState(
    framework.initialDevice || "desktop"
  );

  const [mobileView, setMobileView] =
    useState("editor");

  const [editorWidth, setEditorWidth] = useState(50);
  const [dragging, setDragging] = useState(false);

  const previewRef = useRef(null);
  const workspaceRef = useRef(null);

  function resizePanels(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const bounds =
      workspaceRef.current?.getBoundingClientRect();

    if (!bounds?.width) return;

    const percentage =
      ((event.clientX - bounds.left) /
        bounds.width) * 100;

    setEditorWidth(
      Math.max(30, Math.min(70, percentage))
    );
  }

  function runCode() {
    sandpack.runSandpack();
    setMobileView("preview");
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11111f]">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-3 py-2.5">

        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-white/5 px-2 text-lg font-bold"
            style={{ color: framework.color }}
          >
            {framework.symbol}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              {framework.name} Playground
            </h2>

            <p className="truncate text-[11px] text-gray-500">
              {framework.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={showFiles}
            onClick={() => setShowFiles(!showFiles)}
            className={`${control} ${
              showFiles
                ? "!border-purple-500/30 !bg-purple-500/10 !text-purple-300"
                : ""
            }`}
          >
            <FolderTree size={15} />
            Files
          </button>

          <button
            type="button"
            onClick={onReset}
            className={control}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            onClick={runCode}
            className="flex h-9 items-center gap-2 rounded-lg bg-purple-600 px-4 text-xs font-semibold text-white transition hover:bg-purple-500"
          >
            <Play size={14} fill="currentColor" />
            Run Code
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex gap-1 border-b border-white/10 bg-[#0d0d18] p-1.5 md:hidden">
        {[
          ["editor", "Editor", Code2],
          ["preview", "Preview", Eye],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mobileView === id}
            onClick={() => setMobileView(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs ${
              mobileView === id
                ? "bg-purple-500/15 text-purple-300"
                : "text-gray-500"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div
        ref={workspaceRef}
        className="flex min-h-[340px] min-w-0 overflow-hidden bg-[#0d0d18]"
        style={{
          height:
            "max(340px, calc(var(--workspace-height, 600px) - 100px))",
          "--editor-width": `${editorWidth}%`,
        }}
      >

        {/* Editor */}
        <div
          className={`${
            mobileView === "editor"
              ? "flex"
              : "hidden"
          } w-full min-w-0 flex-col md:flex md:w-[var(--editor-width)] md:shrink-0`}
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#11111f] px-3">

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
              <Code2 size={16} className="text-purple-400" />
              Code Editor
            </div>

            <span className="text-[11px] text-gray-500">
              {framework.name}
            </span>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <SandpackLayout
              style={{
                border: "none",
                borderRadius: 0,
                height: "100%",
                width: "100%",
                flexWrap: "nowrap",
                gap: 0,
              }}
            >
              {showFiles && (
                <SandpackFileExplorer
                  style={{
                    height: "100%",
                    minWidth: 100,
                    maxWidth: 150,
                    borderRight: "1px solid #ffffff10",
                  }}
                />
              )}

              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                showRunButton={false}
                showRefreshButton={false}
                wrapContent
                closableTabs
                style={{
                  height: "100%",
                  minWidth: 0,
                  flex: 1,
                }}
              />
            </SandpackLayout>
          </div>

          <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#10101b] px-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: framework.color }}
              />
              {framework.name}
            </span>

            <span>UTF-8 · Auto Reload</span>
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

            event.currentTarget.setPointerCapture(
              event.pointerId
            );

            setDragging(true);
          }}
          onPointerMove={resizePanels}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onLostPointerCapture={() => setDragging(false)}
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
                      (event.key === "ArrowRight" ? 2 : -2)
                  )
                )
              );
            }
          }}
          className={`hidden w-2 shrink-0 cursor-col-resize touch-none items-center justify-center border-x border-white/5 md:flex ${
            dragging
              ? "bg-purple-500/40"
              : "bg-[#171725] hover:bg-purple-500/30"
          }`}
        >
          <GripVertical
            size={12}
            className="text-gray-500"
          />
        </div>

        {/* Preview */}
        <div
          ref={previewRef}
          className={`${
            mobileView === "preview"
              ? "flex"
              : "hidden"
          } min-h-0 min-w-0 flex-1 flex-col bg-[#11111f] md:flex fullscreen:h-screen fullscreen:w-screen`}
        >
          <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-1">

            <div className="flex items-center gap-2">
              <Eye size={15} className="text-purple-400" />

              <span className="text-xs font-semibold">
                Live Preview
              </span>
            </div>

            <DeviceControls
              device={device}
              setDevice={setDevice}
              target={previewRef}
            />
          </div>

          <DevicePreview device={device}>
            {({ width, height }) => (
              <SandpackPreview
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
                style={{
                  width,
                  height,
                  border: 0,
                  pointerEvents: dragging ? "none" : "auto",
                }}
              />
            )}
          </DevicePreview>
        </div>
      </div>

      {/* Console */}
      <div className="border-t border-white/[0.08]">

        <button
          type="button"
          aria-expanded={showConsole}
          onClick={() => setShowConsole(!showConsole)}
          className="flex h-10 w-full items-center justify-between px-3 text-xs font-medium text-gray-400 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Terminal size={15} className="text-purple-400" />
            Console
          </span>

          {showConsole ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </button>

        <div className={showConsole ? "block" : "hidden"}>
          <SandpackConsole
            showHeader
            showResetConsoleButton
            style={{
              height: 160,
              borderRadius: 0,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default function FrameworkPlayground({
  framework,
}) {
  const [resetKey, setResetKey] = useState(0);

  function resetCode() {
    if (
      window.confirm(
        "Reset all files to the default template?"
      )
    ) {
      setResetKey((previous) => previous + 1);
    }
  }

  return (
    <SandpackProvider
      key={`${framework.id}-${resetKey}`}
      template={framework.template}
      files={framework.files}
      customSetup={framework.customSetup}
      theme="dark"
      options={{
        activeFile: framework.activeFile,

        ...(framework.visibleFiles
          ? { visibleFiles: framework.visibleFiles }
          : {}),

        autorun: true,
        autoReload: true,
        recompileMode: "delayed",
        recompileDelay: 700,
      }}
    >
      <FrameworkWorkspace
        framework={framework}
        onReset={resetCode}
      />
    </SandpackProvider>
  );
}
