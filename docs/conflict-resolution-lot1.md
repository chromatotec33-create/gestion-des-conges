# Résolution de conflit Git — LOT 1 (guide rapide)

Si GitHub refuse le merge du LOT 1 à cause d’un conflit, utilise l’une des stratégies ci-dessous.

## Option A (recommandée) — garder ta version LOT 1

```bash
git fetch origin
git checkout <ta-branche>
git rebase origin/main

# En cas de conflit sur les pages LOT 1, garder la version de ta branche
git checkout --ours src/app/(dashboard)/requests/page.tsx
git checkout --ours src/app/(dashboard)/approvals/page.tsx
git checkout --ours src/app/(dashboard)/employees/page.tsx
git checkout --ours src/app/(dashboard)/teams/page.tsx
git checkout --ours src/app/(dashboard)/notifications/page.tsx
git checkout --ours src/app/(dashboard)/audit/page.tsx
git checkout --ours src/features/dashboard/hooks/use-dashboard-data.ts
git checkout --ours src/features/dashboard/components/absence-chart.tsx
git checkout --ours src/features/dashboard/components/team-availability-widget.tsx
git checkout --ours src/features/dashboard/components/upcoming-absences-timeline.tsx
git checkout --ours src/app/api/dashboard/overview/route.ts

# marquer résolu et continuer
git add .
git rebase --continue
```

Puis pousser:

```bash
git push --force-with-lease
```

---

## Option B — garder la version main (abandon du lot 1 sur ces fichiers)

```bash
git fetch origin
git checkout <ta-branche>
git rebase origin/main

# prendre la version main sur les fichiers en conflit
git checkout --theirs <fichier-en-conflit>
git add <fichier-en-conflit>
git rebase --continue
```

---

## Option C — merge classique (sans rebase)

```bash
git fetch origin
git checkout <ta-branche>
git merge origin/main
# résoudre conflit fichier par fichier
git add .
git commit
```

---

## En dernier recours (forcer)

Si ton historique local est correct et validé, tu peux forcer la branche distante:

```bash
git push --force-with-lease
```

⚠️ Évite `--force` simple; préfère `--force-with-lease` pour limiter les risques d’écraser le travail d’un collègue.
