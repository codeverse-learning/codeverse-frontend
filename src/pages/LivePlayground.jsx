import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [selected, setSelected] = useState("web");

  const framework = PLAYGROUNDS.find(
    (item) => item.id === selected
  );

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
            ) : (
            <FrameworkPlayground
                key={selected}
                framework={framework}
            />
        )}

        <footer className="py-8 text-center text-xs text-gray-600">
          © 2026 CODEVERSE · Learn. Code. Create.
        </footer>

      </main>

    </div>
  );
}