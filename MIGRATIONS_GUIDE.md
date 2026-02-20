# Guide des Migrations Prisma - Qlearn

## 🔄 Différence : `prisma db push` vs `prisma migrate`

### `prisma db push` (Développement rapide)
- ✅ Ce qu'on a utilisé jusqu'à présent
- Synchronise directement le schéma avec la DB
- **SANS créer de fichiers de migration**
- Parfait pour le prototypage
- ⚠️ Peut perdre des données en production

### `prisma migrate` (Production)
- ✅ Ce qu'il faut utiliser maintenant
- Crée des fichiers de migration versionnés
- Historique complet des changements
- Rollback possible
- Sécurisé pour la production

## 📦 État Actuel du Projet

Actuellement dans `/api/prisma/migrations/` :
- `migration_lock.toml`
- `0001_init/migration.sql`
- `20260204142218_init_user/migration.sql`

Ces migrations ont été générées automatiquement mais **ne sont pas synchronisées** avec la DB actuelle.

## 🚀 Procédure Complète

### 1️⃣ **Réinitialiser et Créer une Migration Propre** (Recommandé)

**A. Sauvegarder les données importantes** (si nécessaire)
```bash
cd api

# Exporter les données actuelles
npx prisma db pull
# Ou backup manuel si données importantes
```

**B. Réinitialiser les migrations**
```bash
# Supprimer le dossier migrations (pour repartir de zéro)
Remove-Item -Recurse -Force prisma\migrations

# Réinitialiser la base de données
npx prisma migrate reset --force
# ⚠️ Ceci supprime TOUTES les données !
```

**C. Créer la migration initiale**
```bash
# Créer la première migration avec toutes les tables
npx prisma migrate dev --name init_quran_app

# Ceci va :
# 1. Créer un nouveau dossier migrations/xxx_init_quran_app/
# 2. Générer le fichier migration.sql
# 3. Appliquer la migration à la DB
# 4. Générer le Prisma Client
```

**D. Réimporter les données**
```bash
# Importer le Coran complet
npx ts-node prisma/import-full-quran.ts

# Ajouter les URLs audio
npx ts-node prisma/add-audio-urls.ts

# Ou utiliser le seed
npx prisma db seed
```

---

### 2️⃣ **OU : Marquer l'État Actuel comme Baseline** (Alternative)

Si tu veux **garder les données actuelles** :

```bash
cd api

# 1. Créer une migration sans l'appliquer (car DB déjà à jour)
npx prisma migrate dev --create-only --name baseline_existing_db

# 2. Marquer cette migration comme appliquée (sans la réexécuter)
npx prisma migrate resolve --applied baseline_existing_db

# 3. Vérifier le statut
npx prisma migrate status
```

---

## 🏠 Migrations en Local (Développement)

### Workflow Standard

**1. Modifier le schéma Prisma**
```prisma
// prisma/schema.prisma
model Verset {
  // ... existing fields
  isFavorite Boolean @default(false)  // Nouveau champ
}
```

**2. Créer et appliquer la migration**
```bash
npx prisma migrate dev --name add_favorite_field

# Ceci va :
# - Créer migrations/xxx_add_favorite_field/migration.sql
# - Appliquer la migration à la DB locale
# - Regénérer le Prisma Client
```

**3. Vérifier la migration**
```bash
# Voir le statut
npx prisma migrate status

# Voir l'historique
ls prisma/migrations
```

### Commandes Utiles en Local

```bash
# Créer une migration sans l'appliquer
npx prisma migrate dev --create-only --name my_migration

# Appliquer toutes les migrations en attente
npx prisma migrate deploy

# Réinitialiser complètement la DB (⚠️ supprime tout)
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status

# Générer le client après modifications
npx prisma generate
```

---

## 🌍 Migrations en Production

### ⚠️ IMPORTANT : NE JAMAIS utiliser `prisma migrate dev` en production !

### Workflow Production (Supabase)

**1. En Development/Staging**
```bash
# Créer et tester la migration localement
npx prisma migrate dev --name add_new_feature

# Vérifier que tout fonctionne
npm run test:e2e
```

**2. Commit dans Git**
```bash
git add prisma/migrations
git commit -m "feat: add new migration for feature X"
git push
```

**3. Déployer en Production**

**Option A : Via CI/CD (Recommandé)**
```yaml
# .github/workflows/deploy.yml
- name: Run Prisma Migrations
  run: |
    cd api
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Option B : Manuellement**
```bash
# Depuis votre machine, avec la DB_URL de production

# 1. Configurer l'URL de production
$env:DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"

# 2. Appliquer UNIQUEMENT les migrations en attente
npx prisma migrate deploy

