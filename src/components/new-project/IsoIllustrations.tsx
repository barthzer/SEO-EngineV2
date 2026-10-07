"use client";

/**
 * Illustrations isométriques de la modale « Nouveau projet ».
 * Méthode : skill `isometric-objects` (.claude/skills/isometric-objects/SKILL.md).
 *
 * Un seul symbole par étape, sans décor :
 *  - étape 1 : la page web (scan pendant la vérification, deux pages si redirection) ;
 *  - étape 2 : le calendrier posé à plat + une tuile horloge ;
 *  - étape 3 : la tuile Google + la page web (même orientation qu'à l'étape 1).
 *
 * Rendu : projection isométrique vraie, blocs ARRONDIS (profil en rectangle arrondi
 * extrudé), faces ombrées selon leur normale (3 tons), contours fins navy
 * (désactivables via `IsoOutlineContext` si besoin). Le contenu
 * plat est dessiné dans le plan de sa face. Un seul accent (bleu de marque).
 * Mouvement = phase de boucle `p` à cycles entiers ; mouvement réduit → image fixe.
 */

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from "react";

/* ── Projection ──────────────────────────────────────────────────────── */

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const TAU = Math.PI * 2;
type P = [number, number];
type V3 = [number, number, number];
const iso = (x: number, y: number, z: number): P => [(x - y) * C, (x + y) * S - z];
const isoV = (v: V3): P => iso(v[0], v[1], v[2]);
const pts = (ps: P[]) => ps.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");

/* ── Palette (sans contours : le relief vient des tons) ──────────────── */

const TONE = { top: "#FFFFFF", left: "#EEF0FF", right: "#D5DAFF" };
const SOFT = "#E9ECFF";     // aplats internes (barres, blocs, cases)
const SOFTER = "#F3F4FF";
const ACCENT = "#3D4FFF";
const ACCENT_SOFT = "#C3C9FF";
const INK = "#1A1F4E";

const ROUND = { strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* ── Variante « contours » ───────────────────────────────────────────── */

const LINE = "rgba(18,22,66,0.40)";
const SIL = "rgba(18,22,66,0.70)";

/** Contours fins (silhouette + arêtes + détails) : actifs par défaut (version retenue). */
export const IsoOutlineContext = createContext(true);

/** Trait fin à appliquer à un élément quand les contours sont activés. */
function useOutline(width = 0.9, color = LINE) {
  const on = useContext(IsoOutlineContext);
  return on ? { stroke: color, strokeWidth: width, vectorEffect: "non-scaling-stroke" as const, ...ROUND } : {};
}

/** Mélange de tons selon la normale (dessus / gauche / droite). */
function shade(n: V3): string {
  const a = Math.max(n[0], 0), b = Math.max(n[1], 0), c = Math.max(n[2], 0);
  const sum = a + b + c || 1;
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, l, t] = [hex(TONE.right), hex(TONE.left), hex(TONE.top)];
  const mix = [0, 1, 2].map((i) => Math.round((a * r[i] + b * l[i] + c * t[i]) / sum));
  return `rgb(${mix.join(",")})`;
}

