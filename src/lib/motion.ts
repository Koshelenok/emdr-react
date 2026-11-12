export interface BallState {
  /** Offset from the left edge of the track, px. */
  x: number;
  /** 1 = moving right, -1 = moving left. */
  direction: 1 | -1;
}

/**
 * Advances the ball by `distance` px and reflects it off the track edges.
 *
 * A pure function on purpose: the movement math can be tested without a DOM
 * and the React hook only has to deal with timing and rendering.
 */
export function advanceBall(
  state: BallState,
  distance: number,
  maxX: number,
): BallState {
  if (maxX <= 0 || distance === 0) {
    return state;
  }

  let x = state.x + state.direction * Math.abs(distance);
  let direction = state.direction;

  // Reflect until the ball is back inside the track. In practice the loop runs
  // at most a couple of times because frame deltas are clamped by the caller.
  while (x < 0 || x > maxX) {
    if (x < 0) {
      x = -x;
      direction = 1;
    } else {
      x = 2 * maxX - x;
      direction = -1;
    }
  }

  return { x, direction };
}

/**
 * Ball position during the final part of a session.
 *
 * When the session time is up the ball does not stop mid-track: it keeps the
 * current direction until the edge, turns around there and travels back to the
 * horizontal center, where it stops. `traveled` is the distance covered since
 * the session time ran out.
 */
export interface FinishPoint {
  /** Offset from the left edge of the track, px. */
  x: number;
  /** True once the ball has reached the center and should stop. */
  done: boolean;
}

export function advanceFinish(
  startX: number,
  direction: 1 | -1,
  maxX: number,
  traveled: number,
): FinishPoint {
  const centerX = maxX / 2;

  if (maxX <= 0) {
    return { x: 0, done: true };
  }

  const edgeX = direction === 1 ? maxX : 0;
  const toEdge = Math.abs(edgeX - startX);
  const total = toEdge + centerX;

  if (traveled >= total) {
    return { x: centerX, done: true };
  }

  if (traveled <= toEdge) {
    return { x: startX + direction * traveled, done: false };
  }

  const fromEdge = traveled - toEdge;
  const backToCenter = centerX > edgeX ? 1 : -1;

  return { x: edgeX + backToCenter * fromEdge, done: false };
}
