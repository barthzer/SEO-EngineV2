# `_drafts/` — front rough, jetable

Dossier pour le **front provisoire** que le dev backend pose pour **débloquer ses tests**
(un état vide, un loader, une anim rapide…). Ce n'est pas du front final.

## Règles

- **UI nouvelle → un fichier ici** (ex. `EmptyStateOpportunites.draft.tsx`). Un fichier neuf
  n'entre jamais en conflit avec le front de Barth.
- **Autorité visuelle = Barth.** Il remplace ces drafts par la vraie version quand il y arrive.
  Le remplacement est **convenu** : ce n'est pas « écraser de l'existant ».
- Ouvre une issue **`polish-needed`** en même temps que tu poses un draft, pour qu'il apparaisse
  dans le backlog « à refaire propre ».
- Pour un **petit tweak dans un composant existant** (pas une UI nouvelle), pas besoin d'un fichier
  ici : isole-le dans un bloc `/* draft:polish */ … /* /draft */` + issue `polish-needed`.

Voir [`HANDOFF.md`](../../../HANDOFF.md) §3.
