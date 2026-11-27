import { useState, useRef } from "react";
import DevicePreview, { DeviceControls } from "./DevicePreview";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Smartphone, Copy, Download, Terminal, Code2, Loader2, CheckCircle2, AlertCircle, Eye, GripVertical, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8080/api" : "/api")
).replace(/\/$/, "");

const DEFAULT_CODE = `import 'package:flutter/material.dart';

void main() {
  runApp(const CodeverseApp());
}

class CodeverseApp extends StatelessWidget {
  const CodeverseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080812),
      appBar: AppBar(
        title: const Text('CODEVERSE'),
        centerTitle: true,
        backgroundColor: const Color(0xFF7C3AED),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const FlutterLogo(size: 80),
              const SizedBox(height: 24),
              const Text(
                'Hello, Flutter!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Build something amazing.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              Text(
                '$count',
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA78BFA),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                ),
                onPressed: () {
                  setState(() {
                    count++;
                  });
                },
                child: const Text('Increase Count'),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    count = 0;
                  });
                },
                child: const Text('Reset'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`;


function FlutterPlayground() {
  const previewRef = useRef(null);
  const workspaceRef = useRef(null);
  const [editorWidth, setEditorWidth] = useState(45);
  const [dragging, setDragging] = useState(false);
  const [mobileView, setMobileView] = useState("editor");
  const resize = (event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (bounds?.width) setEditorWidth(Math.max(30, Math.min(70, (event.clientX - bounds.left) / bounds.width * 100)));
  };
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [logs, setLogs] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [device, setDevice] = useState("mobile");
  const [showConsole, setShowConsole] = useState(false);
  const [copied, setCopied] = useState(false);

  const runningRef = useRef(false);


  const runCode = async () => {
    if (runningRef.current) return;

    if (!code.trim()) {
      setError("Please enter Flutter code.");
      setStatus("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to run Flutter code.");
      setStatus("error");
      return;
    }

    runningRef.current = true;

    setMobileView("preview");
    setLoading(true);
    setError("");
    setPreviewUrl("");
    setLogs("Starting Flutter compilation...");
    setStatus("compiling");

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 240000);

    try {
      const response = await fetch(
        `${API_URL}/flutter/compile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
          signal: controller.signal,
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      setLogs(data.logs || "");

      if (!data.success) {
        throw new Error(
          data.error || "Flutter compilation failed."
        );
      }

      if (!data.previewUrl) {
        throw new Error("Preview URL was not returned.");
      }

      const url = new URL(data.previewUrl);

      if (
        url.origin !== "http://127.0.0.1:8092" ||
        !/^\/preview\/[a-f0-9]{32}\/$/.test(url.pathname)
      ) {
        throw new Error("Invalid Flutter preview URL.");
      }

      setPreviewUrl(url.href);
      setStatus("success");

    } catch (err) {
      setStatus("error");

      if (err.name === "AbortError") {
        setError("Compilation request timed out.");
      } else {
        setError(err.message || "Unable to compile Flutter code.");
      }

      setShowConsole(true);

    } finally {
      clearTimeout(timeout);
      setLoading(false);
      runningRef.current = false;
    }
  };

  const resetCode = () => {
    if (loading) return;

    if (!window.confirm("Reset Flutter code to the default example?")) {
      return;
    }

    setCode(DEFAULT_CODE);
    setPreviewUrl("");
    setLogs("");
    setError("");
    setStatus("idle");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch {
      setError("Unable to copy code.");
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "main.dart";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const control = "flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50";
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#11111f]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400"><Smartphone size={19}/></div>
          <div><h2 className="text-sm font-semibold">Flutter Playground</h2><p className="text-[11px] text-gray-400">Dart · Flutter Web</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={control} onClick={resetCode} disabled={loading}><RotateCcw size={15}/> Reset</button>
          <button type="button" onClick={runCode} disabled={loading} className="flex h-9 items-center gap-2 rounded-lg bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50">{loading ? <Loader2 size={15} className="animate-spin"/> : <Play size={14} fill="currentColor"/>}{loading ? "Compiling..." : "Run Code"}</button>
        </div>
      </div>
      <div className="flex gap-1 border-b border-white/10 bg-[#0d0d18] p-1.5 md:hidden">
        {[["editor", "Editor", Code2], ["preview", "Preview", Eye]].map(([id, label, Icon]) => <button key={id} type="button" aria-pressed={mobileView === id} onClick={() => setMobileView(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs ${mobileView === id ? "bg-purple-500/15 text-purple-300" : "text-gray-400"}`}><Icon size={15}/>{label}</button>)}
      </div>
      <div ref={workspaceRef} className="flex min-h-[340px] min-w-0 overflow-hidden bg-[#0d0d18]" style={{height: "max(420px, calc(var(--workspace-height, 600px) - 100px))", "--editor-width": `${editorWidth}%`}}>
        <div className={`${mobileView === "editor" ? "flex" : "hidden"} w-full min-w-0 flex-col md:flex md:w-[var(--editor-width)] md:shrink-0`}>
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#11111f] px-3">
            <span className="flex items-center gap-2 text-xs font-medium"><Code2 size={16} className="text-sky-400"/> main.dart</span>
            <div className="flex items-center gap-3 text-gray-400">
              <button type="button" onClick={copyCode} title="Copy code" aria-label="Copy code" className="hover:text-white">{copied ? <CheckCircle2 size={16} className="text-green-400"/> : <Copy size={16}/>}</button>
              <button type="button" onClick={downloadCode} title="Download main.dart" aria-label="Download main.dart" className="hover:text-white"><Download size={16}/></button>
            </div>
          </div>
          <div className="min-h-0 min-w-0 flex-1"><Editor height="100%" language="dart" path="main.dart" theme="vs-dark" value={code} onChange={value => setCode(value ?? "")} options={{fontSize:14,lineHeight:23,minimap:{enabled:false},automaticLayout:true,scrollBeyondLastLine:false,wordWrap:"on",tabSize:2,lineNumbers:"on",formatOnPaste:true,bracketPairColorization:{enabled:true},padding:{top:14,bottom:14}}}/></div>
          <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/10 bg-[#10101b] px-3 text-[11px] text-gray-400"><span>Dart</span><span>UTF-8 · Spaces: 2</span></div>
        </div>
        <div role="separator" aria-label="Resize editor and preview" aria-orientation="vertical" aria-valuemin={30} aria-valuemax={70} aria-valuenow={Math.round(editorWidth)} tabIndex={0} title="Drag to resize. Double-click to reset." onPointerDown={event => {event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);}} onPointerMove={resize} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} onLostPointerCapture={() => setDragging(false)} onDoubleClick={() => setEditorWidth(45)} onKeyDown={event => {if (["ArrowLeft","ArrowRight"].includes(event.key)) {event.preventDefault();setEditorWidth(value => Math.max(30,Math.min(70,value+(event.key === "ArrowRight" ? 2 : -2))));}}} className={`hidden w-2 shrink-0 cursor-col-resize touch-none items-center justify-center md:flex ${dragging ? "bg-purple-500/40" : "bg-[#171725] hover:bg-purple-500/30"}`}><GripVertical size={12}/></div>
        <div ref={previewRef} className={`${mobileView === "preview" ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col bg-[#11111f] md:flex fullscreen:h-screen fullscreen:w-screen`}>
          <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-1"><span className="flex items-center gap-2 text-xs font-semibold"><Eye size={15} className="text-purple-400"/> Live Preview</span><DeviceControls device={device} setDevice={setDevice} target={previewRef}/></div>
          {previewUrl ? <DevicePreview device={device}>{({width,height}) => <iframe key={previewUrl} src={previewUrl} title="Flutter Application Preview" sandbox="allow-scripts" referrerPolicy="no-referrer" style={{width,height,border:0,display:"block",pointerEvents:dragging ? "none" : "auto"}}/>}</DevicePreview> : <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#090910] p-5 text-center"><div className="max-w-xs">
            {loading ? <><Loader2 size={32} className="mx-auto mb-4 animate-spin text-purple-400"/><h3 className="text-sm font-semibold">Compiling Flutter application</h3><p className="mt-2 text-xs text-gray-400">This may take a few minutes.</p></> : <><Smartphone size={36} className="mx-auto mb-4 text-sky-400"/><h3 className="text-sm font-semibold">{status === "error" ? "Build failed" : "Your app preview"}</h3><p className="my-3 text-xs text-gray-400">{status === "error" ? "Check the console and try again." : "Run your Dart code to see your Flutter application here."}</p><button type="button" onClick={runCode} className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold hover:bg-purple-500">{status === "error" ? "Try again" : "Run Flutter App"}</button></>}
          </div></div>}
        </div>
      </div>
      {error && <div role="alert" className="flex items-start gap-2 border-t border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={16} className="shrink-0"/><span className="break-words">{error}</span></div>}
      <div className="border-t border-white/10">
        <div className="flex h-10 items-center justify-between gap-2 px-3">
          <button type="button" aria-expanded={showConsole} onClick={() => setShowConsole(value => !value)} className="flex items-center gap-2 text-xs text-gray-300"><Terminal size={15} className="text-purple-400"/> Console {showConsole ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</button>
          <div className="flex items-center gap-3 text-xs"><span role="status" className={status === "error" ? "text-red-400" : status === "success" ? "text-green-400" : "text-gray-400"}>{({idle:"Ready",compiling:"Compiling",success:"Build successful",error:"Build failed"})[status]}</span><button type="button" onClick={() => setLogs("")} className="text-gray-400 hover:text-white">Clear</button></div>
        </div>
        {showConsole && <pre className="h-40 overflow-auto whitespace-pre-wrap break-words border-t border-white/10 bg-[#080812] p-3 font-mono text-xs text-gray-300">{logs || "Compilation output will appear here..."}</pre>}
      </div>
    </section>
  );
}

export default FlutterPlayground;
