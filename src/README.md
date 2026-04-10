# Architecture applicative (Phase 1)

Cette base adopte une architecture modulaire orientée domaine pour supporter une roadmap RH enterprise.

## Découpage

- `app/`: composition UI (pages/layouts/server actions).
- `components/`: composants partagés sans logique métier.
- `features/`: modules fonctionnels par contexte (leave, workflow, notifications, admin).
- `domain/`: entités, value objects, règles métier pures.
- `repositories/`: interfaces d'accès aux données côté domaine.
- `services/`: orchestration de cas d'usage métier.
- `infrastructure/`: implémentations techniques (Supabase, email, file storage).
- `validators/`: schémas Zod d'entrée/sortie.
- `hooks/`: hooks React orientés présentation.
- `types/`: contrats TypeScript partagés.
- `lib/`: utilitaires transverses.

## Règles d'architecture

1. Aucune logique métier dans les composants UI.
2. Les accès aux données passent via repository + service.
3. Validation systématique via Zod en boundary API/action.
4. Couche `domain` indépendante de Next.js/Supabase.
5. Les features encapsulent leur surface fonctionnelle.