/** Courbe lissée (Catmull-Rom → Bézier cubiques) passant par les points. */
function smoothPath(ps: P[]): string {
  let d = `M ${ps[0][0]} ${ps[0][1]}`;
  for (let i = 0; i < ps.length - 1; i++) {
    const p0 = ps[i - 1] ?? ps[i], p1 = ps[i], p2 = ps[i + 1], p3 = ps[i + 2] ?? p2;
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* ── Phase de boucle ─────────────────────────────────────────────────── */

/** Phase `p` ∈ [0, 1) sur `duration` ms. Mouvement réduit : figée sur `still`. */
function useLoopPhase(duration: number, still: number) {
  const [p, setP] = useState(still);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now() - still * duration;
    const tick = (now: number) => {
      if (!document.hidden) setP(((now - t0) / duration) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, still]);
  return p;
}

/* ── Bloc arrondi ────────────────────────────────────────────────────── */

/** Bloc défini par sa face avant : origine `o`, axes unitaires `U` (largeur W) et
 *  `V` (hauteur H), normale sortante `N`, épaisseur `depth`, rayon `r`. */
type Slab = { o: V3; U: V3; V: V3; N: V3; W: number; H: number; depth: number; r: number };

const at = (s: Slab, u: number, v: number): V3 => [
  s.o[0] + u * s.U[0] + v * s.V[0],
  s.o[1] + u * s.U[1] + v * s.V[1],
  s.o[2] + u * s.U[2] + v * s.V[2],
];

/** Panneau debout, face avant tournée vers la gauche (+y). */
const panelLeft = (x: number, w: number, yFront: number, d: number, h: number, r: number, z0 = 0): Slab =>
  ({ o: [x, yFront, z0 + h], U: [1, 0, 0], V: [0, 0, -1], N: [0, 1, 0], W: w, H: h, depth: d, r });
/** Dalle posée, face avant = dessus. */
const slabTop = (x: number, y: number, w: number, d: number, h: number, r: number, z0 = 0): Slab =>
  ({ o: [x, y, z0 + h], U: [1, 0, 0], V: [0, 1, 0], N: [0, 0, 1], W: w, H: d, depth: h, r });

/** Profil en rectangle arrondi (coordonnées de face u, v). */
function profile(W: number, H: number, r: number): P[] {
  const rr = Math.min(r, W / 2, H / 2);
  const out: P[] = [];
  const arc = (cu: number, cv: number, a0: number) => {
    for (let i = 0; i <= 12; i++) {
      const a = a0 + (i / 12) * (Math.PI / 2);
      out.push([cu + rr * Math.cos(a), cv + rr * Math.sin(a)]);
    }
  };
  arc(rr, rr, Math.PI);
  arc(W - rr, rr, 1.5 * Math.PI);
  arc(W - rr, H - rr, 0);
  arc(rr, H - rr, 0.5 * Math.PI);
  return out;
}

/** Bloc arrondi : flancs visibles ombrés, puis face avant (+ silhouette si contours). */
function RSlab({ s }: { s: Slab }) {
  const outlined = useContext(IsoOutlineContext);
  const prof = profile(s.W, s.H, s.r);
  const n = prof.length;
  const front = prof.map(([u, v]) => at(s, u, v));
  const back = front.map((p): V3 => [p[0] - s.N[0] * s.depth, p[1] - s.N[1] * s.depth, p[2] - s.N[2] * s.depth]);
  const cu = s.W / 2, cv = s.H / 2;
  const sides: { quad: P[]; fill: string; i: number }[] = [];
  const visible: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [u1, v1] = prof[i], [u2, v2] = prof[j];
    const du = u2 - u1, dv = v2 - v1;
    if (Math.hypot(du, dv) < 1e-6) { visible.push(false); continue; }
    let nu = dv, nv = -du;
    if (nu * ((u1 + u2) / 2 - cu) + nv * ((v1 + v2) / 2 - cv) < 0) { nu = -nu; nv = -nv; }
    const len = Math.hypot(nu, nv);
    const n3: V3 = [(nu * s.U[0] + nv * s.V[0]) / len, (nu * s.U[1] + nv * s.V[1]) / len, (nu * s.U[2] + nv * s.V[2]) / len];
    const vis = n3[0] + n3[1] + n3[2] > 1e-6;
    visible.push(vis);
    if (vis) sides.push({ i, quad: [isoV(front[i]), isoV(front[j]), isoV(back[j]), isoV(back[i])], fill: shade(n3) });
  }
  const faceFill = shade(s.N);
  // Silhouette (contours) : arête arrière de la chaîne visible + deux montants.
  // Les segments dégénérés (rayon nul) sont traversés sans casser la chaîne.
  let sil: P[] = [];
  if (outlined) {
    const isVis = (i: number) => visible[((i % n) + n) % n];
    const start = visible.findIndex((v, i) => v && !isVis(i - 1));
    if (start >= 0) {
      let i = start;
      const chain: number[] = [i];
      while (isVis(i) && chain.length <= n) { i = (i + 1) % n; chain.push(i); }
      sil = [isoV(front[chain[0]]), ...chain.map((k) => isoV(back[k])), isoV(front[chain[chain.length - 1]])];
    }
  }
  return (
    <g>
      {/* Liseré de la même couleur que le flanc : bouche les micro-jours entre facettes. */}
      {sides.map((sd) => <polygon key={sd.i} points={pts(sd.quad)} fill={sd.fill} stroke={sd.fill} strokeWidth={0.6} {...ROUND} />)}
      <polygon points={pts(front.map(isoV))} fill={faceFill} stroke={outlined ? LINE : faceFill} strokeWidth={outlined ? 1 : 0.4} vectorEffect="non-scaling-stroke" {...ROUND} />
      {sil.length > 1 && <polyline points={pts(sil)} fill="none" stroke={SIL} strokeWidth={1.1} vectorEffect="non-scaling-stroke" {...ROUND} />}
    </g>
  );
}

/** Contenu plat dans le plan de la face avant, découpé au profil arrondi. */
function OnFace({ s, children }: { s: Slab; children: ReactNode }) {
  const id = useId().replace(/:/g, "");
  const [e, f] = isoV(s.o);
  const [a, b] = isoV(s.U);
  const [c, d] = isoV(s.V);
  return (
    <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}>
      <clipPath id={`face-${id}`}><rect width={s.W} height={s.H} rx={s.r} /></clipPath>
      <g clipPath={`url(#face-${id})`}>{children}</g>
    </g>
  );
}

