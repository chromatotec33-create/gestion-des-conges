# Portail Congés (HTML + Supabase)

Application moderne en **HTML/CSS/JS** connectée à **Supabase**.

## Fonctionnalités

- Auth Supabase (email/mot de passe)
- Dashboard : solde restant + demandes
- Dépôt de demande avec calcul automatique des jours ouvrés
- Vérification solde insuffisant
- Vérification chevauchement de dates
- Validation multi-services : chef_service puis direction
- Historisation des validations/refus (`historiques`)

## Configuration

1. Ouvrir l'onglet **Configuration Supabase** dans l'app.
2. Saisir:
   - URL Supabase
   - Anon Key
3. Se connecter avec un utilisateur existant dans `auth.users` + `profiles`.

## Schéma SQL Supabase

Utiliser la migration:

- `supabase/migrations/20260410180000_full_leave_management.sql`

## Lancement local

```bash
npm run dev
```

## Build déployable

```bash
npm run build
```

Le dossier `dist/` est prêt pour Vercel (Static).
