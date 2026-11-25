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

  // Read the environment requested by the course exercise
  const [searchParams] = useSearchParams();

  const requestedEnvironment = searchParams.get("environment");

  // Automatically select a valid development environment
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

  // Check whether the playground was opened from a course
  const openedFromCourse =
    Boolean(requestedEnvironment);

  return (
    <div className="min-h-screen bg-[#080812] text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0c18]/95 px-5 py-4 backdrop-blur md:px-10">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <span className="flex items-center gap-2 font-bold text-purple-300">
            <Code2 size={20} />
            CODEVERSE
          </span>

        </div>

      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 md:px-10">

        {/* Introduction */}
        <div className="mb-7">

          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300">
            <Sparkles size={14} />
            MULTI-FRAMEWORK DEVELOPMENT ENVIRONMENT
          </span>

          <h1 className="mt-4 text-3xl font-bold md:text-4xl">
            Live Code{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Playground
            </span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Build, experiment and learn with interactive
            coding environments. Choose your preferred
            technology and see your code come to life.
          </p>

        </div>

        {/* Course Practice Information */}
        {openedFromCourse && (
          <div className="mb-6 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-5 md:p-6">

            <div className="flex items-start gap-4">

              <div className="shrink-0 rounded-xl bg-purple-500/15 p-3">
                <Code2
                  size={24}
                  className="text-purple-400"
                />
              </div>

              <div>

                <h2 className="font-semibold text-purple-200">
                  Course Practice Mode
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Write your own solution to the practice
                  exercise and preview your results using
                  the development environment below.
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  You can switch back to your course tab
                  at any time. Exercise answers are not
                  automatically graded.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Framework Selector */}
        <div className="mb-6">

          <h2 className="mb-4 text-sm font-semibold text-gray-300">
            Choose Your Development Environment
          </h2>

          <PlaygroundSelector
            selected={selected}
            onSelect={setSelected}
          />

        </div>

        {/* Active Environment */}
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

          <div className="rounded-2xl border border-white/10 bg-[#11111f] p-8 text-center">

            <Code2
              size={36}
              className="mx-auto mb-4 text-purple-400"
            />

            <h2 className="text-lg font-semibold">
              Environment Not Available
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please select another development environment.
            </p>

            <button
              onClick={() => setSelected("web")}
              className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500"
            >
              Open Web Playground
            </button>

          </div>

        )}

        <footer className="py-8 text-center text-xs text-gray-600">
          © 2026 CODEVERSE · Learn. Code. Create.
        </footer>

      </main>

    </div>
  );
}