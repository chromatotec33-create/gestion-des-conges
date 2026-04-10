# Déploiement production Vercel (Phase 8)

## Modèle de fonctionnement cible

En production, l'usage attendu est :

1. l'utilisateur ouvre l'URL web Vercel de l'application ;
2. il s'authentifie via Supabase Auth (flux web) ;
3. toutes les opérations métier transitent par l'application web vers Supabase.

Il n'y a pas de déploiement client lourd/progiciel à installer sur les postes utilisateurs.

## 1) Préparer Supabase

1. Créer un projet Supabase production.
2. Appliquer les migrations (`supabase/migrations/*.sql`).
3. Vérifier les politiques RLS et comptes de service.

## 2) Configurer Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Renseigner les variables d'environnement:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server runtime uniquement)
   - variables SMTP si notifications activées
3. Définir la branche de production (généralement `main`).

## 3) CI/CD GitHub Actions

Le workflow `.github/workflows/ci.yml` est séparé en:

- **Build (blocking)**: build applicatif.
- **Quality checks (blocking)**: lint, typecheck, tests unitaires, tests e2e.

## 4) Check-list go-live

- [ ] Secrets présents dans Vercel
- [ ] Migrations appliquées en prod
- [ ] Endpoint `GET /api/health` retourne `status: ok`
- [ ] Compte de seed `admin@admin.com` supprimé/modifié avant ouverture publique
- [ ] RLS validée sur jeux de comptes Employee/Manager/HR
- [ ] Monitoring activé (logs applicatifs + erreurs)
- [ ] Backup/restauration Supabase testés
- [ ] DNS + HTTPS validés