/* ── Cadre de scène ──────────────────────────────────────────────────── */

/** SVG commun : scène cadrée et agrandie (pas d'ombre portée). */
function Scene({ label, frame, children }: { label: string; frame: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 440 380" className="h-full w-full" role="img" aria-label={label}>
      <g transform="translate(220 185) scale(1.3) translate(-220 -185)">
        <g transform={frame}>{children}</g>
      </g>
    </svg>
  );
}

/* ── Page web (contenu de face, sans contours) ───────────────────────── */

/** `url` facultatif : sans texte, la barre d'adresse reste une pastille vide. */
function WebPage({ W, H, url, dim, children }: { W: number; H: number; url?: string; dim?: boolean; children?: ReactNode }) {
  const k = Math.max(W / 200, 0.6);
  const outlined = useContext(IsoOutlineContext);
  const ol = useOutline();
  const olFine = useOutline(0.75);
  return (
    <g>
      <rect x={8 * k} y={8 * k} width={W - 16 * k} height={H - 16 * k} rx={10 * k} fill="#FFFFFF" />
      {/* Barre du navigateur : coins arrondis en haut seulement (suit l'écran). */}
      <path
        d={`M ${8 * k} ${30 * k} L ${8 * k} ${18 * k} Q ${8 * k} ${8 * k} ${18 * k} ${8 * k} L ${W - 18 * k} ${8 * k} Q ${W - 8 * k} ${8 * k} ${W - 8 * k} ${18 * k} L ${W - 8 * k} ${30 * k} Z`}
        fill={SOFTER}
      />
      {[20, 28, 36].map((u) => <circle key={u} cx={u * k} cy={19 * k} r={2.6 * k} fill={ACCENT_SOFT} />)}
      <rect x={48 * k} y={13 * k} width={W - 64 * k} height={12 * k} rx={6 * k} fill="#FFFFFF" {...olFine} />
      {url && <text x={55 * k} y={21.6 * k} fontSize={7.5 * k} fontWeight={600} fill={INK}>{url}</text>}
      {!children && W < 120 && (
        <g opacity={dim ? 0.45 : 1}>
          <rect x={20 * k} y={44 * k} width={W * 0.55} height={11 * k} rx={2.5 * k} fill={INK} opacity={0.85} />
          <rect x={20 * k} y={62 * k} width={W * 0.5} height={4 * k} rx={2 * k} fill={SOFT} />
          <rect x={20 * k} y={74 * k} width={40 * k} height={14 * k} rx={7 * k} fill={ACCENT} />
        </g>
      )}
      {!children && W >= 120 && (
        <g opacity={dim ? 0.45 : 1}>
          <rect x={22 * k} y={44 * k} width={84 * k} height={11 * k} rx={2.5 * k} fill={INK} opacity={0.85} />
          <rect x={22 * k} y={64 * k} width={90 * k} height={4.5 * k} rx={2.25 * k} fill={SOFT} />
          <rect x={22 * k} y={74 * k} width={76 * k} height={4.5 * k} rx={2.25 * k} fill={SOFT} />
          <rect x={22 * k} y={90 * k} width={44 * k} height={15 * k} rx={7.5 * k} fill={ACCENT} />
          <rect x={124 * k} y={44 * k} width={56 * k} height={(H - 70 * k) * 0.72} rx={8 * k} fill={SOFT} {...olFine} />
        </g>
      )}
      {children}
      {/* Contour de l'écran dessiné en DERNIER : la barre du navigateur ne le masque plus. */}
      {outlined && <rect x={8 * k} y={8 * k} width={W - 16 * k} height={H - 16 * k} rx={10 * k} fill="none" {...ol} />}
    </g>
  );
}

