import { Lock } from "lucide-react";
import { PLAYGROUNDS } from "./playgroundTemplates";
export default function PlaygroundSelector({ selected, onSelect }) {
  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
    {PLAYGROUNDS.map(item => <button key={item.id} type="button" disabled={!item.enabled} aria-pressed={selected === item.id} title={item.enabled ? item.description : "Coming Soon"} onClick={() => onSelect(item.id)} className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 transition ${selected === item.id ? "border-purple-500 bg-purple-500/15 text-purple-200" : "border-white/10 bg-[#11111f] text-gray-300"} ${item.enabled ? "hover:border-purple-400" : "opacity-50 cursor-not-allowed"}`}>
      <span className="text-xl font-bold leading-none" style={{ color: item.color }}>{item.symbol}</span><span className="text-xs font-semibold text-center">{item.shortName}</span>{!item.enabled && <Lock size={12} className="absolute right-1 top-1" />}
    </button>)}
  </div>;
}
