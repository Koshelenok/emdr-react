import { describe, expect, it } from "vitest";
import { formatTime } from "./time";

describe("formatTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(59)).toBe("0:59");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(90)).toBe("1:30");
  });

  it("rounds partial seconds up and clamps negatives", () => {
    expect(formatTime(0.2)).toBe("0:01");
    expect(formatTime(-5)).toBe("0:00");
  });
});
