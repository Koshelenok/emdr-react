export type SessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "finishing"
  | "finished";

export interface EmdrSettings {
  /** Horizontal speed of the ball, pixels per second. */
  speed: number;
  /** Total session length, seconds. */
  duration: number;
  /** Vertical position of the ball, percent from the top of the screen. */
  verticalPosition: number;
}

export const SPEED_LIMITS = { min: 100, max: 1000, step: 25 } as const;
export const DURATION_LIMITS = { min: 30, max: 180, step: 15 } as const;
export const POSITION_LIMITS = { min: 15, max: 85, step: 5 } as const;

export const DEFAULT_SETTINGS: EmdrSettings = {
  speed: 350,
  duration: 60,
  verticalPosition: 50,
};
