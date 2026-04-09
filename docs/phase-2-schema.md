# PHASE 2 — SQL schema + migrations Supabase

## Choix d'architecture

- Schéma relationnel normalisé, orienté multi-tenant avec `company_id` sur toutes les tables métier.
- Modèle extensible via enums PostgreSQL (`app_role`, `leave_request_status`, etc.) pour fiabilité des états.
- Journalisation juridique via `audit_logs` en design append-only (trigger bloquant UPDATE/DELETE).
- Préparation conformité et performance: contraintes d'intégrité, index composites, index partiels ciblés.

## Hypothèses explicites

1. Le mapping utilisateur s'appuie sur `auth.users(id)` Supabase et une table profil `public.users`.
2. Le rôle applicatif est géré par `user_company_roles` pour supporter multi-tenant + multi-rôles.
3. Les politiques de congés sont historisées par périodes (`effective_from` / `effective_to`).
4. Les transactions de solde sont conservées en ledger immuable (`leave_balance_transactions`).

## Fichier de migration

- `supabase/migrations/20260409152000_phase2_schema.sql`

Cette migration inclut :

- Tables core: `companies`, `users`, `employees`, `teams`, `departments`, `manager_delegations`.
- Tables congés: `leave_types`, `leave_policies`, `leave_balances`, `leave_balance_transactions`, `leave_requests`, `leave_request_days`, `leave_approvals`, `leave_cancellations`.
- Tables support: `holidays_calendar`, `blackout_periods`, `staffing_rules`, `notifications`.
- Table audit: `audit_logs`.
- Fonctions SQL et triggers techniques (`set_updated_at`, append-only audit).
