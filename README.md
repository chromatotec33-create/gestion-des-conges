# Gestion des congés — transformation HTML du portail initial

Cette version reprend l'expérience de l'ancien projet (portail RH) en **HTML/CSS/JavaScript pur** au lieu de Next.js.

## Écrans disponibles

- `index.html` : accueil produit
- `connexion.html` : connexion sécurisée
- `dashboard.html` : tableau de bord RH (KPI + activités)
- `demande.html` : nouvelle demande de congé
- `suivi.html` : suivi collaborateur
- `approvals.html` : validation manager

## Données (mode démo)

- Session utilisateur en `localStorage`
- Demandes de congés en `localStorage`
- Statuts: `pending`, `approved`, `rejected`, `cancelled`

## Commandes

```bash
npm run dev
npm run test
npm run build
```
