# PHASE 4 — Domain models / repositories / services

## Choix d'architecture

- **Domain layer pur**: entités (`Employee`, `LeaveRequest`, `LeaveBalance`, `LeaveCancellation`) et invariants métier sans dépendance Next/Supabase.
- **Repository pattern**: interfaces dans `src/repositories/interfaces` pour découpler les services des adapters d'infrastructure.
- **Service layer**: cas d'usage applicatifs (`SubmitLeaveRequestService`, `CancelLeaveRequestService`, `LeaveBalanceService`) orchestrant validations, règles métier et audit.
- **Validation boundary**: schémas Zod au niveau service input pour stopper mass assignment et payloads incomplets.

## Hypothèses

1. Les implémentations concrètes Supabase des repositories seront ajoutées en phase 5 (APIs / Server Actions).
2. Les services utilisent l'injection de dépendances (constructeurs) pour permettre tests unitaires sans DB.
3. Les règles de conformité (annulation <30 jours + justification renforcée) sont codées dans le domaine (`LeaveCancellation`).

## Fichiers clés

- `src/domain/entities/*`
- `src/repositories/interfaces/*`
- `src/services/leave-request/*`
- `src/services/leave-balance/*`
- `src/services/audit/*`
- `src/validators/leave-request.validator.ts`
