import { useEffect, useState } from "react";
import { Ball } from "./components/Ball";
import { SessionHud } from "./components/SessionHud";
import { SettingsPanel } from "./components/SettingsPanel";
import { useEmdrSession } from "./hooks/useEmdrSession";
import { useHudVisibility } from "./hooks/useHudVisibility";
import { loadSettings, saveSettings } from "./lib/settings";
import type { EmdrSettings } from "./types";

/** Pause after the ball stops before the settings panel appears. */
const FINISH_DELAY_MS = 2500;

export default function App() {
  const [settings, setSettings] = useState<EmdrSettings>(loadSettings);
  const [isFinishDelayOver, setIsFinishDelayOver] = useState(false);
  const session = useEmdrSession(settings);

  const isSessionActive =
    session.status === "running" || session.status === "paused";
  const isPaused = session.status === "paused";
  const isFinishing = session.status === "finishing";
  const isWaitingAfterFinish =
    session.status === "finished" && !isFinishDelayOver;

  const isBallVisible =
    isSessionActive || isFinishing || isWaitingAfterFinish;
  const settingsVisible =
    session.status === "idle" ||
    (session.status === "finished" && isFinishDelayOver);

  const hudVisible = useHudVisibility(isSessionActive, isPaused);
  const controlsVisible = isPaused || hudVisible;
  const isCursorHidden =
    (session.status === "running" || isFinishing || isWaitingAfterFinish) &&
    !controlsVisible;

  const { status, start, pause, resume, stop } = session;

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (session.status !== "finished") {
      setIsFinishDelayOver(false);
      return;
    }

    const timer = setTimeout(() => setIsFinishDelayOver(true), FINISH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [session.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (status === "running") pause();
        else if (status === "paused") resume();
        else if (status !== "finishing") start();
      }

      if (event.code === "Escape" && isSessionActive) {
        stop();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, isSessionActive, start, pause, resume, stop]);

  return (
    <main
      className={`relative flex h-dvh w-full items-center justify-center overflow-hidden bg-neutral-950 ${
        isCursorHidden ? "cursor-none" : ""
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10),transparent_60%)]"
      />

      <div
        ref={session.trackRef}
        aria-hidden="true"
        className="absolute inset-x-0 -translate-y-1/2"
        style={{
          top: `${settings.verticalPosition}%`,
          height: session.ballSize,
        }}
      >
        {isBallVisible && (
          <Ball x={session.ballX} size={session.ballSize} />
        )}
      </div>

      {isSessionActive && (
        <SessionHud
          status={session.status}
          visible={controlsVisible}
          remainingSeconds={session.remainingSeconds}
          progress={session.progress}
          speed={settings.speed}
          onPause={session.pause}
          onResume={session.resume}
          onStop={session.stop}
        />
      )}

      {settingsVisible && (
        <>
          <SettingsPanel
            settings={settings}
            finished={session.status === "finished"}
            onChange={(patch) =>
              setSettings((current) => ({ ...current, ...patch }))
            }
            onStart={session.start}
          />

          <p className="absolute bottom-4 left-1/2 z-0 w-full -translate-x-1/2 px-4 text-center text-[11px] text-neutral-600">
            Демонстрация билатеральной стимуляции. Не заменяет работу со
            специалистом.
          </p>
        </>
      )}
    </main>
  );
}
