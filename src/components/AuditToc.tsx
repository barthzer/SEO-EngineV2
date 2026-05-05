"use client";

import { useEffect, useRef, useState } from "react";

export type TocItem = { id: string; label: string };

const ITEM_H = 36;

function getScrollParent(el: Element | null): Element | null {
  if (!el || el === document.documentElement) return null;
  const { overflowY, overflow } = getComputedStyle(el);
  if (/(auto|scroll)/.test(overflowY + overflow)) return el;
  return getScrollParent(el.parentElement);
}

export function AuditToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActive(items[0]?.id ?? "");
  }, [items]);

  useEffect(() => {
    const scrollEl = getScrollParent(navRef.current?.parentElement ?? null);
    if (!scrollEl) return;

    function update() {
      const containerTop = scrollEl!.getBoundingClientRect().top;
      const threshold = containerTop + 140;
      let current = items[0]?.id ?? "";
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= threshold) current = id;
      }
      setActive(current);
    }

    const t = setTimeout(update, 60);
    scrollEl.addEventListener("scroll", update, { passive: true });
    return () => {
      clearTimeout(t);
      scrollEl.removeEventListener("scroll", update);
    };
  }, [items]);

  const activeIndex = items.findIndex((i) => i.id === active);

  return (
    <nav ref={navRef} className="sticky top-[76px] flex flex-col gap-0">
      <p className="mb-2 px-3 text-[12px] font-semibold text-[var(--text-muted)]">
        Sur cette page
      </p>

      <div className="relative">
        {/* Sliding indicator — translateY avoids top-based repaint artefacts on sibling hover */}
        <span
          className="pointer-events-none absolute left-3 top-0 w-0.5 rounded-full"
          style={{
            height: 16,
            transform: `translateY(${activeIndex * ITEM_H + (ITEM_H - 16) / 2}px)`,
            backgroundColor: "var(--accent-primary)",
            transition: "transform 0.2s ease-out",
            willChange: "transform",
          }}
        />

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            style={{ height: ITEM_H }}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left transition-colors ${
              active === item.id
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <span className="w-0.5 flex-shrink-0" />
            <span className="text-[13px] font-medium leading-snug">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
