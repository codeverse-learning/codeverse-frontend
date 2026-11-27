
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  Code2,
  Sparkles,
} from "lucide-react";

import PlaygroundSelector from "../components/playground/PlaygroundSelector";
import FrameworkPlayground from "../components/playground/FrameworkPlayground";
import WebPlayground from "../components/playground/WebPlayground";
import ReactNativePlayground from "../components/playground/ReactNativePlayground";
import FlutterPlayground from "../components/playground/FlutterPlayground";

import {
  PLAYGROUNDS,
} from "../components/playground/playgroundTemplates";

export default function LivePlayground() {
  const navigate = useNavigate();

  // Read environment requested by course exercise
  const [searchParams] = useSearchParams();

  const requestedEnvironment = searchParams.get("environment");

  // Automatically select a valid environment
  const [selected, setSelected] = useState(() => {
    const isValidEnvironment =
      requestedEnvironment === "web" ||
      requestedEnvironment === "react-native" ||
      requestedEnvironment === "flutter" ||
      PLAYGROUNDS.some(
        (item) => item.id === requestedEnvironment
      );

    return isValidEnvironment
      ? requestedEnvironment
      : "web";
  });

  const framework = PLAYGROUNDS.find(
    (item) => item.id === selected
  );

  const openedFromCourse = Boolean(requestedEnvironment);

  return (
    <div className="min-h-screen w-full bg-[#080812] text-white">

      {/* Compact Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c18]/95 px-4 py-3 backdrop-blur">

        <div className="flex w-full items-center justify-between">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <span className="flex items-center gap-2 text-sm font-bold tracking-wider text-purple-300">
            <Code2 size={19} />
            CODEVERSE
          </span>

        </div>

      </header>

      {/* Full Width Main Workspace */}
      <main className="w-full min-w-0 px-3 py-4 md:px-5">

        {/* Compact Introduction */}
        <div className="mb-4">

          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-purple-400">
            <Sparkles size={12} />
            MULTI-FRAMEWORK DEVELOPMENT ENVIRONMENT
          </span>

          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Live Code{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Playground
            </span>
          </h1>

          <p className="mt-1.5 text-xs leading-5 text-gray-400 md:text-sm">
            Write, experiment and preview your code in real time.
          </p>

        </div>

        {/* Compact Course Practice Mode */}
        {openedFromCourse && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">

            <div className="shrink-0 rounded-lg bg-purple-500/15 p-2">
              <Code2
                size={18}
                className="text-purple-400"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-purple-200">
                Course Practice Mode
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Write your solution and preview the results.
                You can return to your course tab at any time.
                Exercise answers are not automatically graded.
              </p>
            </div>

          </div>
        )}

        {/* Compact Framework Selector */}
        <div className="mb-4 min-w-0">

          <h2 className="mb-2 text-xs font-semibold text-gray-400">
            Development Environment
          </h2>

          <div className="w-full overflow-x-auto pb-2">

            <div className="min-w-0
              [&_button]:!min-h-0
              [&_button]:!gap-2
              [&_button]:!rounded-lg
              [&_button]:!px-3
              [&_button]:!py-2
              [&_button]:!text-xs
              [&_button_svg]:!h-5
              [&_button_svg]:!w-5">

              <PlaygroundSelector
                selected={selected}
                onSelect={setSelected}
              />

            </div>

          </div>

        </div>

        {/* Active Development Workspace */}
        <section className="w-full min-w-0">

          {selected === "web" ? (

            <WebPlayground />

          ) : selected === "react-native" ? (

            <ReactNativePlayground />

          ) : selected === "flutter" ? (

            <FlutterPlayground />

          ) : framework ? (

            <FrameworkPlayground
              key={selected}
              framework={framework}
            />

          ) : (

            <div className="rounded-xl border border-white/10 bg-[#11111f] p-8 text-center">

              <Code2
                size={32}
                className="mx-auto mb-3 text-purple-400"
              />

              <h2 className="text-lg font-semibold">
                Environment Not Available
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Please select another development environment.
              </p>

              <button
                onClick={() => setSelected("web")}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-purple-500"
              >
                Open Web Playground
              </button>

            </div>

          )}

        </section>

        {/* Footer */}
        <footer className="py-5 text-center text-[11px] text-gray-600">
          © 2026 CODEVERSE · Learn. Code. Create.
        </footer>

      </main>

    </div>
  );
}
