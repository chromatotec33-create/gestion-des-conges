# PHASE 5 — APIs / Server Actions

## Choix d'architecture

- **API routes Next.js App Router** pour exposer les workflows congés critiques :
  - `POST /api/leave-requests`
  - `POST /api/leave-requests/[id]/cancel`
- **Server Actions** en parallèle pour intégration UI React sans passage HTTP explicite (`src/features/leave/actions.ts`).
- **Composition des dépendances** via factory (`createLeaveServices`) pour garder des handlers minces.
- **Sécurité**:
  - authentification token bearer Supabase côté serveur,
  - usage de `SUPABASE_SERVICE_ROLE_KEY` strictement backend,
  - validation Zod et erreurs métier normalisées.

## Fichiers clés

- `src/infrastructure/supabase/server-client.ts`
- `src/infrastructure/auth/authenticated-user.ts`
- `src/infrastructure/repositories/supabase-*.repository.ts`
- `src/features/leave/service-factory.ts`
- `src/features/leave/actions.ts`
- `src/app/api/leave-requests/route.ts`
- `src/app/api/leave-requests/[id]/cancel/route.ts`
