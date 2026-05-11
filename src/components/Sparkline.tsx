"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  inverted?: boolean;
  strokeWidth?: number;
  /** Render a filled area under the line with a vertical gradient fade */
  area?: boolean;
  /** Show data point dots on parent hover (uses Tailwind `group-hover`) */
  showDotsOnHover?: boolean;
}

export function Sparkline({
  data,
  color = "#3E50F5",
  width = 56,
  height = 22,
  inverted = false,
  strokeWidth = 1.5,
  area = false,
  showDotsOnHover = false,
}: SparklineProps) {
  if (data.length < 2) {
    return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const pct = (v - min) / range;
    const y = inverted ? height * pct : height - height * pct;
    return { x, y };
  });

  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;

  const gradId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {area && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {area && <path d={areaD} fill={`url(#${gradId})`} />}
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDotsOnHover && pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2.5}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      ))}
    </svg>
  );
}
