import { useState, useRef } from "react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview, SandpackFileExplorer, SandpackConsole } from "@codesandbox/sandpack-react";
import { Code2, Terminal, FolderTree, RotateCcw } from "lucide-react";
import DevicePreview, { DeviceControls } from "./DevicePreview";

export default function FrameworkPlayground({ framework }) {
  const [showFiles, setShowFiles] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [device, setDevice] = useState(framework.initialDevice || "desktop");
  const previewRef = useRef(null);
  const control = "flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5";
  return <section className="rounded-2xl border border-white/10 bg-[#11111f]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 p-2">
      <div className="flex items-center gap-3"><span className="text-xl font-bold" style={{color: framework.color}}>{framework.symbol}</span><div><h2 className="font-semibold">{framework.name} Playground</h2><p className="text-xs text-gray-500">{framework.description}</p></div></div>
      <div className="flex flex-wrap gap-2">
        <button className={control} aria-pressed={showFiles} onClick={() => setShowFiles(!showFiles)}><FolderTree size={16}/> Files</button>
        <button className={control} aria-pressed={showConsole} onClick={() => setShowConsole(!showConsole)}><Terminal size={16}/> Console</button>
        <button className={control} onClick={() => { if(window.confirm("Reset all files to the default template?")) setResetKey(k => k + 1); }}><RotateCcw size={16}/> Reset</button>
      </div>
    </div>
    <SandpackProvider key={`${framework.id}-${resetKey}`} template={framework.template} files={framework.files} customSetup={framework.customSetup} theme="dark" options={{activeFile: framework.activeFile, ...(framework.visibleFiles ? {visibleFiles: framework.visibleFiles} : {}), autorun: true, autoReload: true, recompileMode: "delayed", recompileDelay: 700}}>
      <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-2">
        <div className="flex h-[var(--workspace-height)] min-w-0 flex-col overflow-hidden bg-[#11111f]">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2 text-sm"><Code2 size={17} className="text-purple-400"/> Code Editor</div>
          <div className="min-h-0 flex-1 overflow-hidden"><SandpackLayout style={{border: "none", borderRadius: 0, height: "100%", flexWrap: "nowrap"}}>
            {showFiles && <SandpackFileExplorer style={{height: "100%", minWidth: 100, maxWidth: 150}}/>}
            <SandpackCodeEditor showTabs showLineNumbers showInlineErrors showRunButton showRefreshButton wrapContent closableTabs style={{height: "100%", minWidth: 0}}/>
          </SandpackLayout></div>
        </div>
        <div ref={previewRef} className="flex h-[var(--workspace-height)] min-w-0 flex-col bg-[#11111f] fullscreen:h-screen">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-sm">Live Preview <DeviceControls device={device} setDevice={setDevice} target={previewRef}/></div>
          <DevicePreview device={device}>{({width,height}) => <SandpackPreview showNavigator showRefreshButton showOpenInCodeSandbox={false} style={{width,height}}/>}</DevicePreview>
        </div>
      </div>
      {showConsole && <div className="border-t border-white/10"><div className="px-4 py-2 text-sm">Console Output</div><SandpackConsole showHeader showResetConsoleButton style={{height:180}}/></div>}
    </SandpackProvider>
  </section>;
}
