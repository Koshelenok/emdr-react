import { useEffect, useState } from "react";

/** Hide the controls after this much time without mouse/keyboard activity. */
const HIDE_DELAY_MS = 2500;

/**
 * Keeps the session controls hidden while the user is not interacting.
 *
 * A running session starts with the controls hidden. Any mouse movement (or
 * tap / key press) reveals them, and they hide again after ~2.5 seconds
 * without activity. While the session is paused the controls stay visible.
 */
export function useHudVisibility(active: boolean, paused: boolean): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    if (paused) {
      setVisible(true);
      return;
    }

    setVisible(false);

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    };

    const reveal = () => {
      setVisible(true);
      scheduleHide();
    };

    window.addEventListener("pointermove", reveal);
    window.addEventListener("pointerdown", reveal);
    window.addEventListener("touchstart", reveal);
    window.addEventListener("keydown", reveal);

    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener("pointermove", reveal);
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("keydown", reveal);
    };
  }, [active, paused]);

  return visible;
}
