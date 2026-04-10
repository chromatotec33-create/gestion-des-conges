# Propagation globale des paramètres inter-sociétés

## Comportement UX

Dans les pages de paramètres société et politiques:

- bouton **"Propager aux autres sociétés"**
- modal de confirmation:
  - uniquement société courante
  - toutes les sociétés
  - sélection manuelle (multi-select)
- prévisualisation des sociétés impactées
- feedback de succès/erreur après exécution

## Transaction et audit

La propagation est exécutée via la fonction SQL `propagate_group_configuration`:

- upsert transactionnel des configurations cibles
- insertion automatique dans `audit_logs` pour chaque société impactée
- historisation centralisée dans `group_configuration_propagations`
- en cas d'erreur SQL: rollback complet

## Héritage / override

Table `group_configurations`:

- `inheritance_mode = group_default` (héritée groupe)
- `inheritance_mode = local` (valeur locale)
- `inheritance_mode = local_override` (surcharge locale explicite)

L'UI affiche les badges:

- "Valeur héritée du groupe"
- "Valeur spécifique société"
