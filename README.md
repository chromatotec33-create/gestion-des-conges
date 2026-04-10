# Gestion des congés — version HTML multi-pages

Le projet est maintenant une application **100% HTML/CSS/JavaScript** avec les écrans clés:

- `index.html` : page d'accueil
- `connexion.html` : authentification locale (démo)
- `demande.html` : création de demande de congé
- `suivi.html` : suivi des demandes de l'utilisateur connecté

## Fonctionnement

- Authentification locale de démonstration (session stockée en `localStorage`).
- Les demandes sont persistées en `localStorage`.
- Navigation simple entre les pages.
- Sécurité côté client: CSP stricte + rendu DOM avec `textContent`.

## Commandes

```bash
npm run dev
npm run test
npm run build
```

- `dev` : serveur local sur `http://localhost:3000`
- `test` : vérification syntaxique JavaScript
- `build` : génération statique dans `dist/`