# ⚠️ migrate deploy :
# - N'applique QUE les nouvelles migrations
# - Ne génère PAS de nouvelles migrations
# - Ne modifie PAS le schéma arbitrairement
# - Sécurisé pour la production
```

**3. Vérifier en Production**
```bash
# Voir le statut
npx prisma migrate status

# Se connecter à la DB
npx prisma studio --browser none
```

### Rollback en Production

Si une migration cause des problèmes :

```bash
# 1. Marquer la migration problématique comme "reverted"
npx prisma migrate resolve --rolled-back migration_name

# 2. Restaurer un backup de la DB (Supabase Dashboard)

# 3. Déployer un fix
npx prisma migrate dev --name fix_migration_issue
npx prisma migrate deploy
```

---

## 📋 Checklist : Avant de Déployer une Migration en Production

- [ ] Migration testée en local
- [ ] Tests E2E passent
- [ ] Backup de la DB de production créé
- [ ] Migration ne supprime pas de données critiques
- [ ] Migration est réversible (ou backup dispo)
- [ ] Variables d'environnement configurées
- [ ] Plan de rollback préparé
- [ ] Équipe informée du déploiement

---

## 🔧 Configuration pour Supabase

### Variables d'Environnement

**Fichier `.env` (Local)**
```env
# Connection pooler pour les requêtes (Transaction mode)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Connection directe pour les migrations (Session mode)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Fichier `.env.production`**
```env
DATABASE_URL="postgresql://postgres.xxx:prod-password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxx:prod-password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Schema Prisma Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Pour les migrations
}
```

---

## 🐳 Migrations avec Docker

Si vous utilisez Docker Compose :

```yaml
# docker-compose.yml
services:
  api:
    build: ./api
    command: >
      sh -c "npx prisma migrate deploy &&
             npm run start:prod"
    environment:
      DATABASE_URL: ${DATABASE_URL}
```

---

## 📊 Exemple Complet : Ajouter un Champ

### 1. Modifier le schéma
```prisma
model Verset {
  id               String   @id @default(cuid())
  // ... existing fields
  difficulty       Int?     @default(1)  // Nouveau : niveau de difficulté
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### 2. Créer la migration
```bash
cd api
npx prisma migrate dev --name add_difficulty_to_verset
```

### 3. Vérifier le SQL généré
```sql
-- prisma/migrations/xxx_add_difficulty_to_verset/migration.sql
ALTER TABLE "Verset" ADD COLUMN "difficulty" INTEGER DEFAULT 1;
```

### 4. Mettre à jour le code
```typescript
// src/infra/secondary/verset/verset.service.ts
async updateDifficulty(id: string, difficulty: number) {
  return this.prisma.verset.update({
    where: { id },
    data: { difficulty },
  });
}
```

### 5. Commit et déployer
```bash
git add prisma/migrations
git commit -m "feat: add difficulty field to Verset"
git push

# En production
npx prisma migrate deploy
```

---

## 🚨 Problèmes Courants

### "Migration already applied"
```bash
# Solution : Marquer comme appliquée
npx prisma migrate resolve --applied migration_name
```

### "Migration failed to apply"
```bash
# Solution : Marquer comme échouée et corriger
npx prisma migrate resolve --rolled-back migration_name

# Puis créer un fix
npx prisma migrate dev --name fix_previous_migration
```

### "Schema and database out of sync"
```bash
# En dev : réinitialiser
npx prisma migrate reset

# En prod : créer une migration de réconciliation
npx prisma migrate dev --create-only --name reconcile_db
# (Éditer le SQL manuellement si nécessaire)
npx prisma migrate deploy
```

---

## 📚 Ressources

- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Production Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Supabase + Prisma](https://supabase.com/docs/guides/integrations/prisma)

---

## 🎯 Résumé : Que Faire Maintenant ?

**Pour ton projet actuel, je recommande :**

### Choix 1 : Réinitialiser (recommandé si pas de données importantes)
```bash
cd api
Remove-Item -Recurse -Force prisma\migrations
npx prisma migrate reset --force
npx prisma migrate dev --name init_quran_full
npx ts-node prisma/import-full-quran.ts
npx ts-node prisma/add-audio-urls.ts
```

### Choix 2 : Baseline (garder les données actuelles)
```bash
cd api
npx prisma migrate dev --create-only --name baseline_current_state
npx prisma migrate resolve --applied baseline_current_state
npx prisma migrate status
```

**Ensuite, pour tous les changements futurs :**
```bash
# Modifier schema.prisma
npx prisma migrate dev --name description_du_changement
```

**En production :**
```bash
npx prisma migrate deploy
```
