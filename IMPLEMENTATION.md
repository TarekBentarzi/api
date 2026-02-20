# Modèle de Données Qlearn - Implémentation ✅

## Ce qui a été fait

### 1. ✅ Schéma Prisma créé
Le fichier `prisma/schema.prisma` contient maintenant tous les modèles:
- **User** (mis à jour avec relations)
- **Sourate** (114 sourates du Coran)
- **Verset** (indexation des versets)
- **UserSave** (sauvegarde de progression de lecture)
- **UserMemorization** (versets mémorisés avec exercices)
- **Exercice** (historique des exercices)

### 2. ✅ Base de données synchronisée
La base PostgreSQL a été mise à jour avec toutes les tables via `prisma db push`.

### 3. ✅ Seed de test créé
Le fichier `prisma/seed.ts` contient un seed avec:
- 2 utilisateurs de test
- 3 sourates (Al-Fatiha, Al-Baqara, Al-Ikhlas)
- 14 versets au total

### 4. ✅ Script d'import complet
Le fichier `prisma/import-full-quran.ts` permet d'importer les 114 sourates complètes depuis l'API Alquran Cloud.

## Comment utiliser

### Démarrer avec les données de test
```bash
cd api
npx prisma db seed
```

### Importer toutes les sourates du Coran (114 sourates, ~6,236 versets)
```bash
cd api
npx ts-node prisma/import-full-quran.ts
```

Cette commande va:
1. Télécharger toutes les sourates avec traduction française
2. Mettre à jour avec le texte arabe correct
3. Créer ~6,236 versets dans la base

**Temps estimé:** ~2-5 minutes selon la connexion

### Visualiser la base de données
```bash
npx prisma studio
```

Ouvre une interface web pour explorer les données.

## Structure des tables

```
users
├── user_saves (1:1)
└── user_memorizations (1:N)
    └── exercices (1:N)

sourates (1:N)
└── versets
    └── user_memorizations (1:N)
```

## Prochaines étapes

### 1. Créer les endpoints API (NestJS)

**À créer:**
- `src/domain/sourate/` - Entité et repository
- `src/domain/verset/` - Entité et repository
- `src/domain/user-save/` - Entité et repository
- `src/domain/user-memorization/` - Entité et repository

**Services à créer:**
- `SourateService` - Récupérer les sourates
- `VersetService` - Récupérer les versets par sourate
- `UserProgressService` - Gérer la progression (save/load)
- `MemorizationService` - Gérer la mémorisation et exercices

### 2. Exemples d'endpoints

```typescript
// GET /sourates - Liste toutes les sourates
// GET /sourates/:numero - Détails d'une sourate
// GET /sourates/:numero/versets - Tous les versets d'une sourate
// GET /versets/:id - Un verset spécifique

// GET /users/:userId/save - Position de lecture
// PUT /users/:userId/save - Sauvegarder position
// POST /users/:userId/save - Créer une sauvegarde

// GET /users/:userId/memorizations - Versets mémorisés
// POST /users/:userId/memorizations - Commencer à mémoriser un verset
// PUT /users/:userId/memorizations/:id - Mettre à jour progression
// GET /users/:userId/memorizations/revisions - Versets à réviser

// POST /exercices - Soumettre un exercice
// GET /users/:userId/exercices/stats - Statistiques d'exercices
```

### 3. Ajouter l'audio
Une fois les données en place, vous pouvez ajouter les URLs audio:

```typescript
// Script pour ajouter les URLs audio
const reciter = 'Abdul_Basit_Murattal_192kbps';
await prisma.verset.updateMany({
    where: { sourateNumero: 1 },
    data: {
        audioUrl: `https://everyayah.com/data/${reciter}/001001.mp3`
    }
});
```

### 4. Connecter avec React Native
Une fois l'API prête, créer les services dans `app-ui`:
- `UserApplicationService` pour la mémorisation
- `QuranService` pour lire les sourates/versets
- Contexts React pour gérer l'état

## Documentation

- 📄 [DATA_MODEL.md](../../DATA_MODEL.md) - Spécifications complètes du modèle
- 📄 [IMPORT_QURAN.md](./IMPORT_QURAN.md) - Guide d'import détaillé avec APIs

## Tests

Pour tester rapidement que tout fonctionne:

```typescript
// Dans Prisma Studio ou via un script
const user = await prisma.user.findFirst();
const sourate = await prisma.sourate.findUnique({ where: { numero: 1 } });
const versets = await prisma.verset.findMany({ 
    where: { sourateNumero: 1 } 
});

// Créer une sauvegarde
await prisma.userSave.create({
    data: {
        userId: user.id,
        sourateNumero: 1,
        versetNumero: 3
    }
});

// Commencer à mémoriser un verset
await prisma.userMemorization.create({
    data: {
        userId: user.id,
        versetId: versets[0].id,
        sourateNumero: 1,
        versetNumero: 1,
        statut: 'en_cours'
    }
});
```

## Commandes utiles

```bash
# Régénérer le client Prisma après modification du schema
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser complètement la base (DEV ONLY)
npx prisma migrate reset

# Ouvrir Prisma Studio
npx prisma studio
```

## Notes importantes

⚠️ **Production:** Utilisez `prisma migrate deploy` au lieu de `db push`
⚠️ **Backup:** Sauvegardez vos données avant les migrations
✅ **Performance:** Les index sont déjà configurés dans le schema
✅ **Relations:** Toutes les foreign keys avec `onDelete: Cascade` sont en place
