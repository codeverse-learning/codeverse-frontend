
import { useState, useLayoutEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  Code2,
  ChevronRight,
  GraduationCap,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

import PlaygroundSelector from "../components/playground/PlaygroundSelector";
import FrameworkPlayground from "../components/playground/FrameworkPlayground";
import WebPlayground from "../components/playground/WebPlayground";
import ReactNativePlayground from "../components/playground/ReactNativePlayground";
import FlutterPlayground from "../components/playground/FlutterPlayground";

import { PLAYGROUNDS } from "../components/playground/playgroundTemplates";

export default function LivePlayground() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedEnvironment = searchParams.get("environment");

  const [selected, setSelected] = useState(() => {
    const validEnvironment =
      ["web", "react-native", "flutter"].includes(
        requestedEnvironment
      ) ||
      PLAYGROUNDS.some(
        (item) => item.id === requestedEnvironment && item.enabled
      );

    return validEnvironment ? requestedEnvironment : "web";
  });

  const [focusMode, setFocusMode] = useState(false);
  const [showPracticeNotice, setShowPracticeNotice] = useState(true);
  const [height, setHeight] = useState(500);

  const workspaceRef = useRef(null);
  const headerRef = useRef(null);

  const framework = PLAYGROUNDS.find(
    (item) => item.id === selected
  );

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (!workspaceRef.current) return;

      const workspaceTop =
        workspaceRef.current.getBoundingClientRect().top +
        window.scrollY;

      const availableHeight =
        window.innerHeight - workspaceTop - 24;

      setHeight(Math.max(320, Math.floor(availableHeight)));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [focusMode, showPracticeNotice]);

  useLayoutEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const renderPlayground = () => {
    switch (selected) {
      case "web":
        return <WebPlayground />;

      case "react-native":
        return <ReactNativePlayground />;

      case "flutter":
        return <FlutterPlayground />;

      default:
        return framework ? (
          <FrameworkPlayground
            key={selected}
            framework={framework}
          />
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
            <Code2 size={40} className="text-gray-600" />

            <p className="text-sm text-gray-400">
              Select a development environment to get started.
            </p>

            <button
              onClick={() => setSelected("web")}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500"
            >
              Open Web Playground
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080812] text-gray-100">
      <div ref={headerRef}>
        {/* Main Navigation */}
        {!focusMode && (
          <header className="border-b border-white/[0.07] bg-[#0d0d19]">
            <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  title="Back to dashboard"
                  aria-label="Back to dashboard"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-gray-400 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
                >
                  <ArrowLeft size={17} />
                </button>

                <div className="hidden items-center gap-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                    <Code2 size={19} />
                  </div>

                  <span className="text-sm font-bold tracking-wider text-white">
                    CODEVERSE
                  </span>
                </div>

                <ChevronRight
                  size={15}
                  className="hidden text-gray-700 sm:block"
                />

                <span className="truncate text-sm font-medium text-gray-300">
                  Live Playground
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFocusMode(true)}
                title="Enter focus mode"
                className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-400 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
              >
                <Maximize2 size={14} />

                <span className="hidden sm:inline">
                  Focus Mode
                </span>
              </button>
            </div>
          </header>
        )}

        {/* Workspace Toolbar */}
        <section className="border-b border-white/[0.06] bg-[#0b0b16] px-4 lg:px-6">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-semibold text-white">
                <Code2 size={18} className="text-purple-400" />
                Development Workspace
              </h1>

              {!focusMode && (
                <p className="mt-1 hidden text-xs text-gray-500 md:block">
                  Write, experiment and preview your code in real time.
                </p>
              )}
            </div>

            {focusMode && (
              <button
                type="button"
                onClick={() => setFocusMode(false)}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs text-purple-300 transition hover:bg-purple-500/20"
              >
                <Minimize2 size={14} />
                Exit Focus
              </button>
            )}
          </div>

          {/* Course Practice Notice */}
          {requestedEnvironment &&
            showPracticeNotice &&
            !focusMode && (
              <div className="mb-3 flex items-start gap-3 rounded-lg border border-purple-500/20 bg-purple-500/[0.06] px-3 py-2.5">
                <GraduationCap
                  size={18}
                  className="mt-0.5 shrink-0 text-purple-400"
                />

                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-300">
                    Course Practice Mode
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    Practice your solution here and return to your
                    course when ready. Exercises are not
                    automatically graded.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPracticeNotice(false)}
                  title="Dismiss notice"
                  aria-label="Dismiss practice notice"
                  className="rounded p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            )}

          {/* Environment Navigation */}
          <PlaygroundSelector
            selected={selected}
            onSelect={setSelected}
          />
        </section>
      </div>

      {/* Coding Workspace */}
      <main
        ref={workspaceRef}
        className="min-w-0 px-3 pb-3 pt-3 lg:px-4"
        style={{
          "--workspace-height": `${height}px`,
        }}
      >
        {renderPlayground()}
      </main>
    </div>
  );
}
