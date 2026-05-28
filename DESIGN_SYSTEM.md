# Design System — SEO Engine V2

> **Règle d'or** : avant toute nouvelle UI, vérifier ici. Si le composant manque, **créer dans `src/components/`** d'abord, puis consommer. **Jamais d'inline.**

## Tokens (`src/styles/tokens-brand.css` + `src/app/globals.css`)

### Surfaces
- `--bg-primary` — fond app (blanc light / charcoal dark)
- `--bg-card` — **transparent** (encarts en outline only)
- `--bg-card-hover` — hover subtil rgba pour cards cliquables
- `--bg-card-static` — `#F8F8F8` light / `#1d1c1a` dark — **réservé KpiCard + SearchInput + IconBadge**
- `--bg-pill-active` — pill actif (FilterTabs, ProjectSwitcher) — `#F3F3F3` / `#2c2b29`
- `--bg-subtle`, `--bg-secondary`, `--card-inner-bg`, `--modal-bg`

### Bordures
- `--border-subtle` — encarts par défaut
- `--border-medium` — hover ou emphasis
- `--border-badge`

### Couleurs sémantiques
- `--accent-primary` `#3D4FFF` (indigo, **pas violet AI**)
- `--accent-primary-soft`, `--accent-primary-mid`, `--accent-primary-hover`
- `--color-success` / `--color-success-bg`
- `--color-warning`
- `--color-danger` / `--color-danger-bg`
- `--text-primary` / `--text-secondary` / `--text-muted` / `--text-input`

### Typo
- `--font-figtree` (body), `--font-space-grotesk` (titres)
- Toujours `tabular-nums` pour les chiffres
- `--ease-expo` = `cubic-bezier(0.16, 1, 0.3, 1)` — easing standard

---

## Layout

| Composant | Usage |
|---|---|
| `AppShell` | Coque app authentifiée (sidebar + topbar + main) — `src/app/(app)/layout.tsx` |
| `Sidebar` | Navigation principale gauche, collapsable 240/64px |
| `Topbar` | Header avec rightSlot via `usePageMeta()` |
| `Drawer` | Side panel 640px from right (`useDrawer().open(title, content)`) |
| `ModalShell` | Modale centrée portal — prop `maxWidth` (défaut 480px) — `src/components/analyse/modals/shared.tsx` |

---

## Encarts

| Composant | Quand l'utiliser |
|---|---|
| **`Panel`** | **Encart générique outline avec title + subtitle + action slot. Default choice pour wrapper une section.** |
| `BlocCard` | Carte d'action stratégique sur la Vue d'ensemble — icon gradient + flèche, hoverable |
| `Callout` | Info block coloré (info / warning / error / success) avec icône |
| `SoftPanel` | Wrapper bg-subtle pour grouper visuellement (sans border) |
| `KpiCard` | Métrique clé : label + value + sub + delta optionnel. **Seul composant qui a un bg `--bg-card-static`** |
| `KpiGroup` | Grille de plusieurs `<KpiCard bare>` |

---

## Boutons & CTAs

| Composant | Usage |
|---|---|
| `Button` | Bouton primary / secondary / accent / dark / ghost / danger, sizes sm/md/lg |
| `LinkButton` | Même style que `Button` mais balise `<a>` — pour liens externes / interne href |

**Ne jamais** créer un `<a>` ou `<button>` stylé inline. Toujours utiliser `Button` ou `LinkButton`.

---

## Badges & Pills

| Composant | Usage |
|---|---|
| `Pill` | Pill rounded générique — `<Pill color bg>` |
| `IconBadge` | Square/squircle d'icône (sm/md/lg) avec bg ou outline |
| `StatusPill` / `StatusPillDropdown` | Statut ActionCard (5 valeurs : todo, in_progress, blocked_client, done, abandoned) |
| `PriorityBadge` | Niveau de priorité ActionCard (low/mid/high/critical) avec barres |
| `DeltaBadge` | Delta chiffré +X% / −X% avec arrow up/down |
| `DeltaIndicator` | Variante minimaliste pour les tableaux denses |

---

## Données métier

