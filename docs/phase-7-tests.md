# PHASE 7 — Tests

## Stratégie

- **Unit tests (Vitest)**:
  - règles domaine (`LeaveCancellation`)
  - orchestration services (`SubmitLeaveRequestService`, `CancelLeaveRequestService`) avec doubles de test
- **E2E tests (Playwright)**:
  - parcours navigation landing → dashboard
  - navigation dashboard → calendrier

## Fichiers

- `vitest.config.ts`
- `playwright.config.ts`
- `tests/unit/domain/leave-cancellation.spec.ts`
- `tests/unit/services/submit-leave-request.service.spec.ts`
- `tests/unit/services/cancel-leave-request.service.spec.ts`
- `tests/e2e/dashboard.spec.ts`

## Notes d'exécution

- Unit: `npm run test`
- E2E: `npm run test:e2e`
