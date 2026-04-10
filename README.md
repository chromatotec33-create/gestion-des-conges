# Gestion des congés — SaaS RH enterprise

Application SaaS de gestion des congés/absences orientée entreprise française (conformité, auditabilité, multi-tenant), construite avec Next.js, Supabase et une architecture DDD/Clean modulaire.

## Stack

- Frontend: Next.js App Router, TypeScript strict, TailwindCSS, TanStack Query/Table
- Backend: Supabase PostgreSQL, Supabase Auth, RLS, migrations SQL
- Infra: Vercel, GitHub Actions
- Tests: Vitest, Playwright

## Démarrage rapide

```bash
cp .env.example .env.local
npm install
npm run dev
```

Application locale: `http://localhost:3000`

## Variables d'environnement

Voir `.env.example` pour la liste complète.

> **Sécurité**: `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être exposée au client. Usage strictement backend/server actions/API routes.

## Scripts

- `npm run dev` : lancement local
- `npm run build` : build production
- `npm run start` : start production
- `npm run lint` : linting
- `npm run typecheck` : vérification TypeScript
- `npm run test` : tests unitaires Vitest
- `npm run test:e2e` : tests E2E Playwright

## Migrations base de données

Les migrations Supabase se trouvent dans `supabase/migrations/`.

Exemple via CLI:

```bash
supabase db push
```

## Seed admin interne

Pour pré-production interne, lancer:

```bash
npm run seed:admin
```

Ce seed crée le compte `admin@admin.com` (mot de passe `admin`) uniquement s'il n'existe pas, ainsi que les sociétés Chromatotec, Airmotec, JPA Technologies.

## CI/CD

Le pipeline GitHub Actions est défini dans `.github/workflows/ci.yml`:

- **Job bloquant**: build applicatif uniquement (`npm run build`) pour éviter un blocage déploiement sur tests.
- **Job optionnel non bloquant** (manuel `workflow_dispatch`): lint, typecheck, unit tests, e2e.

## Documentation de phase

- Phase 1: `docs/phase-1-architecture.md`
- Phase 2: `docs/phase-2-schema.md`
- Phase 3: `docs/phase-3-auth-rls-security.md`
- Phase 4: `docs/phase-4-domain-repositories-services.md`
- Phase 5: `docs/phase-5-apis-server-actions.md`
- Phase 6: `docs/phase-6-ui-dashboard.md`
- Phase 7: `docs/phase-7-tests.md`
- Phase 8: `docs/setup-environment.md`, `docs/deployment-vercel.md`
- Architecture interne des couches: `src/README.md`
