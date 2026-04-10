# Rapport QA complet — Gestion des congés

_Date : 10 avril 2026_

## 1) Résumé exécutif

L'application présente une base solide (architecture DDD, migrations SQL, routes API critiques), mais elle n'est pas encore au niveau d'un produit prêt pour des utilisateurs finaux en entreprise. En particulier :

- plusieurs écrans dashboard restent en mode « démonstration » avec données statiques ;
- l'authentification côté interface n'est pas intégrée de bout en bout avec les appels API métiers ;
- des parcours clés (soumission, validation, modification, notifications) ne sont pas finalisés ;
- des garde-fous UX importants manquent (états vides, erreurs guidées, recherche/filtrage avancé, cohérence des statuts).

**Verdict QA actuel :** _version prototype fonctionnelle partielle_, non prête pour un déploiement production sans phase de stabilisation et d'industrialisation.

---

## 2) Périmètre audité

Audit basé sur la revue des composants/pages App Router, APIs métiers, services/répositories et migrations SQL.

### Sur la partie front

- pages dashboard : `requests`, `approvals`, `employees`, `teams`, `notifications`, `audit`, `settings`, etc.
- composants de layout (`DashboardShell`, sidebar, header) et widgets dashboard.

### Sur la partie backend

- API demandes de congés (création, listing, annulation), propagation de configuration,
- repositories Supabase, services métier et schéma SQL/RLS.

### Hypothèse d'usage retenue (clarifiée)

L'application est évaluée comme **site web SaaS** :

- accès utilisateur via URL Vercel ;
- traitement applicatif côté web (Next.js) ;
- persistance/identité via Supabase.

Ce n'est pas un progiciel local à installer sur des postes internes.

---

## 3) Fonctions déjà présentes (constat positif)

1. **Base domaine et architecture propre** (entités, services, repositories) : bonne séparation des responsabilités.
2. **Socle DB Supabase structuré** (migrations riches, sécurité/RLS, propagation groupe).
3. **APIs métiers initiales en place** pour création/annulation/listing des demandes.
4. **Skeleton UI complet** couvrant la majorité des modules attendus d'un outil RH congés.

---

## 4) Fonctionnalités manquantes / incomplètes (par criticité)

## Critique (bloquant production)

### F-01 — Écrans métier encore alimentés par données statiques

- **Impact** : les utilisateurs voient des données non réelles, risque de décisions RH erronées.
- **Exemples** : `requests`, `approvals`, `employees`, `teams`, `notifications`, `audit`.
- **Attendu** : brancher tous les écrans sur API/DB avec états chargement, vide, erreur.

### F-02 — Parcours d'authentification incomplet côté UX/API

- **Impact** : friction d'accès, incohérences de session/token, impossibilité d'exécuter tous les parcours réels.
- **Attendu** : flux login/logout robustes, gestion session expirée, redirection contrôlée, message d'erreur clair.

### F-03 — Workflow d'approbation non finalisé de bout en bout

- **Impact** : scénario cœur de produit incomplet (manager/RH).
- **Attendu** : validation/rejet avec motif, historique décisionnel, traçabilité visible en UI.

## Majeur

### F-04 — Assistant “Nouvelle demande” encore orienté prototype

- **Constat** : étapes présentes, mais règles métier/récapitulatif/confirmation serveur insuffisants.
- **Attendu** : contrôles métier en temps réel (solde, chevauchement, jours fériés, manager requis), preview impact fiable.

### F-05 — Notifications non opérationnelles

- **Impact** : manque de signalement des actions critiques (demande soumise, approuvée, annulée).
- **Attendu** : centre de notifications réel + canaux email/optionnels + statut lu/non lu.

### F-06 — Recherche / filtres / pagination insuffisants

- **Impact** : faible utilisabilité dès que le volume augmente.
- **Attendu** : filtres par période, statut, équipe, collaborateur, recherche texte, tri, pagination.

## Modéré

### F-07 — Gestion des rôles/permissions peu visible en interface

- **Attendu** : affichage explicite des droits, actions conditionnées par rôle, feedback d'autorisation.

### F-08 — Internationalisation / formats date / terminologie

- **Attendu** : cohérence langue (FR), formats locaux homogènes, libellés métiers unifiés.

