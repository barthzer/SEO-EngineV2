"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  inverted?: boolean;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color = "#3E50F5",
  width = 56,
  height = 22,
  inverted = false,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length < 2) {
    return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const pct = (v - min) / range;
      const y = inverted
        ? height * pct
        : height - height * pct;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