/* ── Étape 1 : la page web ───────────────────────────────────────────── */

const PAGE = panelLeft(0, 200, 10, 10, 150, 14);
const PAGE_FRAME = "translate(137.7 200)";

export function IsoDomain() {
  return (
    <Scene label="Une page web, le site à analyser" frame={PAGE_FRAME}>
      <g>
        <RSlab s={PAGE} />
        <OnFace s={PAGE}><WebPage W={PAGE.W} H={PAGE.H} /></OnFace>
      </g>
    </Scene>
  );
}

/** Étape 1, pendant la vérification : la même page, balayée par un scan.
 *  La traînée en dégradé suit la vitesse du scan : elle s'allonge quand il file,
 *  s'efface au point de retour puis renaît de l'autre côté (pas de bascule brusque). */
export function IsoChecking() {
  const p = useLoopPhase(2600, 0.3);
  const uid = useId().replace(/:/g, "");
  const y = 40 + 92 * (0.5 - 0.5 * Math.cos(TAU * p)); // aller-retour, 1 cycle
  const v = Math.sin(TAU * p);                          // vitesse : > 0 descend, < 0 remonte
  const down = Math.max(0, v), up = Math.max(0, -v);
  const len = (speed: number) => 6 + 34 * speed;
  return (
    <Scene label="GSE vérifie que le lien répond et suit ses redirections" frame={PAGE_FRAME}>
      <defs>
        <linearGradient id={`trail-above-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0.34} />
        </linearGradient>
        <linearGradient id={`trail-below-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.34} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g>
        <RSlab s={PAGE} />
        <OnFace s={PAGE}>
          <WebPage W={PAGE.W} H={PAGE.H} dim />
          <rect x={8} width={184} y={y - len(down)} height={len(down)} opacity={down} fill={`url(#trail-above-${uid})`} />
          <rect x={8} width={184} y={y} height={len(up)} opacity={up} fill={`url(#trail-below-${uid})`} />
          <rect x={8} y={y - 0.8} width={184} height={1.6} rx={0.8} fill={ACCENT} />
        </OnFace>
      </g>
    </Scene>
  );
}

