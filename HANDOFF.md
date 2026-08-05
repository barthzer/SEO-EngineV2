# HANDOFF — Front ↔ Back (GSE / GlobalSearch)

Ce document cadre la collaboration entre **Barth (front / design, autorité visuelle)** et le **dev backend (data / connexions)**. Objectif : bosser en parallèle sur le même dépôt **sans conflits** et **sans écraser l'existant front**.

---

## 1. Comment tourne l'appli (et pourquoi tu n'as PAS besoin du back)

L'appli suit une règle simple, déjà en place dans le code :

| Couche | Où | Qui la possède |
|---|---|---|
| **Données mock** (le contrat + les fixtures) | `src/data/<domaine>.ts` | Front (Barth) |
| **Requêtes réelles** (Drizzle / Supabase) | `src/db/queries/<domaine>.ts` (`server-only`) | Back (dev) |
| **UI** (composants, styles, animations) | `src/components/`, `src/app/**/*.tsx`, `src/styles/` | Front (Barth) |

**Chaque requête réelle retombe automatiquement sur le mock s'il n'y a pas de `DATABASE_URL`.**
Exemple de référence : [`src/db/queries/projects.ts`](src/db/queries/projects.ts) →
```ts
if (!process.env.DATABASE_URL) return PROJECTS; // mock
try { /* vraie requête Drizzle */ } catch { return PROJECTS; } // mock si erreur
```

### Conséquence directe
- **Barth** lance `npm run dev` **sans `.env.local` (ou sans `DATABASE_URL`)** → toute l'appli tourne en **mode mock**, zéro connexion externe, zéro outil back requis.
- **Le dev** met ses vraies clés dans `.env.local` → l'appli tape la vraie DB / Supabase.

### Règle d'or (à ne jamais casser)
> **Le mode mock ne doit JAMAIS dépendre du backend.**
> Toute requête réelle DOIT garder le fallback mock (`if (!process.env.DATABASE_URL) return <mock>` + `try/catch`). Le client réel (Drizzle/Supabase) reste **`server-only`** et **paresseux** (ne lit ses secrets qu'à l'appel, jamais au chargement du module). Si l'appli ne démarre plus sans back, c'est un bug back, pas une fatalité front.

---

## 2. Qui possède quoi (voir `.github/CODEOWNERS`)

- **Front (Barth)** : `src/components/**`, `src/styles/**`, `src/app/**` (pages/UI), `src/data/**` (mocks & shapes), `src/context/**`, `src/hooks/**` (hooks UI).
- **Back (dev)** : `src/db/**`, `src/lib/supabase/**`, `src/app/api/**` (route handlers), server actions, `drizzle.config.*`, migrations, `src/db/seed.ts`.

`CODEOWNERS` sert de **notification de review**, pas de verrou. On **n'active PAS** « Require review from Code Owners » en branch protection → personne n'est bloqué.

---

## 3. « Vibe-design » rapide côté dev = autorisé et jetable

Le dev a le droit d'ajouter du front rough (un état, une anim, un effet) pour **se débloquer sur ses tests**. Ce ne sera pas au niveau du front final de Barth — et c'est OK, parce que c'est **jetable par convention** :

1. **UI nouvelle → nouveau fichier** dans `src/components/_drafts/` (ou suffixe `.draft.tsx`). Un fichier neuf **n'entre jamais en conflit**. Barth le remplace quand il fait la vraie version.
2. **Petit tweak dans un composant existant** → l'isoler dans un bloc marqué `/* draft:polish */ … /* /draft */` **et** ouvrir une issue `polish-needed`.
3. **Autorité visuelle = Barth.** Sur tout ce qui est visuel, **sa version fait autorité et remplace** celle du dev. Ce n'est pas « écraser de l'existant » subi : c'est un remplacement **convenu à l'avance**.

Quand Barth `git pull`, il voit tous les drafts mergés dans `main`. Pour les retrouver en un coup d'œil :
- le dossier **`src/components/_drafts/`** (tout au même endroit),
- `grep -rn "draft:polish" src` (les blocs inline),
- les issues **`polish-needed`** (le backlog « à refaire propre »),
- `git log <dernier_sync>..main --name-only` (diff exact depuis la dernière synchro).

---

## 4. Git — modèle de branches

- `main` = source de vérité déployable (tourne en mock **et** en réel selon `DATABASE_URL`).
- Barth : branches `front/*` (UI/design).
- Dev : branches `back/*` (data/API).
- **PR petites et fréquentes, mergées ~tous les jours.** La divergence longue = les gros conflits : c'est l'ennemi n°1.
- **Jamais de `git push --force` sur `main`** (c'est ça qui écrase l'existant).
- `git pull --rebase` avant de commencer ; PR reviewée avant merge.
- **Pas de reformatage massif** (pas de `prettier --write .` global) : ça pollue les diffs et crée des faux conflits. On respecte l'`.editorconfig` et la config ESLint commitée.

---

## 5. Boucle de feedback (issues labellisées)

Les retours du dev passent par des **issues**, pas par des edits sauvages dans le front :

- `needs-data` — « ce composant a besoin d'une source de données / d'un endpoint ».
- `missing-state` — « il manque un état (loading / vide / erreur) sur X ».
- `polish-needed` — « j'ai mis un front rough à refaire propre » (le backlog de Barth).
- `design-question` — « question de comportement / UX avant de câbler ».

Templates dans `.github/ISSUE_TEMPLATE/`.

---

## 6. Ajouter un domaine côté back (recette)

Pour câbler un écran qui tourne encore en mock inline :

1. **Extraire le mock** du composant vers `src/data/<domaine>.ts` (type/DTO exporté + fixtures), sur le modèle de [`src/data/projects.ts`](src/data/projects.ts). Le composant importe le type + le mock.
2. **Écrire la requête réelle** dans `src/db/queries/<domaine>.ts` avec le **fallback mock** (voir §1), sur le modèle de [`src/db/queries/projects.ts`](src/db/queries/projects.ts).
3. **Brancher** via server component / server action ; les Client Components reçoivent la donnée en props ou via un endpoint.
4. Le **type exporté est le contrat** : tant qu'il ne change pas, front et back avancent en parallèle.

Domaine de référence déjà extrait : **Opportunités** → `src/data/opportunities.ts` + `src/db/queries/opportunities.ts` (stub à remplir).

---

## TL;DR
- Barth tourne **sans back** (pas de `DATABASE_URL` = mock partout).
- Mock dans `src/data`, réel dans `src/db/queries` **avec fallback mock obligatoire**.
- Le dev bricole du front rough **dans `_drafts/` ou blocs `draft:polish`** → Barth remplace, autorité visuelle à Barth.
- PR petites & fréquentes, jamais de `--force` sur `main`, pas de reformat global.
- Feedback = issues `needs-data` / `missing-state` / `polish-needed` / `design-question`.
