"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";

export const GRADIENTS = [
  "linear-gradient(to bottom, #3D4FFF, #6877FF)",
  "linear-gradient(to bottom, #2563eb, #93c5fd)",
  "linear-gradient(to bottom, #4f46e5, #a5b4fc)",
  "linear-gradient(to bottom, #0284c7, #7dd3fc)",
];

export function domainGradient(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function FaviconStretch({ domain }: { domain: string }) {
  const [customImg, setCustomImg] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`project-logo:${domain}`);
    if (saved) setCustomImg(saved);
    setFaviconError(false);
  }, [domain]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setCustomImg(data);
      localStorage.setItem(`project-logo:${domain}`, data);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const initial = domain.replace(/^www\./, "")[0].toUpperCase();
  const gradient = domainGradient(domain);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImg(null);
    localStorage.removeItem(`project-logo:${domain}`);
  };

  return (
    <Tooltip label="Changer le logo du projet" side="top" portal>
      <div
        className="relative h-16 w-16 flex-shrink-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo clickable area — même fallback que ProjectFavicon (dropdown) :
            custom → Google favicon → gradient + initial */}
        <div
          className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
          onClick={() => inputRef.current?.click()}
        >
          {customImg ? (
            <img src={customImg} alt={domain} className="h-full w-full object-contain" />
          ) : !faviconError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
              alt={domain}
              onError={() => setFaviconError(true)}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[22px] font-semibold text-white" style={{ background: gradient }}>{initial}</div>
          )}

          {/* Hover overlay — "+" icon */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <PlusIcon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Remove button — superposé en haut à droite sur la bordure */}
        {customImg && hovered && (
          <button
            onClick={handleRemove}
            className="absolute -right-2 -top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </Tooltip>
  );
}

export function ScoreRing({ score, lg = false, md = false }: { score: number; lg?: boolean; md?: boolean }) {
  const color  = score >= 70 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";
  const r = lg ? 44 : md ? 32 : 28;
  const stroke = lg ? 5 : md ? 4 : 3.5;
  const sz = (r + stroke) * 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: sz, height: sz }}>
      <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-semibold leading-none text-[var(--text-primary)] ${lg ? "text-[22px]" : md ? "text-[17px]" : "text-[15px]"}`}>{score}</span>
        <span className={`text-[var(--text-muted)] ${lg ? "text-[11px]" : "text-[9px]"}`}>/100</span>
      </div>
    </div>
  );
}
