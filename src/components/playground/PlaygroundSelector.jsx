import { ArrowUpRight, Lock } from "lucide-react";
import { PLAYGROUNDS } from "./playgroundTemplates";

export default function PlaygroundSelector({
  selected,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      {PLAYGROUNDS.map((item) => {
        const active = selected === item.id;

        return (
          <button
            key={item.id}
            disabled={!item.enabled}
            onClick={() => onSelect(item.id)}
            className={`relative flex flex-col items-center
              justify-center gap-2 rounded-2xl border
              p-4 text-center transition-all duration-300
              ${
                active
                  ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                  : "border-white/10 bg-[#11111f]"
              }
              ${
                item.enabled
                  ? "cursor-pointer hover:-translate-y-1 hover:border-purple-500/50"
                  : "cursor-not-allowed opacity-50"
              }`}
          >
            {item.enabled ? (
              <ArrowUpRight
                size={13}
                className="absolute right-2 top-2 text-gray-500"
              />
            ) : (
              <Lock
                size={12}
                className="absolute right-2 top-2 text-gray-500"
              />
            )}

            <span
              className="text-3xl font-bold"
              style={{ color: item.color }}
            >
              {item.symbol}
            </span>

            <span className="text-xs font-semibold text-white">
              {item.shortName}
            </span>

            <span className="text-[10px] text-gray-500">
              {item.enabled
                ? item.description
                : "Coming Soon"}
            </span>

            {active && (
              <span className="absolute bottom-0 h-0.5 w-10 rounded-full bg-purple-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}