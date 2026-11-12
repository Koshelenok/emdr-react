import { describe, expect, it } from "vitest";
import { FRAME_STEP_MS, planFrame, TARGET_FPS } from "./framePacing";

interface Simulation {
  /** Total time the ball would have moved, ms. */
  movedMs: number;
  /** Number of rendered position updates. */
  updates: number;
}

function simulate(refreshRate: number, seconds: number): Simulation {
  const frameMs = 1000 / refreshRate;
  const frames = Math.round(refreshRate * seconds);

  let accumulator = 0;
  let movedMs = 0;
  let updates = 0;

  for (let frame = 0; frame < frames; frame += 1) {
    const plan = planFrame(frameMs, accumulator);
    accumulator = plan.accumulatorMs;

    if (plan.moveMs > 0) {
      movedMs += plan.moveMs;
      updates += 1;
    }
  }

  return { movedMs, updates };
}

describe("planFrame", () => {
  it("updates every frame on a 60 Hz display", () => {
    const plan = planFrame(1000 / 60, 0);

    expect(plan.moveMs).toBeCloseTo(1000 / 60);
    expect(plan.accumulatorMs).toBe(0);
  });

  it("skips frames on a 144 Hz display", () => {
    const first = planFrame(1000 / 144, 0);
    const second = planFrame(1000 / 144, first.accumulatorMs);
    const third = planFrame(1000 / 144, second.accumulatorMs);

    expect(first.moveMs).toBe(0);
    expect(second.moveMs).toBe(0);
    expect(third.moveMs).toBeCloseTo(1000 / 60);
  });

  it("does not move on a zero-length frame", () => {
    expect(planFrame(0, 5)).toEqual({ moveMs: 0, accumulatorMs: 5 });
  });

  it("keeps the accumulated time for the next frame", () => {
    const first = planFrame(4, 0);
    const second = planFrame(4, first.accumulatorMs);

    expect(first).toEqual({ moveMs: 0, accumulatorMs: 4 });
    expect(second).toEqual({ moveMs: 0, accumulatorMs: 8 });
  });

  it.each([60, 90, 120, 144, 240])(
    "keeps the same average speed at %i Hz",
    (refreshRate) => {
      const seconds = 30;
      const { movedMs } = simulate(refreshRate, seconds);

      // Every millisecond of wall time is turned into ball movement.
      expect(movedMs).toBeCloseTo(seconds * 1000, 0);
    },
  );

  it.each([90, 120, 144, 240])(
    "caps updates at ~60 per second at %i Hz",
    (refreshRate) => {
      const seconds = 30;
      const { updates } = simulate(refreshRate, seconds);
      const expected = TARGET_FPS * seconds;

      expect(updates).toBeGreaterThanOrEqual(expected - 2);
      expect(updates).toBeLessThanOrEqual(expected + 2);
    },
  );

  it("does not skip updates on 75 Hz and slower displays", () => {
    for (const refreshRate of [30, 60, 72]) {
      const frames = Math.round(refreshRate * 10);
      const frameMs = 1000 / refreshRate;

      let accumulator = 0;
      let updates = 0;

      for (let frame = 0; frame < frames; frame += 1) {
        const plan = planFrame(frameMs, accumulator);
        accumulator = plan.accumulatorMs;
        if (plan.moveMs > 0) updates += 1;
      }

      expect(updates).toBe(frames);
    }
  });

  it("never advances more time than actually elapsed", () => {
    let accumulator = 0;
    let movedMs = 0;
    let elapsedMs = 0;

    for (let frame = 0; frame < 1000; frame += 1) {
      const delta = 6.94;
      elapsedMs += delta;
      const plan = planFrame(delta, accumulator);
      accumulator = plan.accumulatorMs;
      movedMs += plan.moveMs;
    }

    expect(movedMs).toBeLessThanOrEqual(elapsedMs);
    expect(elapsedMs - movedMs).toBeLessThan(FRAME_STEP_MS);
  });
});
