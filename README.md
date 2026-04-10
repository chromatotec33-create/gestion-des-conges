# Portail Congés (HTML + Supabase + Vercel)

Application moderne en **HTML/CSS/JS** connectée à **Supabase**.

## Variables d'environnement Vercel

Configurer dans Vercel (Project → Environment Variables):

- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (stockée côté plateforme, **jamais exposée au client**)

Le build génère automatiquement `env.js` à partir des variables `APP_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Fonctionnalités

- Auth Supabase (email/mot de passe)
- Dashboard : solde restant + demandes
- Dépôt de demande avec calcul automatique des jours ouvrés
- Vérification solde insuffisant
- Vérification chevauchement de dates
- Validation multi-services : chef_service puis direction
- Historisation des validations/refus (`historiques`)

## Schéma SQL Supabase

Migration à appliquer:

- `supabase/migrations/20260410180000_full_leave_management.sql`

## Lancement local

```bash
APP_BASE_URL=http://localhost:3000 \
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
npm run dev
```

## Build + déploiement Vercel

```bash
npm run build
```

Le dossier `dist/` est publié (cf. `vercel.json`).
