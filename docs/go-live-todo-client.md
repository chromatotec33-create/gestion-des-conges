# Ce qu'il reste avant publication en mode GO client

_Date : 10 avril 2026_

## Verdict rapide

Le socle est en place (Next.js + Supabase + migrations + APIs), mais la publication client ne doit pas être lancée tant que les points **P0** ci-dessous ne sont pas validés en recette.

## P0 — Bloquants absolus avant GO

## 1) Remplacer les écrans démo par des flux réels

Écrans encore majoritairement statiques/mocks à connecter à des données réelles :

- `requests`
- `approvals`
- `employees`
- `teams`
- `notifications`
- `audit`
- une partie des widgets dashboard

**Critère GO:** aucun écran métier clé ne doit dépendre de données codées en dur en production.

## 2) Finaliser l'authentification web bout-en-bout

- gestion session (connexion, expiration, déconnexion)
- contrôle des rôles à l'affichage et côté API
- messages d'erreur compréhensibles pour l'utilisateur

**Critère GO:** un utilisateur réel peut se connecter via l'URL Vercel et effectuer ses actions selon son rôle sans contournement.

## 3) Fiabiliser les workflows cœur métier

- soumission de demande de congé
- approbation / refus manager-RH
- annulation avec règles métier
- audit traçable des actions

**Critère GO:** chaque workflow est testable de bout en bout sans étape manuelle hors système.

## 4) Qualité et sécurité obligatoires

- `lint`, `typecheck`, `unit`, `e2e`, `build` doivent être verts sur la branche de release
- validation RLS multi-tenant sur plusieurs profils utilisateurs
- suppression/rotation des comptes de seed de démonstration

**Critère GO:** pipeline qualité bloquante et sécurité validée par une checklist signée.

---

## P1 — Fortement recommandé dans la même fenêtre de release

- filtres/tri/pagination sur les listes métiers
- états `loading` / `empty` / `error` homogènes
- accessibilité clavier/contrastes
- monitoring/alerting (erreurs serveur, latence API, health checks)

---

## Check-list opérationnelle de publication

- [ ] Variables Vercel de prod configurées (`APP_ENV=production`, `APP_BASE_URL` public https, clés Supabase)
- [ ] Migrations Supabase appliquées sur l'environnement cible
- [ ] `GET /api/health` retourne `status: ok`
- [ ] Jeux de tests de recette exécutés (collaborateur, manager, RH/admin)
- [ ] Validation client finale et PV de recette signé

---

## Recommandation planning

- **Semaine 1:** finalisation écrans réels + auth + workflows
- **Semaine 2:** QA complète + corrections + sécurité/observabilité
- **GO client:** uniquement après validation de tous les points P0
