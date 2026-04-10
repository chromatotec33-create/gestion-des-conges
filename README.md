# Portail Congés (HTML + Supabase + Vercel)

Interface moderne avec vues distinctes **Salarié**, **Chef de service**, **Direction/RH**.

## Variables Vercel

- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (non exposée au client)

Le script `scripts/generate-env.mjs` génère `env.js` à partir des variables publiques.

## Fonctionnalités principales

- Salarié: demande, brouillons, suivi avec barre de progression, demande d'annulation
- Chef de service: validation individuelle + pré-validation en lot
- Direction/RH: validation finale, message global, ajustement soldes, paramètres calendrier
- Calendrier par rôle avec jours rouges + jours fériés
- Motifs: congés payés, sans solde, autre (texte)
- Durée: journée entière / demi-journée
- Contrôles: chevauchement, solde insuffisant
- Notes privées Chef↔Direction non visibles au collaborateur

## SQL Supabase

Appliquer la migration:

- `supabase/migrations/20260410180000_full_leave_management.sql`

## Lancer

```bash
APP_BASE_URL=http://localhost:3000 \
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
npm run dev
```

## Build

```bash
npm run build
```

Sortie: `dist/` (déploiement Vercel statique).

## Seed comptes de test

Migration seed: `supabase/migrations/20260410190000_seed_fake_accounts.sql`

Comptes créés (mot de passe commun): `DemoPass123!`

- `salarie.demo@company.test`
- `chef.demo@company.test`
- `direction.demo@company.test`
- `admin.demo@company.test`
