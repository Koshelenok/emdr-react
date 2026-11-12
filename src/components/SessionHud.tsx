import { formatTime } from "../lib/time";
import type { SessionStatus } from "../types";

interface SessionHudProps {
  status: SessionStatus;
  visible: boolean;
  remainingSeconds: number;
  progress: number;
  speed: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function SessionHud({
  status,
  visible,
  remainingSeconds,
  progress,
  speed,
  onPause,
  onResume,
  onStop,
}: SessionHudProps) {
  const isPaused = status === "paused";

  return (
    <>
      <div
        className={`absolute inset-x-0 top-0 z-10 p-4 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:p-6 ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg tabular-nums text-white">
              {formatTime(remainingSeconds)}
            </span>
            {isPaused && (
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-300">
                Пауза
              </span>
            )}
          </div>
          <span className="text-sm text-neutral-400">{speed} px/с</span>
        </div>

        <div className="mx-auto mt-3 h-1.5 max-w-3xl overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              isPaused ? "bg-amber-400" : "bg-emerald-400"
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex justify-center gap-3 p-6 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          {isPaused ? "Продолжить" : "Пауза"}
        </button>
        <button
          type="button"
          onClick={onStop}
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          Стоп
        </button>
      </div>
    </>
  );
}