| Composant | Usage |
|---|---|
| `ActionCard` | **L'unité économique** : action SEO avec statut riche, owner, deadline, narratif. Pattern Linear (collapsed + expand) |
| `ScoreGauges` | 3 mini jauges verticales T/C/N — **uniquement pour listes / cards denses**, pas pour dashboard |
| **`HealthScoreBar`** | **Score 0-100 grand format pour dashboard : big number + barre horizontale + status. Empilable verticalement** |
| `ScoreRing` | Anneau de score (legacy — préférer ScoreGauges ou HealthScoreBar selon contexte) |
| `ProgressBar` | Barre de progression linéaire |
| **`MetricListRow`** | **Ligne d'une liste de stats : label + sub + value + delta. Top pages, rising keywords, top performers...** |
| **`RankingChange`** | **Pill "avant → après" pour évolution de position (mots-clés, etc.)** |
| **`MeetingTile`** | **Prochain RDV style page de calendrier (header coloré + big day + topic). Layout vertical (col étroite) ou horizontal** |

---

## Charts

| Composant | Usage |
|---|---|
| `Sparkline` | Mini line chart inline avec tooltip interactif |
| `AreaChart` | Area chart plus large pour les évolutions |
| `LineDotChart` | Line chart avec dots aux data points |
| `HorizontalBarChart` | Barres horizontales |
| `VerticalBarChart` | Barres verticales |
| `DonutChart` | Donut |
| `RadarChart` | Radar 5-7 axes (NetlinkingView) |
| `ProfileDonutChart` | Donut + profil au centre |
| `TabbedChart` | Wrapper avec tabs pour switcher entre charts |

---

## Tables & listes

| Composant | Usage |
|---|---|
| `TableWide` | Grand tableau applicatif avec sort + pagination |
| `FilterTabs` | Tabs filtres pills (Actifs / Archivés) |
| `SegmentedControl` | Segmented control multi-options |
| `ColPill` | Pill dropdown pour filtre colonne |
| `SearchInput` | Input search rounded-full avec icône loupe |

---

## Inputs & forms

| Composant | Usage |
|---|---|
| `NumberInput` | Input numérique avec +/− |
| `Kbd` | Touche clavier (⌘P, ↑↓) |
| `DropdownMenu` / `DropdownItem` / `DropdownSeparator` / `DropdownHeader` | Menu déroulant |

---

## Feedback & states

| Composant | Usage |
|---|---|
| `EmptyState` | État vide avec icon + titre + description + action |
| `Tooltip` | Tooltip portal/inline avec side + rich variant |
| `ChartTooltip` | Tooltip positionnée x/y pour les charts |
| `ValidateSwitch` | Switch on/off de validation |
| `SuccessCheck` | Animation SVG check qui se dessine |
| `Callout` | Bandeau d'info (info/warning/error/success) |

---

## Spécifiques projet

| Composant | Usage |
|---|---|
| `ProjectSwitcher` | Sélecteur de projet (sidebar / topbar) avec Cmd+P |
| `BriefsView` | Vue analyses (table URLs + SidePanel) |
| `NetlinkingView` | Vue netlinking complète |
| `CannibalView` | Vue cannibalisation |
| `UniversSemantiqueView` | Univers sémantique |
| `RankTracker` | Tracking positions |
| `AuditTechniqueTab` / `AuditEditorialTab` / `AuditNetlinkingTab` | Sous-onglets audit |
| `AuditToc` | Table of contents audit |

---

## Onboarding

Voir `src/components/onboarding/` pour les composants spécifiques 6-step onboarding.

---

## Animations

| Composant | Usage |
|---|---|
| `AnimateIn` | Wrapper fade-in / slide-up sur mount |
| `FlipCard` | Card qui flip front/back |
| `IconSwap` | Toggle d'icône avec rotation |

---

## Conventions générales

### Cards (encarts)
- **Default = outline only** : `border border-[var(--border-subtle)] rounded-2xl`
- **Hover cliquable** : ajouter `transition-colors hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-medium)]`
- **Fond explicite** : ONLY KpiCard, SearchInput, IconBadge utilisent `bg-card-static`

### Tableaux
- **Pas de bg sur le header** — convention DS (cf. page Équipe, /share, etc.)

### Titres
- Page : `h1` 28-36px font-semibold tracking-tight
- Section : `h2` 14-18px font-semibold tracking-tight
- **Pas de surtitre uppercase au-dessus du h1 de page**

### Numbers
- Toujours `tabular-nums`
- Formatage FR : `.toLocaleString("fr-FR")` → `14 720`, virgule décimale

### Couleurs
- Pas de hardcode `#xxx` dans les composants — toujours via `var(--...)`
- Light & dark mode doivent être tenus en parallèle dans `tokens-brand.css`
