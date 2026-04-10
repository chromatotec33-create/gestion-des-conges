# Prompt complet (MD) — Passer le site en mode production réel

Copie/colle ce prompt dans ton agent IA de dev pour corriger le projet de bout en bout.

---

## CONTEXTE

Tu es un **Lead Full-Stack + QA + UX**. 
Le projet est une application SaaS de gestion des congés:

- Frontend: Next.js (App Router)
- Backend/API: Next.js API routes
- DB/Auth: Supabase
- Hébergement: Vercel
- Objectif: passer d'une base partiellement démonstrative à un produit réellement exploitable en production.

Le client veut une application **fonctionnelle, simple, belle et fiable**.

---

## OBJECTIF GLOBAL

Transformer le projet en version **go-live** en traitant:

1. la suppression des écrans simulés/mock,
2. la finalisation des parcours métier,
3. la cohérence UX/UI,
4. la sécurité multi-tenant,
5. la qualité technique (CI/tests),
6. la préparation déploiement Vercel/Supabase.

---

## RÈGLES DE TRAVAIL

1. Ne fais pas de refonte massive non maîtrisée: avance par lots livrables.
2. Chaque lot doit inclure:
   - code,
   - tests,
   - mise à jour docs,
   - checklist de validation.
3. Aucune donnée mock en production sur les écrans métier critiques.
4. Respect strict des rôles et du modèle multi-tenant.
5. Produis un changelog clair et actionnable.

---

## PLAN D'EXÉCUTION OBLIGATOIRE

### LOT 1 — Data réelle sur écrans critiques (P0)

Cibler en priorité:

- `/requests`
- `/approvals`
- `/employees`
- `/teams`
- `/notifications`
- `/audit`
- widgets dashboard clés

À faire:

- remplacer les datasets codés en dur par des requêtes réelles Supabase,
- ajouter états UX homogènes (`loading`, `empty`, `error`),
- sécuriser les accès par entreprise et rôle.

Livrables:

- pages connectées DB,
- tests d'intégration/API,
- mini doc des endpoints et contrats de données.

---

### LOT 2 — Parcours métier de bout en bout

Implémenter complètement:

1. **Collaborateur**
   - création demande,
   - suivi statut,
   - annulation selon règles.

2. **Manager / RH**
   - file d'approbation,
   - approbation/refus avec motif,
   - audit des décisions.

À faire:

- validations métier (soldes, conflits dates, règles statut),
- messages d'erreur métier lisibles,
- confirmations pour actions sensibles.

Livrables:

- flows E2E complets,
- tests unitaires services,
- tests API sur cas limites.

---

### LOT 3 — UX/UI polish (simplicité + beauté)

Appliquer:

- CTA principal explicite par écran,
- badges statuts cohérents,
- hiérarchie visuelle plus claire,
- micro-interactions (hover/focus/transitions),
- tableaux lisibles (tri, filtres, pagination, actions rapides),
- responsive mobile sur scénarios critiques,
- accessibilité WCAG AA (focus/contraste/navigation clavier).

Livrables:

- captures avant/après,
- checklist UX/UI validée,
- corrections accessibilité tracées.

---

### LOT 4 — Sécurité, qualité et observabilité

À traiter:

- RLS validée multi-tenant (isolation stricte),
- suppression/rotation comptes de seed,
- durcissement env prod,
- logs structurés + monitoring erreurs,
- endpoint health exploitable (`/api/health`).

Qualité:

- CI blocking verte: lint + typecheck + unit + e2e + build,
- aucun merge si pipeline rouge.

---

### LOT 5 — Préparation GO LIVE

Produire:

- runbook de déploiement Vercel/Supabase,
- checklist recette métier signée,
- plan rollback,
- document “Known limitations” vide ou justifié.

Critères GO obligatoires:

1. aucun écran critique en mock,
2. parcours métier complets validés,
3. sécurité/RLS validée,
4. CI entièrement verte,
5. validation client finale.

---

## FORMAT DE SORTIE ATTENDU DE L'AGENT

À chaque itération, renvoyer:

1. **Résumé des changements** (fichiers + pourquoi)
2. **Tests exécutés** (commandes + résultats)
3. **Risques restants**
4. **Prochain lot recommandé**
5. **Diff de documentation**

---

## CONTRAINTES IMPORTANTES

- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client.
- Ne jamais contourner RLS avec des patterns dangereux en production.
- Ne jamais laisser de faux comptes/mots de passe en environnement public.
- Prioriser lisibilité utilisateur finale plutôt que complexité technique interne.

---

## DÉMARRAGE IMMÉDIAT

Commence maintenant par **LOT 1**, puis enchaîne automatiquement jusqu'à compléter LOT 2.
Ensuite propose un PR intermédiaire avec preuves de fonctionnement (tests + captures + checklist).
