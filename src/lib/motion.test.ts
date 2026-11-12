import { describe, expect, it } from "vitest";
import { advanceBall, advanceFinish } from "./motion";

describe("advanceBall", () => {
  it("moves the ball when it is away from the edges", () => {
    expect(advanceBall({ x: 10, direction: 1 }, 5, 100)).toEqual({
      x: 15,
      direction: 1,
    });
  });

  it("bounces off the right edge", () => {
    expect(advanceBall({ x: 98, direction: 1 }, 5, 100)).toEqual({
      x: 97,
      direction: -1,
    });
  });

  it("bounces off the left edge", () => {
    expect(advanceBall({ x: 2, direction: -1 }, 5, 100)).toEqual({
      x: 3,
      direction: 1,
    });
  });

  it("keeps a huge step inside the track", () => {
    const result = advanceBall({ x: 50, direction: 1 }, 250, 100);

    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(100);
  });

  it("does nothing when the track has no width", () => {
    expect(advanceBall({ x: 0, direction: 1 }, 10, 0)).toEqual({
      x: 0,
      direction: 1,
    });
  });
});

describe("advanceFinish", () => {
  it("keeps moving right until the right edge", () => {
    expect(advanceFinish(500, 1, 1000, 250)).toEqual({
      x: 750,
      done: false,
    });
    expect(advanceFinish(500, 1, 1000, 500)).toEqual({
      x: 1000,
      done: false,
    });
  });

  it("keeps moving left until the left edge", () => {
    expect(advanceFinish(500, -1, 1000, 250)).toEqual({
      x: 250,
      done: false,
    });
    expect(advanceFinish(500, -1, 1000, 500)).toEqual({
      x: 0,
      done: false,
    });
  });

  it("turns at the edge and goes back to the center", () => {
    expect(advanceFinish(500, 1, 1000, 750)).toEqual({
      x: 750,
      done: false,
    });
    expect(advanceFinish(500, -1, 1000, 750)).toEqual({
      x: 250,
      done: false,
    });
  });

  it("stops exactly at the center", () => {
    expect(advanceFinish(500, 1, 1000, 1000)).toEqual({
      x: 500,
      done: true,
    });
    expect(advanceFinish(500, -1, 1000, 1000)).toEqual({
      x: 500,
      done: true,
    });
    expect(advanceFinish(100, -1, 1000, 5000)).toEqual({
      x: 500,
      done: true,
    });
  });

  it("still goes to the edge when it is close to it", () => {
    const edge = advanceFinish(990, 1, 1000, 10);
    const back = advanceFinish(990, 1, 1000, 310);

    expect(edge).toEqual({ x: 1000, done: false });
    expect(back.x).toBeCloseTo(700);
    expect(back.done).toBe(false);
  });

  it("never leaves the track", () => {
    for (let traveled = 0; traveled <= 1200; traveled += 10) {
      const { x } = advanceFinish(500, 1, 1000, traveled);

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1000);
    }
  });

  it("is already done when the track has no width", () => {
    expect(advanceFinish(0, 1, 0, 0)).toEqual({ x: 0, done: true });
  });
});
