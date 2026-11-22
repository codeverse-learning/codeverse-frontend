import { useEffect, useRef } from "react";

// Controlled speech engine. The visible playback buttons live in AnimationEngine.
export default function VoiceNarrator({ text = "", active = false, paused = false, sceneKey, onEnd }) {
  const utteranceRef = useRef(null);
  const onEndRef = useRef(onEnd);

  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    if (!active || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim() || "This step is complete.");
    utteranceRef.current = utterance;
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    const finish = () => {
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      onEndRef.current?.();
    };
    utterance.onend = finish;
    utterance.onerror = (event) => {
      // A cancellation caused by scene navigation is not a completed scene.
      if (event.error !== "canceled" && event.error !== "interrupted") finish();
    };
    synth.speak(utterance);

    return () => {
      utteranceRef.current = null;
      synth.cancel();
    };
  }, [active, text, sceneKey]);

  useEffect(() => {
    if (!active || !utteranceRef.current || !("speechSynthesis" in window)) return;
    if (paused) window.speechSynthesis.pause();
    else window.speechSynthesis.resume();
  }, [active, paused]);

  return null;
}
