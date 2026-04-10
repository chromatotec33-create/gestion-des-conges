# PHASE 6 — UI composants / pages / dashboard

## Choix d'architecture UI

- UI construite avec composants réutilisables (`Button`, `Card`, `Badge`) et utilitaire `cn`.
- Shell dashboard dédié (`DashboardShell`) séparant navigation/layout des vues métier.
- `TanStack Query` (provider + hooks) pour standardiser la récupération de données côté client.
- `TanStack Table` pour rendering des workflows d'approbation en attente.
- Gestion d'états UX essentiels:
  - loading (`dashboard/loading.tsx`)
  - error boundary (`dashboard/error.tsx`)
  - skeletons KPI.

## Livrables

- Dashboard RH premium: KPI + table "pending approvals".
- Page calendrier (vues Mois/Semaine/Équipe) prête pour intégration DnD/filters.
- Navigation dashboard via App Router `/(dashboard)`.
