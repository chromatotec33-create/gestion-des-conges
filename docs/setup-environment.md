# Setup environnement (Phase 8)

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

## Vérifications qualité

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```
