
import { Lock, Layers3 } from "lucide-react";
import { PLAYGROUNDS } from "./playgroundTemplates";

export default function PlaygroundSelector({
  selected,
  onSelect,
}) {
  const activeEnvironment = PLAYGROUNDS.find(
    (item) => item.id === selected
  );

  return (
    <div className="min-w-0">
      {/* Section Label */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers3 size={13} className="text-gray-500" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
            Environment
          </span>
        </div>

        {activeEnvironment && (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

            <span className="text-[11px] text-gray-400">
              {activeEnvironment.shortName} selected
            </span>
          </div>
        )}
      </div>

      {/* Environment Tabs */}
      <div
        role="group"
        aria-label="Development environment"
        className="flex min-w-0 items-center gap-2 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:#30243f_transparent]"
      >
        {PLAYGROUNDS.map((item) => {
          const isActive = selected === item.id;
          const isDisabled = !item.enabled;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              aria-pressed={isActive}
              title={
                isDisabled
                  ? `${item.shortName} — Coming soon`
                  : item.description || item.shortName
              }
              onClick={() => onSelect(item.id)}
              className={`
                group relative flex h-10 shrink-0
                items-center gap-2 whitespace-nowrap
                rounded-lg border px-3
                text-xs font-medium
                transition-all duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-purple-500
                ${
                  isActive
                    ? "border-purple-500/50 bg-purple-500/[0.12] text-purple-200"
                    : isDisabled
                      ? "cursor-not-allowed border-white/[0.04] bg-[#10101a] text-gray-600 opacity-60"
                      : "border-white/[0.08] bg-[#11111f] text-gray-400 hover:border-white/20 hover:bg-[#19192a] hover:text-white"
                }
              `}
            >
              {/* Technology Symbol */}
              <span
                className={`
                  flex h-6 min-w-6 items-center
                  justify-center rounded-md px-1
                  text-sm font-bold leading-none
                  ${
                    isActive
                      ? "bg-purple-500/10"
                      : "bg-white/[0.03]"
                  }
                `}
                style={{
                  color: item.color || "#a78bfa",
                }}
              >
                {item.symbol}
              </span>

              {/* Environment Name */}
              <span>{item.shortName}</span>

              {/* Coming Soon Indicator */}
              {isDisabled && (
                <Lock
                  size={11}
                  className="ml-0.5 text-gray-600"
                />
              )}

              {/* Selected Indicator */}
              {isActive && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
