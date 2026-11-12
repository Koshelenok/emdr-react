/** How many ball updates per second we aim for. */
export const TARGET_FPS = 60;

/** Duration of one ball update, ms. */
export const FRAME_STEP_MS = 1000 / TARGET_FPS;

/**
 * Displays refreshing at roughly this rate or slower are updated on every
 * frame: on a 60 Hz screen the browser already gives us ~60 frames, and
 * skipping some of them would only make the motion look uneven.
 */
const NATIVE_FRAME_RATIO = 0.8;

export interface FramePlan {
  /** Time to advance the ball by, ms. `0` means no update this frame. */
  moveMs: number;
  /** Time left for the next frame, ms. */
  accumulatorMs: number;
}

/**
 * Plans one animation frame.
 *
 * `requestAnimationFrame` fires at the monitor refresh rate: ~60 times per
 * second on a regular screen, but 120-240 times per second on a gaming
 * monitor. Rendering every one of those frames is wasted work, so on fast
 * displays the ball is updated at ~60 Hz instead. Movement is still based on
 * elapsed time, which keeps the speed exactly the same in px/s.
 */
export function planFrame(
  deltaMs: number,
  accumulatorMs: number,
  stepMs: number = FRAME_STEP_MS,
): FramePlan {
  if (deltaMs <= 0) {
    return { moveMs: 0, accumulatorMs };
  }

  const accumulated = accumulatorMs + deltaMs;

  // 60 Hz and slower: update every frame, using the real frame time.
  if (deltaMs >= stepMs * NATIVE_FRAME_RATIO) {
    return { moveMs: accumulated, accumulatorMs: 0 };
  }

  // Faster display: advance in whole 1/60 s steps, keeping the remainder so
  // no time is lost and the average speed stays exact.
  const steps = Math.floor((accumulated + 1e-9) / stepMs);

  if (steps < 1) {
    return { moveMs: 0, accumulatorMs: accumulated };
  }

  return {
    moveMs: steps * stepMs,
    accumulatorMs: accumulated - steps * stepMs,
  };
}
