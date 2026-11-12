import { describe, expect, it } from "vitest";
import { parseSettings } from "./settings";
import { DEFAULT_SETTINGS } from "../types";

describe("parseSettings", () => {
  it("returns defaults when storage is empty", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults for broken JSON", () => {
    expect(parseSettings("{not json")).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults for non-object JSON", () => {
    expect(parseSettings("42")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("null")).toEqual(DEFAULT_SETTINGS);
  });

  it("restores valid settings", () => {
    const saved = { speed: 500, duration: 120, verticalPosition: 20 };

    expect(parseSettings(JSON.stringify(saved))).toEqual(saved);
  });

  it("clamps values to the allowed ranges", () => {
    const saved = { speed: 99999, duration: 5, verticalPosition: -10 };

    expect(parseSettings(JSON.stringify(saved))).toEqual({
      speed: 1000,
      duration: 30,
      verticalPosition: 15,
    });
  });

  it("rounds values to the slider step", () => {
    const saved = { speed: 512, duration: 74, verticalPosition: 33 };

    expect(parseSettings(JSON.stringify(saved))).toEqual({
      speed: 500,
      duration: 75,
      verticalPosition: 35,
    });
  });

  it("clamps the vertical position to 15–85%", () => {
    expect(
      parseSettings(JSON.stringify({ verticalPosition: 5 })).verticalPosition,
    ).toBe(15);
    expect(
      parseSettings(JSON.stringify({ verticalPosition: 95 })).verticalPosition,
    ).toBe(85);
  });

  it("keeps valid fields and replaces broken ones", () => {
    const saved = { speed: 600, duration: "long", verticalPosition: 25 };

    expect(parseSettings(JSON.stringify(saved))).toEqual({
      speed: 600,
      duration: DEFAULT_SETTINGS.duration,
      verticalPosition: 25,
    });
  });

  it("fills the vertical position for settings saved by older versions", () => {
    const legacy = { speed: 700, duration: 90 };

    expect(parseSettings(JSON.stringify(legacy))).toEqual({
      speed: 700,
      duration: 90,
      verticalPosition: DEFAULT_SETTINGS.verticalPosition,
    });
  });
});
