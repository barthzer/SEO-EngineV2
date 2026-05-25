export type LinkPlan = {
  source: string;
  anchor: string;
  target: string;
  impact: number;
};

export const LINK_PLAN: LinkPlan[] = [
  { source: "/collections/robes-femme",      anchor: "robe lin été",      target: "/collections/robe-lin-ete",  impact: 88 },
  { source: "/collections/pulls-cachemire",  anchor: "cachemire doux",    target: "/p/pull-col-v-laine",        impact: 74 },
  { source: "/guides/comment-choisir-robe",  anchor: "robes courtes",     target: "/collections/robes-courtes", impact: 91 },
  { source: "/collections/blouses",          anchor: "blouse légère",     target: "/collections/tops-femme",    impact: 65 },
  { source: "/p/robe-lin-marine",            anchor: "collection lin",    target: "/collections/robe-lin-ete",  impact: 82 },
];

export function ImpactBar({ value }: { value: number }) {
  const color = value >= 85 ? "var(--color-success)" : value >= 70 ? "var(--color-warning)" : "var(--accent-primary)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-medium tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}
