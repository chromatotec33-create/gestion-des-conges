# Passage mode démo -> mode définitif (go-live)

## Objectif

Transformer l'application en service web SaaS exploitable en production (Vercel + Supabase), avec parcours utilisateurs réellement connectés aux données.

## 1) Prérequis techniques bloquants

- Toutes les pages métier critiques doivent consommer des données réelles (plus de mocks UI en production).
- Auth web complète (session, expiration, redirection login, rôles).
- RLS validée sur les rôles Collaborateur / Manager / RH / Admin.
- Pipeline qualité bloquant avant merge sur branche de production.

## 2) Checklist go-live minimum

### Back-end / Data

- [ ] Migrations Supabase appliquées sur l'environnement production.
- [ ] Test de santé applicative disponible via `GET /api/health`.
- [ ] Variables d'environnement validées (`APP_ENV=production`, `APP_BASE_URL` public https).
- [ ] Suppression ou rotation du compte seed `admin@admin.com`.

### Front-end

- [ ] Pages `requests`, `approvals`, `employees`, `teams`, `notifications`, `audit` branchées API.
- [ ] États chargement/erreur/vide sur chaque écran métier.
- [ ] Workflow “Nouvelle demande” finalisé (validation métier + confirmation serveur).

### Qualité

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`

## 3) Plan de stabilisation recommandé (2-3 semaines)

### Semaine 1

- Finaliser les écrans critiques avec données réelles.
- Corriger écarts auth/session.
- Ajouter monitoring erreurs + logs structurés.

### Semaine 2

- Exécuter campagne E2E sur parcours complets.
- Corriger UX (filtres, actions rapides, messages erreurs).
- QA métier avec utilisateurs pilotes.

### Semaine 3 (optionnel mais conseillé)

- Test de charge sur endpoints de listing.
- Durcissement sécurité (rotation clés, revue permissions).
- Préparation support runbook exploitation.

## 4) Critères de validation client

Le projet est considéré “définitif” quand :

1. Les parcours cœur métier sont réalisables de bout en bout depuis le site web Vercel.
2. Les données affichées proviennent toutes de Supabase (aucun mock en production).
3. Les tests qualité passent et la santé `/api/health` retourne `status: ok`.
4. Le client valide les scénarios utilisateurs cibles en recette.
