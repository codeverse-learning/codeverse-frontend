import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Terminal, Workflow, Volume2, VolumeX } from "lucide-react";
import VoiceNarrator from "./VoiceNarrator";

const SILENT_SCENE_MS = 3500;

export default function AnimationEngine({ scenes = [], onSceneChange, language = "Code" }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [mode, setMode] = useState(null); // null | "silent" | "audio"
  const [paused, setPaused] = useState(false);
  const [runId, setRunId] = useState(0);
  const [audioSupported] = useState(() =>
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
  const timerRef = useRef(null);
  const remainingRef = useRef(SILENT_SCENE_MS);
  const startedRef = useRef(0);
  const onSceneChangeRef = useRef(onSceneChange);
  const total = scenes.length;
  const scene = scenes[currentScene];

  useEffect(() => { onSceneChangeRef.current = onSceneChange; }, [onSceneChange]);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopTimer();
    remainingRef.current = SILENT_SCENE_MS;
    setCurrentScene(0);
    setMode(null);
    setPaused(false);
    setRunId((n) => n + 1);
  }, [scenes, stopTimer]);

  useEffect(() => {
    onSceneChangeRef.current?.(currentScene);
  }, [currentScene]);

  const advance = useCallback(() => {
    remainingRef.current = SILENT_SCENE_MS;
    setCurrentScene((index) => {
      if (index >= total - 1) {
        setMode(null);
        setPaused(false);
        return index;
      }
      return index + 1;
    });
  }, [total]);

  // Silent mode: advance every 3.5 seconds, preserving remaining time on pause.
  useEffect(() => {
    stopTimer();
    if (mode !== "silent" || paused || !total) return;
    startedRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      advance();
    }, remainingRef.current);
    return () => {
      if (timerRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current));
      }
      stopTimer();
    };
  }, [mode, paused, currentScene, runId, total, advance, stopTimer]);

  const start = (chosenMode) => {
    if (!total) return;
    if (mode === chosenMode) {
      setPaused((value) => !value);
      return;
    }
    stopTimer();
    remainingRef.current = SILENT_SCENE_MS;
    setPaused(false);
    // Restart at scene 1 if playback previously completed.
    if (currentScene === total - 1 && mode === null) setCurrentScene(0);
    setRunId((n) => n + 1);
    setMode(chosenMode);
  };

  const moveTo = (index) => {
    stopTimer();
    remainingRef.current = SILENT_SCENE_MS;
    setMode(null);
    setPaused(false);
    setCurrentScene(Math.max(0, Math.min(index, total - 1)));
    setRunId((n) => n + 1);
  };

  const handleVoiceEnd = useCallback(() => {
    if (mode === "audio" && !paused) advance();
  }, [mode, paused, advance]);

  if (!total || !scene) {
    return <div className="rounded-2xl border border-white/10 bg-[#11111f] p-8 text-center text-gray-400">No animation scenes available.</div>;
  }

  const type = scene.animationType || (scene.output ? "output" : scene.variable ? "variable" : "process");
  const showVariable = type === "variable" || (type === "output" && Boolean(scene.variable));

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-500/20 bg-[#11111f] text-white">
      <div className="border-b border-white/10 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-medium text-purple-400">CODEVERSE ANIMATION STUDIO</p>
            <h2 className="text-2xl font-bold">{scene.title}</h2>
          </div>
          <span className="rounded-full bg-purple-500/10 px-4 py-2 text-sm text-purple-300">Scene {currentScene + 1} / {total}</span>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" animate={{ width: `${((currentScene + 1) / total) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-8">
        <div className="rounded-xl border border-white/10 bg-[#080812] p-5">
          <p className="mb-3 text-sm font-medium text-gray-400">{language} Code</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-base leading-8 text-blue-300"><code>{scene.code}</code></pre>
        </div>

        <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#17112e] to-[#0b1630] p-6">
          <AnimatePresence mode="wait">
            <motion.div key={currentScene} initial={{ opacity: 0, scale: 0.75, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -20 }} transition={{ duration: 0.6 }} className="flex w-full flex-col items-center gap-5">
              {showVariable && (
                <div className="relative flex h-36 w-48 flex-col items-center justify-center rounded-2xl border-2 border-purple-400 bg-purple-500/15 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
                  <span className="absolute -top-4 max-w-[90%] truncate rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-semibold">{scene.variable}</span>
                  <AnimatePresence mode="wait">
                    {scene.value ? (
                      <motion.span key={scene.value} initial={{ opacity: 0, y: -45, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 13 }} className="max-w-full break-all px-3 text-center text-2xl font-bold text-white">{scene.value}</motion.span>
                    ) : (
                      <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-gray-500">Empty Box</motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {type === "process" && (
                <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 text-center">
                  <Workflow size={60} className="text-purple-300" />
                  <p className="text-lg font-semibold text-purple-100">Processing this step</p>
                  <p className="max-w-md break-words font-mono text-sm text-blue-200">{scene.code}</p>
                </motion.div>
              )}
              {(type === "output" || Boolean(scene.output)) && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-md rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-center">
                  <p className="mb-2 flex items-center justify-center gap-2 text-sm text-green-400"><Terminal size={16} /> Console Output</p>
                  <pre className="whitespace-pre-wrap break-words text-xl font-bold text-green-300">{scene.output || "Output depends on runtime input"}</pre>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`story-${currentScene}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <p className="mb-2 text-sm font-semibold text-blue-300">Let's Understand!</p>
            <p className="text-lg leading-8 text-gray-200">{scene.narration}</p>
          </motion.div>
        </AnimatePresence>

        <VoiceNarrator
          text={scene.narration || ""}
          active={mode === "audio"}
          paused={paused}
          sceneKey={`${currentScene}-${runId}`}
          onEnd={handleVoiceEnd}
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => moveTo(currentScene - 1)} disabled={currentScene === 0} className="rounded-xl border border-white/10 p-3 transition hover:bg-white/5 disabled:opacity-30" title="Previous scene" aria-label="Previous scene"><ChevronLeft size={21} /></button>
          <button type="button" onClick={() => start("silent")} className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-90 ${mode === "silent" ? "bg-blue-600" : "bg-white/10"}`}>
            {mode === "silent" && !paused ? <Pause size={19} /> : <Play size={19} />}
            {mode === "silent" ? (paused ? "Resume Without Audio" : "Pause Without Audio") : "Play Without Audio"}
          </button>
          <button type="button" onClick={() => start("audio")} disabled={!audioSupported} className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${mode === "audio" ? "bg-purple-600" : "bg-gradient-to-r from-purple-600 to-blue-600"}`}>
            {mode === "audio" && !paused ? <Pause size={19} /> : <Volume2 size={19} />}
            {mode === "audio" ? (paused ? "Resume With Audio" : "Pause With Audio") : "Play With Audio"}
          </button>
          <button type="button" onClick={() => moveTo(currentScene + 1)} disabled={currentScene === total - 1} className="rounded-xl border border-white/10 p-3 transition hover:bg-white/5 disabled:opacity-30" title="Next scene" aria-label="Next scene"><ChevronRight size={21} /></button>
          <button type="button" onClick={() => moveTo(0)} className="rounded-xl border border-white/10 p-3 transition hover:bg-white/5" title="Restart animation" aria-label="Restart animation"><RotateCcw size={19} /></button>
          {mode && <button type="button" onClick={() => { stopTimer(); setMode(null); setPaused(false); }} className="rounded-xl border border-white/10 p-3 hover:bg-white/5" title="Stop playback" aria-label="Stop playback"><VolumeX size={19} /></button>}
        </div>
        {!audioSupported && <p className="text-center text-sm text-gray-400">Audio playback is not supported by this browser.</p>}
      </div>
    </div>
  );
}
