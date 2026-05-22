"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SuccessCheck — animation de validation (transitions-dev #10).
 * Compose fade + rotate + bob + path stroke-draw au mount/reset.
 *
 * Usage :
 *   <SuccessCheck size={20} />            // anime au mount
 *   <SuccessCheck size={20} replayKey={x} /> // replay quand replayKey change
 */
export function SuccessCheck({
  size = 24,
  color = "white",
  bg,
  replayKey,
}: {
  size?: number;
  color?: string;
  bg?: string;
  replayKey?: string | number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"out" | "in">("out");

  // Calcule la longueur du path pour le stroke-dasharray (évite l'over/under-draw)
  useEffect(() => {
    if (pathRef.current) {
      const len = Math.ceil(pathRef.current.getTotalLength() + 1);
      pathRef.current.style.setProperty("--check-path-len", `${len}`);
    }
  }, []);

  // Mount/replay : reflow puis trigger l'état "in"
  useEffect(() => {
    setState("out");
    if (wrapperRef.current) void wrapperRef.current.offsetWidth; // force reflow
    const id = requestAnimationFrame(() => setState("in"));
    return () => cancelAnimationFrame(id);
  }, [replayKey]);

  const outer = (
    <span
      ref={wrapperRef}
      className="t-success-check"
      data-state={state}
      aria-hidden="true"
      style={{ width: size, height: size, color }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path ref={pathRef} d="M5 12 L10 17 L19 7" />
      </svg>
    </span>
  );

  if (!bg) return outer;

  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: size + 8, height: size + 8, backgroundColor: bg }}
    >
      {outer}
    </span>
  );
}
