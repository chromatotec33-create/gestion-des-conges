# Setup environnement (Phase 8)

## Clarification d'architecture

Le produit est conçu comme un **site web SaaS** :

- front web déployé sur **Vercel** ;
- API routes Next.js exécutées côté serveur (Vercel) ;
- données et auth centralisées sur **Supabase**.

Les utilisateurs métier utilisent l'application via l'URL web déployée.  
L'installation locale décrite ci-dessous est uniquement destinée aux développeurs/testeurs.

## Prérequis

- Node.js 20+
- npm 10+
- Compte Supabase + projet créé
- CLI Supabase (optionnel mais recommandé)

## Variables d'environnement

Copier `.env.example` vers `.env.local`:

```bash
cp .env.example .env.local
```

### Variables obligatoires

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (**backend only, jamais exposée côté client**)

### Variables applicatives recommandées

- `APP_BASE_URL`
- `APP_ENV`
- `LOG_LEVEL`

### Notifications email (optionnel)

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Installation et exécution locale

```bash
npm install
npm run dev
```

## Migrations Supabase

```bash
supabase db push
```

ou avec SQL direct depuis `supabase/migrations`.

## Seed Super Admin (démo / QA uniquement)

Le script `scripts/seed-admin.mjs` crée si inexistant:

- compte auth `admin@admin.com` / `admin`
- sociétés `Chromatotec`, `Airmotec`, `JPA Technologies`
- affectation `super_admin` globale via `user_company_roles`

Commande:

```bash
npm run seed:admin
```

> Avant exposition publique: changer/supprimer ce compte de seed.
> Ce script ne doit pas être considéré comme un mécanisme d'onboarding production.

## Vérifications qualité

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```
