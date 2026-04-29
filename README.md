# AWI Foundation

Design system de départ pour les projets AWI (et clients). Next.js 16 + Tailwind 4 + tokens découplés en core/brand.

## Quick start

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) puis [/style-guide](http://localhost:3000/style-guide) pour visualiser tous les tokens.

## Comment l'utiliser pour un nouveau projet

1. Clic **"Use this template"** sur GitHub (si le repo est marqué template), ou `git clone` puis remove `.git` et réinitialise
2. `npm install`
3. **Customise [src/styles/tokens-brand.css](src/styles/tokens-brand.css)** avec la palette du nouveau projet/client (couleurs, fonts, ombres). Les tokens core (motion, typo, statuts) restent identiques.
4. Vérifie `/style-guide` : tout est mis à jour automatiquement
5. Construis ton produit dessus

## Structure

```
src/
├── app/
│   ├── globals.css          ← imports tokens + theme bridge Tailwind
│   ├── layout.tsx           ← root layout (fonts, ThemeProvider)
│   ├── page.tsx             ← landing
│   └── style-guide/
│       └── page.tsx         ← visualisation de tous les tokens
├── components/
│   ├── ThemeProvider.tsx    ← context theme (dark/light)
│   └── ThemeToggle.tsx      ← bouton de switch
└── styles/
    ├── tokens-core.css      ← échelles agnostiques (motion, typo, statuts)
    └── tokens-brand.css     ← identité brand (couleurs, fonts, ombres)
```

## Règle d'or

- **Tu modifies `tokens-core.css`** → tu changes les échelles partagées (motion, typo). À garder rare et réfléchi.
- **Tu modifies `tokens-brand.css`** → tu changes l'identité visuelle d'un projet. C'est ici que la palette client vit.
- **Tu modifies `globals.css`** → uniquement pour ajouter de nouvelles classes Tailwind exposées via `@theme inline`. Le reste doit aller dans les fichiers tokens.

## Tokens disponibles

Voir `/style-guide` une fois lancé. Catégories :

- **Couleurs** : surfaces, bordures, texte, accents, statuts (40+ tokens)
- **Typographie** : échelle de 10 tailles (`--text-xs` → `--text-display`), 4 familles
- **Espacements** : échelle Tailwind par incréments de 4px
- **Coins** : `sm`, `md`, `xl`, `2xl`, `3xl`, `full`
- **Ombres** : 3 tokens (`--shadow-card`, `--shadow-floating`, `--shadow-cta`)
- **Mouvement** : 3 easings + 5 durées normalisées

## Stack

- **Next.js 16.2** (App Router, Turbopack, React 19)
- **Tailwind CSS 4** (config CSS-first via `@theme inline`)
- **TypeScript 5** strict mode
- **ESLint 9** avec config Next

## Pourquoi ce setup

- **Tokens découplés core/brand** : tu peux livrer un même produit en 2 brands en changeant juste 1 fichier
- **Theme dark/light natif** : géré via `data-theme="dark|light"` sur `<html>`, persisté en localStorage
- **Style-guide vivant** : pas de Storybook, pas de doc à maintenir séparément. La page `/style-guide` lit directement les CSS vars donc elle reste toujours synchronisée
- **Pas de dépendance lourde** : zéro lib UI imposée. Tu construits tes composants au-dessus des tokens, ou tu poses shadcn/ui comme primitives accessibles si tu veux

## Pour ajouter une lib de primitives accessible

Ce template laisse volontairement les composants UI ouverts. Pour avoir des primitives bien faites (Dialog, Dropdown, etc.) :

```bash
npx shadcn@latest init
```

Puis configure shadcn pour utiliser tes tokens (option `cssVariables: true`). Les composants installés héritent automatiquement de ta palette.
