# PHASE 1 — Architecture dossier projet complète

## Choix d'architecture

- **Modular Monolith** en première étape pour accélérer la livraison sans compromettre l'évolutivité.
- **DDD léger + Clean Architecture**: dépendances orientées vers le domaine.
- **Bounded Contexts RH** prévus dès la structure (`features/leave`, `features/workflow`, etc. à créer aux phases suivantes).
- **Ports/Adapters**: repositories (ports) + infrastructure Supabase (adapters).

## Arborescence cible

```txt
.
├── docs/
├── supabase/
│   └── migrations/
├── src/
│   ├── app/
│   ├── components/
│   ├── domain/
│   ├── features/
│   ├── hooks/
│   ├── infrastructure/
│   ├── lib/
│   ├── repositories/
│   ├── services/
│   ├── types/
│   └── validators/
├── tests/
│   ├── e2e/
│   └── unit/
└── .github/workflows/
```

## Standards techniques posés en phase 1

- Next.js 14 App Router + TypeScript strict.
- TailwindCSS prêt pour design system shadcn/ui.
- Linting/formatting avec ESLint + Prettier.
- Scripts de test unitaires/e2e préparés (Vitest/Playwright).

## Prochaine étape (Phase 2)

Concevoir le schéma SQL Supabase complet avec migrations versionnées, contraintes, index et déclencheurs métier.
