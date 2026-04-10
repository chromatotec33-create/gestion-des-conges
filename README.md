# Gestion des congés — Next.js + Supabase + Vercel

Application complète de gestion des congés prête pour un déploiement Vercel.

## Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind
- Backend: Supabase (PostgreSQL, Auth, RLS)
- Déploiement: Vercel

## Variables d'environnement

Créer `.env.local`:

```bash
APP_BASE_URL=https://votre-domaine.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_ENV=development
```

## Rôles utilisateurs

- `employe`
- `chef_service`
- `direction`
- `admin`

Gérés via `auth.users` + table `public.profiles`.

## Schéma Supabase

Migration principale: `supabase/migrations/20260410180000_full_leave_management.sql`

Contient:

- Tables: `profiles`, `conges`, `soldes`, `historiques`
- Types SQL pour rôles/statuts
- Calcul jours ouvrés
- Contrôle chevauchement
- Contrôle solde insuffisant
- Workflow de validation
- RLS policies (employé, chef_service, direction, admin)
- Triggers d'audit vers `historiques`

## API clés

- `GET/POST /api/conges`
- `PATCH /api/conges/:id/workflow`
- `GET /api/conges/:id/bon-acceptation`

## Pages disponibles

- `/login` : Auth
- `/dashboard` : KPI + pilotage
- `/requests/new` : nouvelle demande
- `/requests` : suivi
- `/approvals` : validation chef/direction
- `/calendar` : calendrier
- `/admin/users` : administration utilisateurs/roles

## Lancer localement

```bash
npm install
npm run dev
```

## Déploiement Vercel

1. Connecter le repo à Vercel
2. Ajouter les variables d'environnement ci-dessus
3. Déployer (framework Next.js automatiquement détecté)

## Vérifications

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
