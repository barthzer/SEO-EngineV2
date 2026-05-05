"use client";

export type FilterTab<T extends string = string> = {
  key: T;
  label: string;
  count?: number;
  color?: string;
};

interface FilterTabsProps<T extends string = string> {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function FilterTabs<T extends string = string>({ tabs, value, onChange }: FilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
            style={
              active
                ? { color: "var(--text-primary)", fontWeight: 600, backgroundColor: "var(--bg-secondary)" }
                : { color: "var(--text-muted)" }
            }
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-secondary)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-[11px] opacity-60">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
