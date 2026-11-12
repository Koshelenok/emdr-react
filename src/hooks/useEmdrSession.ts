import { useCallback, useEffect, useRef, useState } from "react";
import { planFrame } from "../lib/framePacing";
import { advanceBall, advanceFinish, type BallState } from "../lib/motion";
import type { EmdrSettings, SessionStatus } from "../types";

export const BALL_SIZE = 64;

/** Ignore long stalls (background tab) so the ball does not teleport. */
const MAX_FRAME_DELTA_MS = 250;

export function useEmdrSession({ speed, duration }: EmdrSettings) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [ballX, setBallX] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const ballRef = useRef<BallState>({ x: 0, direction: -1 });
  const elapsedRef = useRef(0);

  const maxX = Math.max(0, trackWidth - BALL_SIZE);
  const durationMs = duration * 1000;

  // Measure the track and keep the measurement in sync with the viewport.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => setTrackWidth(track.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Keep the ball inside the track when the window is resized.
  useEffect(() => {
    ballRef.current.x = Math.min(ballRef.current.x, maxX);
    setBallX(ballRef.current.x);
  }, [maxX]);

  useEffect(() => {
    if (status !== "running") return;

    let frameId = 0;
    let lastTime = performance.now();
    let accumulator = 0;

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, MAX_FRAME_DELTA_MS);
      lastTime = now;

      elapsedRef.current += delta;

      if (elapsedRef.current >= durationMs) {
        elapsedRef.current = durationMs;
        setElapsedMs(durationMs);
        setStatus("finishing");
        return;
      }

      const plan = planFrame(delta, accumulator);
      accumulator = plan.accumulatorMs;

      if (plan.moveMs > 0) {
        ballRef.current = advanceBall(
          ballRef.current,
          (speed * plan.moveMs) / 1000,
          maxX,
        );
        setBallX(ballRef.current.x);
        setElapsedMs(elapsedRef.current);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [status, speed, maxX, durationMs]);

  // When the time is up the ball finishes its current sweep: it goes all the
  // way to the edge, turns around and stops exactly in the horizontal center.
  useEffect(() => {
    if (status !== "finishing") return;

    let frameId = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let traveled = 0;

    const startX = ballRef.current.x;
    const direction = ballRef.current.direction;
    const speedPerMs = speed / 1000;

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, MAX_FRAME_DELTA_MS);
      lastTime = now;

      const plan = planFrame(delta, accumulator);
      accumulator = plan.accumulatorMs;

      if (plan.moveMs > 0) {
        traveled += speedPerMs * plan.moveMs;

        const next = advanceFinish(startX, direction, maxX, traveled);
        ballRef.current = { x: next.x, direction };
        setBallX(next.x);

        if (next.done) {
          setStatus("finished");
          return;
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [status, speed, maxX]);

  const start = useCallback(() => {
    elapsedRef.current = 0;
    ballRef.current = { x: maxX / 2, direction: -1 };
    setElapsedMs(0);
    setBallX(ballRef.current.x);
    setStatus("running");
  }, [maxX]);

  const pause = useCallback(() => {
    setStatus((current) => (current === "running" ? "paused" : current));
  }, []);

  const resume = useCallback(() => {
    setStatus((current) => (current === "paused" ? "running" : current));
  }, []);

  const stop = useCallback(() => {
    elapsedRef.current = 0;
    ballRef.current = { x: 0, direction: -1 };
    setElapsedMs(0);
    setBallX(0);
    setStatus("idle");
  }, []);

  return {
    trackRef,
    ballX,
    ballSize: BALL_SIZE,
    status,
    progress: durationMs === 0 ? 0 : Math.min(1, elapsedMs / durationMs),
    remainingSeconds: Math.max(0, (durationMs - elapsedMs) / 1000),
    start,
    pause,
    resume,
    stop,
  };
}
