# Gestion des congés — version HTML + JavaScript

Ce projet a été simplifié pour fonctionner comme un **site statique** en HTML/CSS/JavaScript, sans framework.

## Objectifs de cette version

- **Simple** : architecture minimale (3 fichiers applicatifs).
- **Cohérente** : une seule page, flux utilisateur clair.
- **Sécurisée** :
  - politique CSP stricte dans `index.html` ;
  - rendu DOM via `textContent` (pas d'injection HTML) ;
  - validations de formulaire côté client.
- **Fonctionnelle** : création/suppression de demandes de congés, persistance locale (`localStorage`).

## Fichiers principaux

- `index.html` : structure de l'interface.
- `styles.css` : styles responsives.
- `app.js` : logique métier côté client.
- `scripts/dev-server.mjs` : serveur HTTP local minimal.
- `scripts/build-static.mjs` : build statique vers `dist/`.

## Démarrage

```bash
npm run dev
```

Application locale: `http://localhost:3000`

## Build

```bash
npm run build
```

Sortie: `dist/`

## Tests / vérifications

```bash
npm run test
```

Vérifie la syntaxe JavaScript du fichier `app.js`.
