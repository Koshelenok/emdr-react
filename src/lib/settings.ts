import {
  DEFAULT_SETTINGS,
  DURATION_LIMITS,
  POSITION_LIMITS,
  SPEED_LIMITS,
  type EmdrSettings,
} from "../types";

export const SETTINGS_STORAGE_KEY = "emdr.settings.v1";

interface Limits {
  min: number;
  max: number;
  step: number;
}

function normalizeNumber(
  value: unknown,
  limits: Limits,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const clamped = Math.min(limits.max, Math.max(limits.min, value));
  return Math.round(clamped / limits.step) * limits.step;
}

/**
 * Turns raw storage contents into valid settings.
 *
 * Every field is validated separately, so a partially broken or outdated
 * record keeps the values that are still usable and falls back to defaults
 * only for the missing/invalid ones.
 */
export function parseSettings(raw: string | null): EmdrSettings {
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const record = parsed as Record<string, unknown>;

  return {
    speed: normalizeNumber(record.speed, SPEED_LIMITS, DEFAULT_SETTINGS.speed),
    duration: normalizeNumber(
      record.duration,
      DURATION_LIMITS,
      DEFAULT_SETTINGS.duration,
    ),
    verticalPosition: normalizeNumber(
      record.verticalPosition,
      POSITION_LIMITS,
      DEFAULT_SETTINGS.verticalPosition,
    ),
  };
}

export function loadSettings(): EmdrSettings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: EmdrSettings): void {
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    // Storage can be unavailable (private mode, quota, disabled cookies).
    // The app still works with in-memory settings.
  }
}