### F-09 — Aide contextuelle et onboarding limités

- **Attendu** : tooltips ciblés, guide premier usage, documentation in-app par module.

---

## 5) Audit UX/UI — Mise en page à améliorer pour une application facile à utiliser

## 5.1 Navigation et architecture d'information

1. **Clarifier la sidebar par profils**
   - Collaborateur : Mes demandes, Nouveau congé, Solde, Calendrier équipe.
   - Manager : Approbations, Équipe, Calendrier, Rapports.
   - RH/Admin : Utilisateurs, Politiques, Audit, Paramètres.

2. **Réduire la charge cognitive du dashboard**
   - Afficher 3–4 KPI clés max.
   - Déporter les détails vers pages dédiées.

3. **Fil d'Ariane + titre d'action principal systématique**
   - Chaque écran doit répondre à : “Où suis-je ? Que puis-je faire ici ?”.

## 5.2 Listes et tableaux

1. **Colonnes orientées décision** (statut, période, type, action).
2. **Actions rapides contextualisées** (Annuler, Voir détail, Relancer, Export).
3. **Tri & filtres persistants** dans l'URL pour partage et retour arrière fiable.
4. **États vides utiles** (CTA direct : “Créer une demande”).

## 5.3 Formulaires

1. **Progression claire de l'assistant** (étape, erreurs en ligne, résumé sticky).
2. **Validation immédiate** champ par champ + messages actionnables.
3. **Prévisualisation d'impact solde** avant soumission.
4. **Double confirmation pour actions sensibles** (annulation après approbation).

## 5.4 Accessibilité et confort

1. **Contrastes et focus states** systématiques.
2. **Navigation clavier** complète (tab/enter/esc).
3. **Feedback visuel cohérent** (loading skeleton, toasts succès/erreur).
4. **Responsive prioritaire mobile manager** (approbation rapide).

---

## 6) Scénarios de test recommandés (campagne QA)

## Parcours collaborateur

- Créer une demande mono-jour, multi-jours, demi-journée.
- Vérifier soldes avant/après soumission.
- Annuler une demande selon statut autorisé.
- Consulter historique avec filtres période/statut.

## Parcours manager

- Voir file d'approbation priorisée.
- Approuver/refuser avec motif obligatoire.
- Contrôler collision d'absences équipe sur calendrier.

## Parcours RH/Admin

- Mettre à jour politiques, propager multi-entreprises.
- Auditer événements (création, approbation, annulation).
- Gérer utilisateurs/roles et vérifier permissions effectives.

## Non-fonctionnel

- Tests RLS (isolation strict multi-tenant).
- Tests perf API sur listings paginés.
- Tests robustesse réseau (timeouts/retry/idempotence).

---

## 7) Plan d'action priorisé (recommandé)

## Sprint 1 (stabilisation cœur métier)

- Brancher toutes les pages critiques sur données réelles.
- Finaliser auth front↔API (session, erreurs, expirations).
- Achever workflow approbation/rejet et historique.

## Sprint 2 (UX opérationnelle)

- Ajouter filtres avancés, tri, pagination, états vides.
- Refonte assistant demande + validations métier temps réel.
- Notifications applicatives minimales (in-app).

## Sprint 3 (industrialisation)

- Campagne tests E2E parcours clés.
- Durcir accessibilité et responsive.
- Observabilité (logs corrélés, métriques API, alertes).

---

## 8) Critères de “prêt production” (go/no-go)

1. 100% des pages métier critiques alimentées par DB réelle.
2. Auth et permissions validées sur 3 rôles (collab/manager/RH).
3. Workflows demande→validation→annulation entièrement testés.
4. KPI qualité :
   - 0 bug bloquant,
   - < 3 bugs majeurs ouverts,
   - taux succès E2E parcours critiques ≥ 95%.

---

## 9) Conclusion

Le produit a une **excellente base technique**, mais il faut maintenant passer d'un **prototype riche** à une **application exploitable au quotidien** : finaliser les flux réels de données, durcir les parcours métier et simplifier l'expérience utilisateur orientée action.

Ce rapport peut servir de backlog QA/UX pour les 3 prochains sprints.
