import type { SkillAxis } from "@/data/tech-stack";

type Props = {
  data: SkillAxis[];
  size?: number;
  /** label font size in px */
  labelSize?: number;
};

/**
 * Self-contained SVG radar chart. No chart lib — we draw the rings, axes,
 * data polygon, and labels by hand so the visual reads as an "editorial
 * infographic" rather than a dashboard widget. Uses the page accent tokens
 * so it matches the warm beige palette.
 */
export function RadarChart({ data, size = 380, labelSize = 11 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const n = data.length;
  // 좌우 라벨(EMBEDDED·FRONTEND 등)이 viewBox 밖으로 잘리지 않도록 가로 여백 확보
  const padX = Math.round(size * 0.17);

  // Angle for axis i (0 at top, clockwise)
  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  // Data points (clamped 0–100)
  const points = data.map((d, i) => {
    const a = angleOf(i);
    const r = (Math.max(0, Math.min(100, d.value)) / 100) * radius;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });

  // Axis endpoints + label positions
  const axisEnds = data.map((_, i) => {
    const a = angleOf(i);
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });
  const labelPositions = data.map((_, i) => {
    const a = angleOf(i);
    const lr = radius + 22;
    return { x: cx + Math.cos(a) * lr, y: cy + Math.sin(a) * lr };
  });

  const ringScales = [0.25, 0.5, 0.75, 1];

  // Concentric polygon points helper
  const ringPoints = (scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = angleOf(i);
      return `${cx + Math.cos(a) * radius * scale},${
        cy + Math.sin(a) * radius * scale
      }`;
    }).join(" ");

  const dataPoly = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`${-padX} 0 ${size + padX * 2} ${size}`}
      className="block h-auto w-full max-w-full text-subtle"
      role="img"
      aria-label="개발 영역별 자체 평가 분포"
    >
      {/* concentric polygon grid (matches axis count so it's a polygon, not a circle) */}
      {ringScales.map((s) => (
        <polygon
          key={s}
          points={ringPoints(s)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1}
        />
      ))}

      {/* radial axis lines */}
      {axisEnds.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1}
        />
      ))}

      {/* data polygon — fill + stroke in accent */}
      <polygon
        points={dataPoly}
        fill="var(--accent-blue)"
        fillOpacity={0.18}
        stroke="var(--accent-blue)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* data points (accent dots) */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="var(--accent-pink)"
          stroke="var(--page)"
          strokeWidth={1.5}
        />
      ))}

      {/* axis labels */}
      {data.map((d, i) => {
        const p = labelPositions[i];
        // Right side → start, left side → end, top/bottom → middle
        const dx = p.x - cx;
        const anchor =
          Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={labelSize}
            fontFamily="var(--font-mono)"
            fill="var(--ink)"
            style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