/** Étape 1, redirection détectée : la page saisie renvoie vers la page finale. */
export function IsoRedirect({ from, to }: { from: string; to: string }) {
  const p = useLoopPhase(1600, 0);
  const olSil = useOutline(1, SIL);
  const uid = useId().replace(/:/g, "");
  const FROM = panelLeft(20, 70, 118, 8, 62, 8);
  const TO: Slab = { o: [118, 112, 98], U: [0, -1, 0], V: [0, 0, -1], N: [1, 0, 0], W: 92, H: 98, depth: 8, r: 10 };
  const A = iso(55, 118, 66);
  const B = iso(114, 66, 102);
  const M: P = [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 64];
  const end: P = [B[0] - 3, B[1] - 8];
  return (
    <Scene label={`Le site ${from} redirige vers ${to}`} frame="translate(220 138.7) scale(1.4)">
      <g opacity={0.8}>
        <RSlab s={FROM} />
        <OnFace s={FROM}><WebPage W={FROM.W} H={FROM.H} url={from} dim /></OnFace>
      </g>
      <RSlab s={TO} />
      <OnFace s={TO}><WebPage W={TO.W} H={TO.H} url={to} /></OnFace>
      <defs>
        <marker id={`arrow-${uid}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="#FFFFFF" strokeWidth={2} {...ROUND} />
        </marker>
      </defs>
      <path
        d={`M ${A[0]} ${A[1] - 3} Q ${M[0]} ${M[1]} ${end[0]} ${end[1]}`}
        fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeDasharray="4 5" strokeDashoffset={-18 * p}
        markerEnd={`url(#arrow-${uid})`} vectorEffect="non-scaling-stroke" {...ROUND}
      />
      <g transform={`translate(${M[0] - 16} ${M[1] + 18})`}>
        <rect width={32} height={16} rx={8} fill="#FFFFFF" {...olSil} />
        <text x={16} y={11} fontSize={7.5} fontWeight={700} fill={ACCENT} textAnchor="middle">301</text>
      </g>
    </Scene>
  );
}

/* ── Étape 2 : le calendrier et l'horloge ────────────────────────────── */

/** Anneau de reliure : demi-donut debout dans le plan x = cte, de `y0` à `y1`.
 *  Un trait épais blanc + un trait plus sombre décalé dessous pour l'épaisseur. */
function BinderRing({ x, y0, y1, z }: { x: number; y0: number; y1: number; z: number }) {
  // Demi-cercle de y0 (t = 0) à y1 (t = π), toujours au-dessus de la surface (z ≥ z0).
  const c = (y0 + y1) / 2, half = (y0 - y1) / 2;
  const arc = Array.from({ length: 25 }, (_, i) => {
    const t = (Math.PI * i) / 24;
    return iso(x, c + half * Math.cos(t), z + Math.abs(half) * Math.sin(t));
  });
  const d = arc.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const outlined = useContext(IsoOutlineContext);
  return (
    <g>
      {/* Contours : trait navy plus large sous chaque passe → liseré autour du tube. */}
      {outlined && <path d={d} fill="none" stroke={LINE} strokeWidth={5.9} transform="translate(1.4 0.8)" {...ROUND} />}
      <path d={d} fill="none" stroke={TONE.right} strokeWidth={5} transform="translate(1.4 0.8)" {...ROUND} />
      {outlined && <path d={d} fill="none" stroke={LINE} strokeWidth={4.9} {...ROUND} />}
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={4} {...ROUND} />
    </g>
  );
}

export function IsoFrequency() {
  const p = useLoopPhase(16000, 0.4); // boucle lente : 1 tour d'aiguille en 16 s
  const olFine = useOutline(0.75);
  const week = Math.floor(p * 4); // une ligne (semaine) par quart de boucle
  // Calendrier posé à plat : bandeau pleine largeur + 2 anneaux de reliure, grille 4 × 4
  // de cases plus larges que hautes qui remplit toute la largeur (sans texte).
  // Profondeur calculée pour que les jours soient de vrais carrés.
  const CAL = slabTop(0, 0, 104, 124, 10, 8);
  const RINGS = [28, 76]; // position des anneaux le long du bandeau
  // Tuile horloge : même langage que la tuile Google (cube arrondi, cadran au dessus).
  const CLOCK = slabTop(119, 62, 50, 50, 24, 15);
  const MARGIN = 6, GAP = 5, HEADER_Y = 6, HEADER_H = 14;
  const gridTop = HEADER_Y + HEADER_H + 6;
  const cellW = (CAL.W - 2 * MARGIN - 3 * GAP) / 4; // jours carrés : même côté en largeur et en hauteur
  const cellH = cellW;
  const hand = TAU * p - Math.PI / 2;
  return (
    <Scene
      label="Un calendrier et une horloge : l'analyse se relance à intervalle régulier"
      frame="translate(231 87.1) scale(1.5)"
    >
      <RSlab s={CAL} />
      <OnFace s={CAL}>
        <rect x={MARGIN} y={HEADER_Y} width={CAL.W - 2 * MARGIN} height={HEADER_H} rx={4} fill="#8C96FF" />
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((__, col) => {
            const cadence = col === 1; // même jour chaque semaine = la cadence
            const now = cadence && row === week;
            const past = cadence && row < week;
            return (
              <rect
                key={`${row}-${col}`}
                x={MARGIN + col * (cellW + GAP)} y={gridTop + row * (cellH + GAP)}
                width={cellW} height={cellH} rx={4}
                fill={now ? ACCENT : past ? ACCENT_SOFT : SOFT}
                {...(now ? {} : olFine)}
              />
            );
          }),
        )}
      </OnFace>
      {/* Départ au centre du bandeau, arrivée dans le vide au-delà du bord arrière (y < 0). */}
      {RINGS.map((x) => <BinderRing key={x} x={x} y0={HEADER_Y + HEADER_H / 2} y1={-8} z={10} />)}
      <RSlab s={CLOCK} />
      <OnFace s={CLOCK}>
        <g transform="translate(25 25)">
          <circle r={17} fill={SOFT} {...olFine} />
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * TAU;
            return <circle key={i} cx={Math.cos(a) * 13} cy={Math.sin(a) * 13} r={1.4} fill={ACCENT_SOFT} />;
          })}
          <line x1={0} y1={0} x2={Math.cos(-Math.PI * 5 / 6) * 8} y2={Math.sin(-Math.PI * 5 / 6) * 8} stroke={INK} strokeWidth={2.6} {...ROUND} />
          <line x1={0} y1={0} x2={Math.cos(hand) * 12} y2={Math.sin(hand) * 12} stroke={ACCENT} strokeWidth={2} {...ROUND} />
          <circle r={2.2} fill={INK} />
        </g>
      </OnFace>
    </Scene>
  );
}

