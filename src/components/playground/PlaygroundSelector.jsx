
import { Lock } from "lucide-react";
import { PLAYGROUNDS } from "./playgroundTemplates";

export default function PlaygroundSelector({
  selected,
  onSelect,
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {PLAYGROUNDS.map((item) => {
        const active = selected === item.id;

        return (
          <button
            key={item.id}
            type="button"
            disabled={!item.enabled}
            onClick={() => onSelect(item.id)}
            title={
              item.enabled
                ? item.description
                : "Coming Soon"
            }
            aria-pressed={active}
            className={`relative flex shrink-0 items-center
              justify-center gap-2 rounded-lg border
              px-3 py-2 text-xs font-medium
              transition-all duration-200
              ${
                active
                  ? "border-purple-500 bg-purple-500/15 text-purple-200"
                  : "border-white/10 bg-[#11111f] text-gray-400"
              }
              ${
                item.enabled
                  ? "cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
                  : "cursor-not-allowed opacity-50"
              }`}
          >
            <span
              className="text-base font-bold leading-none"
              style={{ color: item.color }}
            >
              {item.symbol}
            </span>

            <span className="whitespace-nowrap">
              {item.shortName}
            </span>

            {!item.enabled && (
              <Lock size={11} />
            )}

            {active && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-purple-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
