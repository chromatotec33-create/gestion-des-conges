# Plan de mise en service — à destination du DG

_Date: 10 avril 2026_

## 1) Objectif opérationnel
Mettre en ligne l'outil de gestion des congés cet après-midi avec un accès immédiat pour les salariés.

## 2) Ce qui a été finalisé côté technique
- Flux salarié de demande de congé connecté à Supabase (`/requests/new`) avec création réelle de demandes.
- Résolution automatique de la société par défaut pour éviter les erreurs de contexte.
- Page collaborateur enrichie (`/employees/[id]`) avec compteurs, demandes, audit et filtres.
- Script de création des comptes de démarrage (admin / RH / salarié).

## 3) Actions humaines à exécuter avant envoi du lien

### A. Vérification environnement Supabase
1. Vérifier que les variables sont bien en place côté hébergement:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Appliquer les migrations Supabase sur l'environnement cible.

### B. Création des comptes de départ
Exécuter:

```bash
npm run seed:go-live-users
```

Comptes créés / mis à jour:
- `evan.sarrazin33+admin@gmail.com` (admin)
- `evan.sarrazin33+rh@gmail.com` (rh)
- `evan.sarrazin33+salarie@gmail.com` (salarie)

Mot de passe initial commun:
- `2P346c97!`

> Recommandation DG: imposer le changement de mot de passe au premier accès.

### C. Recette fonctionnelle ultra-courte (30 min)
1. Se connecter avec le compte salarié.
2. Créer une demande de congé (`/requests/new`).
3. Vérifier l'apparition de la demande dans `/requests`.
4. Se connecter avec RH/admin et vérifier la visibilité des données collaborateurs.

## 4) Message d'accompagnement à envoyer aux salariés
- URL de la plateforme
- identifiants individuels
- procédure de première connexion
- contact support interne (RH ou IT)

## 5) Gouvernance après mise en ligne
- Nommer un responsable métier RH pour valider les demandes et incidents.
- Nommer un référent IT pour suivi technique (erreurs, performances, sécurité).
- Planifier un point à J+2 pour recueillir les retours utilisateurs.
