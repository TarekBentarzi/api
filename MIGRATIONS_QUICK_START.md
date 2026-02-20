# 🔄 Guide Rapide - Migrations

## 🚀 Setup Initial

### En Local (Première fois)

```powershell
cd api

# Option 1: Setup complet automatique
.\scripts\setup-db.ps1

# Option 2: Commandes manuelles
npm run migrate:dev -- --name init_quran_app
npm run db:import
npm run db:audio
```

### En Production (Première fois)

```powershell
# Configurer l'URL de production
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."

# Déployer
.\scripts\deploy-migrations.ps1

# Ou manuellement
npm run migrate:deploy
```

---

## 📝 Workflow Quotidien

### 1. Modifier le Schéma

```prisma
// prisma/schema.prisma
model Verset {
  // Ajouter un nouveau champ
  isFavorite Boolean @default(false)
}
```

### 2. Créer la Migration

```powershell
npm run migrate:dev -- --name add_favorite_field
```

### 3. Vérifier

```powershell
npm run migrate:status
```

### 4. Déployer en Production

```powershell
# Via le script
.\scripts\deploy-migrations.ps1

# Ou via CI/CD (GitHub Actions)
git push origin main
```

---

## 🛠️ Commandes Disponibles

### Migrations

```powershell
# Créer et appliquer une migration (développement)
npm run migrate:dev

# Créer sans appliquer
npm run migrate:create -- --name my_migration

# Appliquer les migrations (production)
npm run migrate:deploy

# Voir le statut
npm run migrate:status

# Réinitialiser complètement (⚠️ supprime tout)
npm run migrate:reset
```

### Base de Données

```powershell
# Setup complet (migration + données)
npm run db:setup

# Synchroniser le schéma (develop only)
npm run db:push

# Importer le Coran
npm run db:import

# Ajouter les URLs audio
npm run db:audio

# Ouvrir Prisma Studio
npm run prisma:studio
```

---

## 🐛 Dépannage

### "Migration already applied"

```powershell
npx prisma migrate resolve --applied migration_name
```

### "Schema out of sync"

```powershell
# En dev: reset
npm run migrate:reset

# En prod: créer une migration de réconciliation
npm run migrate:create -- --name reconcile_db
# Éditer le SQL manuellement
npm run migrate:deploy
```

### "Connection refused"

Vérifiez votre `.env`:
```env
DATABASE_URL="postgresql://...pooler.supabase.com:5432/..."
DIRECT_URL="postgresql://...pooler.supabase.com:6543/..."
```

---

## 📚 Documentation Complète

Voir [MIGRATIONS_GUIDE.md](./MIGRATIONS_GUIDE.md) pour:
- Différences entre `migrate` et `db push`
- Workflow production détaillé
- Rollback et récupération
- Configuration Supabase
- Exemples complets

---

## ✅ Checklist Déploiement Production

- [ ] Tests passent (`npm test`)
- [ ] E2E tests passent (`npm run test:e2e`)
- [ ] Backup DB créé
- [ ] Variables d'env configurées (`DATABASE_URL`, `DIRECT_URL`)
- [ ] Migration testée en local
- [ ] Équipe informée
- [ ] Plan de rollback prêt

---

## 🤖 CI/CD

Le workflow GitHub Actions (`.github/workflows/deploy-api.yml`) gère automatiquement:
1. ✅ Tests (unit + E2E)
2. 🔄 Migrations
3. 🚀 Déploiement Vercel
4. 💬 Notifications

**Secrets à configurer dans GitHub:**
- `DATABASE_URL` - URL production
- `DIRECT_URL` - URL directe pour migrations
- `DATABASE_URL_TEST` - URL pour les tests
- `VERCEL_TOKEN` - Token Vercel
- `VERCEL_ORG_ID` - ID organisation
- `VERCEL_PROJECT_ID` - ID projet
- `PRODUCTION_URL` - URL API production
- `SLACK_WEBHOOK` (optionnel) - Webhook Slack

---

## 🚨 En Cas de Problème

1. **Vérifier les logs**
   ```powershell
   npm run migrate:status
   ```

2. **Restaurer depuis backup** (Supabase Dashboard)

3. **Rollback migration**
   ```powershell
   npx prisma migrate resolve --rolled-back migration_name
   ```

4. **Créer un fix**
   ```powershell
   npm run migrate:dev -- --name fix_issue
   npm run migrate:deploy
   ```

---

## 📞 Support

- [Prisma Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase + Prisma](https://supabase.com/docs/guides/integrations/prisma)
- Guide complet: [MIGRATIONS_GUIDE.md](./MIGRATIONS_GUIDE.md)
