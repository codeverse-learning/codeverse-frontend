import { useState, useLayoutEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Code2, Sparkles } from "lucide-react";
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
  const [selected, setSelected] = useState(() => ["web", "react-native", "flutter"].includes(requestedEnvironment) || PLAYGROUNDS.some(item => item.id === requestedEnvironment) ? requestedEnvironment : "web");
  const framework = PLAYGROUNDS.find(item => item.id === selected);
  const workspace = useRef(null);
  const top = useRef(null);
  const [height, setHeight] = useState(420);
  useLayoutEffect(() => {
    const update = () => setHeight(Math.max(240, Math.floor(window.innerHeight - workspace.current.getBoundingClientRect().top - window.scrollY - 105)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(top.current);
    window.addEventListener("resize", update);
    return () => { observer.disconnect(); window.removeEventListener("resize", update); };
  }, []);
  return <div className="min-h-screen w-full bg-[#080812] text-white">
    <div ref={top}>
      <header className="border-b border-white/10 bg-[#0c0c18] px-5 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"><ArrowLeft size={18} /> Dashboard</button>
          <span className="flex items-center gap-2 font-bold text-purple-300"><Code2 size={20} /> CODEVERSE</span>
        </div>
      </header>
      <div className="px-4 pt-3 md:px-5">
        <span className="flex items-center gap-2 text-xs text-purple-400"><Sparkles size={13} /> MULTI-FRAMEWORK DEVELOPMENT ENVIRONMENT</span>
        <h1 className="mt-1 text-2xl font-bold">Live Code <span className="text-purple-400">Playground</span></h1>
        {requestedEnvironment && <div className="mt-2 rounded-lg border border-purple-500/25 bg-purple-500/10 p-2 text-xs text-gray-300"><strong>Course Practice Mode:</strong> Write your solution and return to your course tab at any time. Exercise answers are not automatically graded.</div>}
        <div className="my-3"><PlaygroundSelector selected={selected} onSelect={setSelected} /></div>
      </div>
    </div>
    <main ref={workspace} className="min-w-0 px-4 md:px-5" style={{ "--workspace-height": `${height}px` }}>
      {selected === "web" ? <WebPlayground /> : selected === "react-native" ? <ReactNativePlayground /> : selected === "flutter" ? <FlutterPlayground /> : framework ? <FrameworkPlayground key={selected} framework={framework} /> : <button onClick={() => setSelected("web")}>Open Web Playground</button>}
      <footer className="py-2 text-center text-xs text-gray-600">© 2026 CODEVERSE · Learn. Code. Create.</footer>
    </main>
  </div>;
}
