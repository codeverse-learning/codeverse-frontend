
import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
  Copy,
  Download,
  Terminal,
  Code2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

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

const DEVICES = [
  {
    id: "mobile",
    name: "Mobile",
    icon: Smartphone,
    width: "340px",
  },
  {
    id: "tablet",
    name: "Tablet",
    icon: Tablet,
    width: "768px",
  },
  {
    id: "desktop",
    name: "Desktop",
    icon: Monitor,
    width: "100%",
  },
];

function FlutterPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [logs, setLogs] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [device, setDevice] = useState("mobile");
  const [showConsole, setShowConsole] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const runningRef = useRef(false);

  const selectedDevice = DEVICES.find(
    (item) => item.id === device
  );

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

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#11111f] p-4">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-sky-500/10 p-3">
            <Smartphone className="text-sky-400" size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Flutter Playground
            </h2>

            <p className="text-sm text-gray-400">
              Build beautiful applications with Dart
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              showConsole
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                : "border-white/10 text-gray-400"
            }`}
          >
            <Terminal size={16} />
            Console
          </button>

          <button
            onClick={resetCode}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Play size={17} />
            )}

            {loading ? "Compiling..." : "Run Code"}
          </button>

        </div>

      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">

        {/* Code Editor */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#11111f]">

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-sky-400" />

              <span className="text-sm font-medium text-white">
                main.dart
              </span>

              <span className="rounded-md bg-sky-500/10 px-2 py-1 text-xs text-sky-400">
                Dart
              </span>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={copyCode}
                title="Copy code"
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <CheckCircle2 size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>

              <button
                onClick={downloadCode}
                title="Download main.dart"
                className="text-gray-400 hover:text-white"
              >
                <Download size={18} />
              </button>

            </div>

          </div>

          <Editor
            height="650px"
            language="dart"
            path="main.dart"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              lineNumbers: "on",
              formatOnPaste: true,
              bracketPairColorization: {
                enabled: true,
              },
              padding: {
                top: 16,
                bottom: 16,
              },
            }}
          />

        </div>

        {/* Live Preview */}
        <div
          className={`min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#11111f] ${
            fullscreen
              ? "fixed inset-4 z-[100] flex flex-col shadow-2xl"
              : ""
          }`}
        >

          {/* Preview Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">

            <div className="flex items-center gap-2">

              <Monitor size={18} className="text-purple-400" />

              <span className="text-sm font-medium text-white">
                Live Preview
              </span>

            </div>

            <div className="flex items-center gap-2">

              {DEVICES.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setDevice(item.id)}
                    title={item.name}
                    className={`rounded-lg p-2 transition ${
                      device === item.id
                        ? "bg-purple-500/15 text-purple-400"
                        : "text-gray-500 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}

              <button
                onClick={() => setFullscreen(!fullscreen)}
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                {fullscreen ? (
                  <X size={18} />
                ) : (
                  <Maximize size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Preview Content */}
          <div
            className={`flex items-center justify-center overflow-auto bg-[#080812] p-4 sm:p-6 ${
              fullscreen ? "flex-1 min-h-0" : "min-h-[650px]"
            }`}
          >

            {loading ? (

              <div className="max-w-xs text-center">

                <Loader2
                  size={48}
                  className="mx-auto mb-5 animate-spin text-purple-400"
                />

                <h3 className="font-semibold text-white">
                  Compiling Flutter Application
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Building your Dart code into a Flutter Web application.
                  This may take a few minutes.
                </p>

              </div>

            ) : previewUrl ? (

              <div
                className={`overflow-hidden bg-[#222230] transition-all ${
                  device === "mobile"
                    ? "rounded-[40px] border-[7px] border-[#353545] p-1"
                    : "rounded-xl border border-white/10"
                }`}
                style={{
                  width: selectedDevice.width,
                  maxWidth: "100%",
                }}
              >

                {device === "mobile" && (
                  <div className="flex justify-center py-2">
                    <div className="h-5 w-24 rounded-full bg-black" />
                  </div>
                )}

                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  title="Flutter Application Preview"
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  className={`w-full bg-white ${
                    device === "mobile"
                      ? "rounded-[28px]"
                      : "rounded-lg"
                  }`}
                  style={{
                    height: fullscreen
                      ? "65vh"
                      : device === "mobile"
                      ? "540px"
                      : "590px",
                    border: "none",
                  }}
                />

                {device === "mobile" && (
                  <div className="flex justify-center py-3">
                    <div className="h-1 w-24 rounded-full bg-gray-400" />
                  </div>
                )}

              </div>

            ) : (

              <div className="max-w-xs text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10">
                  <Smartphone
                    size={40}
                    className="text-sky-400"
                  />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Flutter Preview
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Write your Dart code and click Run Code to see
                  your application here.
                </p>

                <button
                  onClick={runCode}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500"
                >
                  <Play size={16} />
                  Run Flutter App
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* Error Message */}
      {error && (

        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <h3 className="font-semibold text-red-400">
              Error
            </h3>

            <p className="mt-1 break-words text-sm text-red-300">
              {error}
            </p>
          </div>

        </div>

      )}

      {/* Compilation Console */}
      {showConsole && (

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11111f]">

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">

            <div className="flex items-center gap-2">

              <Terminal
                size={18}
                className="text-purple-400"
              />

              <span className="font-medium text-white">
                Compilation Console
              </span>

            </div>

            <div className="flex items-center gap-3">

              {status === "success" && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 size={15} />
                  Build Successful
                </span>
              )}

              {status === "compiling" && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <Loader2 size={15} className="animate-spin" />
                  Compiling
                </span>
              )}

              {status === "error" && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={15} />
                  Build Failed
                </span>
              )}

              <button
                onClick={() => setLogs("")}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>

            </div>

          </div>

          <div className="max-h-[260px] min-h-[150px] overflow-auto bg-[#080812] p-4">

            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-gray-300">
              {logs || "Compilation output will appear here..."}
            </pre>

          </div>

        </div>

      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-500">

        <span>
          Powered by Flutter SDK, Dart and Docker
        </span>

        <span>
          Flutter Web Preview • CODEVERSE
        </span>

      </div>

    </div>
  );
}

export default FlutterPlayground;
