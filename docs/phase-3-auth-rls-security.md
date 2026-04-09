# PHASE 3 — Auth / RLS / sécurité

## Choix d'architecture

- Toutes les tables métier passent en **RLS active**.
- Les politiques sont basées sur un modèle `user_company_roles` + helpers SQL (`has_company_role`, `is_company_member`, `can_manage_employee`).
- Le périmètre manager est limité aux **collaborateurs directs** via `employees.manager_employee_id`.
- Les logs d'audit sont protégés en double :
  - append-only SQL trigger (phase 2)
  - politiques RLS sans update/delete.

## Couverture RBAC

- **Employee**: accès à soi-même (profil, demandes, soldes, notifications personnelles).
- **Manager**: accès lecture/validation sur équipe directe et délégations.
- **HR / Direction**: accès société complète.
- **Super Admin**: accès global multi-tenant.

## Prévention des risques

- **Horizontal privilege escalation** : filtrage systématique par `company_id` + scope utilisateur.
- **Vertical privilege escalation** : seule la Direction/Super Admin peut manipuler `user_company_roles` (avec blocage de création `super_admin` par Direction).
- **Mass assignment** : `WITH CHECK` systématique sur opérations d'écriture sensibles.
- **Secret handling** : `SUPABASE_SERVICE_ROLE_KEY` reste hors client (usage backend uniquement).

## Fichier de migration

- `supabase/migrations/20260409170000_phase3_auth_rls_security.sql`
