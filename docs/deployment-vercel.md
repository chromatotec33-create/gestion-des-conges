# Déploiement production Vercel (Phase 8)

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

- **Build (blocking)**: uniquement le build applicatif (ne bloque pas le déploiement sur un test).
- **Quality checks (non-blocking)**: lint/typecheck/tests exécutables manuellement.

## 4) Check-list go-live

- [ ] Secrets présents dans Vercel
- [ ] Migrations appliquées en prod
- [ ] RLS validée sur jeux de comptes Employee/Manager/HR
- [ ] Monitoring activé (logs applicatifs + erreurs)
- [ ] Backup/restauration Supabase testés
- [ ] DNS + HTTPS validés
