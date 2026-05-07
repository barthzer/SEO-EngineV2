"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const color = (s: number) => s >= 70 ? "#10B981" : s >= 40 ? "#F59E0B" : "#E11D48";

export function ScoreRing({ score, size = 80, strokeWidth = 8 }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = score > 0 ? (score / 100) * circumference : 0;
  const fontSize = Math.round(size * 0.24);
  const subSize = Math.round(size * 0.13);
  const c = color(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
      {score > 0 && (
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`} />
      )}
      <text x={cx} y={cx + fontSize * 0.35} textAnchor="middle" fontSize={fontSize} fontWeight={700}
        fill={score > 0 ? c : "var(--text-muted)"}>
        {score > 0 ? score : "—"}
      </text>
      <text x={cx} y={cx + fontSize * 0.35 + subSize + 2} textAnchor="middle" fontSize={subSize}
        fill="var(--text-muted)">/100</text>
    </svg>
  );
}
