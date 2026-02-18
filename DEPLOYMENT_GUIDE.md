# Deploiement en Production - Guide Complet

## Situation Actuelle

Votre base de donnees Supabase est deja configuree dans `.env`:
- DATABASE_URL: Port 6543 (Session mode - pour migrations)
- DIRECT_URL: Port 5432 (Transaction mode - pour requetes)

**ATTENTION**: Ces URLs semblent inversees! Normalement:
- DATABASE_URL = Port 5432 (Transaction mode - requetes)
- DIRECT_URL = Port 6543 (Session mode - migrations)

## Option 1: Deploiement Rapide (Supabase deja configure)

Votre `.env` pointe deja vers Supabase (production). Pour deployer les migrations:

```powershell
# Lancer le script de deploiement
.\scripts\deploy-migrations.ps1
```

Le script va:
1. Verifier les migrations
2. Demander confirmation
3. Generer le client Prisma
4. Deployer les migrations
5. Verifier le statut

## Option 2: Correction des URLs puis Deploiement

Si les URLs sont inversees (recommande), corrigez d'abord:

### Etape 1: Corriger .env

```env
# Pour les requetes (Transaction mode)
DATABASE_URL=postgresql://postgres.gdbpgdqnpxzqbhperlhx:QlearnProject2026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# Pour les migrations (Session mode)
DIRECT_URL=postgresql://postgres.gdbpgdqnpxzqbhperlhx:QlearnProject2026@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Etape 2: Deployer

```powershell
.\scripts\deploy-migrations.ps1
```

## Option 3: Deploiement Vercel + Supabase

### 1. Preparer le projet

```powershell
# S'assurer que tout compile
npm run build
```

### 2. Configurer Vercel

Installer Vercel CLI:
```powershell
npm install -g vercel
```

Login:
```powershell
vercel login
```

### 3. Deployer

```powershell
# Premier deploiement (creation du projet)
vercel

# Deploiement en production
vercel --prod
```

### 4. Configurer les variables d'environnement sur Vercel

Dashboard Vercel > Votre projet > Settings > Environment Variables:

```
DATABASE_URL=postgresql://...5432/postgres
DIRECT_URL=postgresql://...6543/postgres?pgbouncer=true
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 5. Deployer les migrations depuis votre machine

```powershell
# Avec les URLs de production
.\scripts\deploy-migrations.ps1
```

## Option 4: GitHub Actions (CI/CD Automatique)

Le workflow `.github/workflows/deploy-api.yml` est deja configure!

### 1. Configurer les secrets GitHub

GitHub > Votre repo > Settings > Secrets and variables > Actions:

```
DATABASE_URL = postgresql://...5432/postgres
DIRECT_URL = postgresql://...6543/postgres?pgbouncer=true
DATABASE_URL_TEST = postgresql://...test-db...
VERCEL_TOKEN = votre-token-vercel
VERCEL_ORG_ID = votre-org-id
VERCEL_PROJECT_ID = votre-project-id
PRODUCTION_URL = https://votre-api.vercel.app
```

### 2. Push vers main

```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

Le workflow va automatiquement:
1. Lancer les tests
2. Deployer les migrations
3. Deployer sur Vercel
4. Faire un health check

## Verification Post-Deploiement

### 1. Verifier les migrations

```powershell
npm run migrate:status
```

### 2. Tester l'API

```powershell
# En local
curl http://localhost:3000/sourates

# En production
curl https://votre-api.vercel.app/sourates
```

### 3. Verifier les donnees

```powershell
npm run prisma:studio
```

## Checklist Pre-Deploiement

- [ ] Tests passent (`npm test`)
- [ ] Build reussit (`npm run build`)
- [ ] Variables d'env configurees
- [ ] Backup DB cree (Supabase Dashboard)
- [ ] URLs correctement configurees
- [ ] Migration testee en local
- [ ] JWT_SECRET defini en production
- [ ] CORS_ORIGINS configure

## Problemes Courants

### "Migration already applied"
```powershell
npx prisma migrate resolve --applied migration_name
```

### "Connection refused"
Verifiez que DIRECT_URL utilise bien le port 6543 pour les migrations.

### "Prisma Client not found"
```powershell
npx prisma generate
```

### Vercel: "Error connecting to database"
Verifiez les variables d'environnement dans Vercel Dashboard.

## Rollback en Cas de Probleme

1. Restaurer le backup Supabase (Dashboard > Database > Backups)
2. Marquer la migration comme rolled back:
   ```powershell
   npx prisma migrate resolve --rolled-back migration_name
   ```
3. Deployer un fix

## Ressources

- [Vercel Deployment](https://vercel.com/docs)
- [Supabase + Prisma](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

En cas de probleme:
1. Verifier les logs Vercel
2. Verifier les logs Supabase
3. Consulter MIGRATIONS_GUIDE.md
4. Contacter le support si necessaire