/* ── Étape 3 : Google et la page web ─────────────────────────────────── */

function GoogleG() {
  return (
    <g>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </g>
  );
}

/* Courbe du graphique (coordonnées de face de la page Search Console).
   La face descend de 30° vers la droite : la courbe doit monter plus que cette pente
   pour se lire comme une hausse. */
const CHART: P[] = [[18, 108], [48, 96], [76, 102], [104, 80], [128, 76], [150, 44]];

export function IsoSearchConsole() {
  const p = useLoopPhase(4000, 0.5);
  const olFine = useOutline(0.75);
  const uid = useId().replace(/:/g, "");
  const TILE = slabTop(15, 70, 50, 50, 26, 14); // au pied de la page, à gauche
  const SITE = panelLeft(0, 170, 10, 10, 130, 14);
  const line = smoothPath(CHART);
  const last = CHART[CHART.length - 1];
  const area = `${line} L ${last[0]} 116 L ${CHART[0][0]} 116 Z`;
  const glow = 2.8 + 0.9 * (0.5 - 0.5 * Math.cos(TAU * p)); // dernier point qui respire
  return (
    <Scene
      label="Google et la page web du projet : la Search Console apporte les vraies données"
      frame="translate(186.4 206) scale(1.2)"
    >
      <defs>
        <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.24} />
          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g>
        <RSlab s={TILE} />
        <OnFace s={TILE}><g transform="translate(8 8) scale(0.71)"><GoogleG /></g></OnFace>
      </g>
      <RSlab s={SITE} />
      <OnFace s={SITE}>
        <WebPage W={SITE.W} H={SITE.H}>
          <rect x={16} y={34} width={50} height={20} rx={6} fill={SOFTER} {...olFine} />
          <rect x={72} y={34} width={50} height={20} rx={6} fill={SOFTER} {...olFine} />
          <rect x={22} y={40} width={18} height={3.5} rx={1.75} fill={ACCENT} />
          <rect x={78} y={40} width={18} height={3.5} rx={1.75} fill={INK} opacity={0.5} />
          <rect x={22} y={47} width={34} height={2.5} rx={1.25} fill={SOFT} />
          <rect x={78} y={47} width={34} height={2.5} rx={1.25} fill={SOFT} />
          <path d={area} fill={`url(#area-${uid})`} />
          <path d={line} fill="none" stroke={ACCENT} strokeWidth={1.6} {...ROUND} />
          <circle cx={last[0]} cy={last[1]} r={glow} fill={ACCENT} />
        </WebPage>
      </OnFace>
    </Scene>
  );
}
