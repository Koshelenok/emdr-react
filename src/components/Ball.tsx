interface BallProps {
  x: number;
  size: number;
}

export function Ball({ x, size }: BallProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 top-0 rounded-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 will-change-transform"
      style={{
        width: size,
        height: size,
        transform: `translate3d(${x}px, 0, 0)`,
        boxShadow:
          "0 0 28px 10px rgba(52, 211, 153, 0.4), 0 0 6px 2px rgba(16, 185, 129, 0.9), inset 0 -6px 14px rgba(6, 78, 59, 0.55)",
      }}
    />
  );
}
