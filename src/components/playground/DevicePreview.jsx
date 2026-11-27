import { useLayoutEffect, useRef, useState } from "react";
import { Monitor, Tablet, Smartphone, Maximize } from "lucide-react";

export const DEVICE_SIZES = { desktop: [1280, 800], tablet: [768, 1024], mobile: [375, 667] };

export function DeviceControls({ device, setDevice, target }) {
  return <div className="flex items-center gap-1">
    {[["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]].map(([id, Icon]) => (
      <button key={id} type="button" title={id + " preview"} aria-label={id + " preview"} aria-pressed={device === id} onClick={() => setDevice(id)} className={`rounded-lg p-2 ${device === id ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-white"}`}><Icon size={18} /></button>
    ))}
    <button type="button" title="Toggle fullscreen" aria-label="Toggle fullscreen" className="rounded-lg p-2 text-gray-400 hover:text-white" onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await target.current?.requestFullscreen(); } catch (error) { console.warn("Fullscreen unavailable", error); } }}><Maximize size={18} /></button>
  </div>;
}

export default function DevicePreview({ device, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [width, height] = DEVICE_SIZES[device];
  const scale = Math.min(size.width / width, size.height / height, 1);
  return <div className="flex min-h-0 flex-1 bg-[#090914] p-2">
    <div ref={ref} className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
      <div className="relative shrink-0 overflow-hidden rounded-lg bg-white" style={{ width: width * scale, height: height * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>{children({ width, height })}</div>
      </div>
    </div>
  </div>;
}
