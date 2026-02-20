# API Endpoints - Qlearn

## Base URL
```
http://localhost:3000
```

## Authentication
Les endpoints marqués 🔒 nécessitent un JWT token dans le header:
```
Authorization: Bearer <token>
```

---

## 📖 Sourates

### GET /sourates
Récupère toutes les sourates du Coran.

**Réponse:**
```json
[
  {
    "id": "uuid",
    "numero": 1,
    "nomArabe": "الفاتحة",
    "nomTranslitteration": "Al-Fatiha",
    "nomTraduction": "L'Ouverture",
    "nombreVersets": 7,
    "revelation": "Mecquoise",
    "createdAt": "2026-02-17T...",
    "updatedAt": "2026-02-17T..."
  }
]
```

### GET /sourates/:numero
Récupère une sourate spécifique par son numéro.

**Paramètres:**
- `numero` (integer 1-114) - Numéro de la sourate

**Réponse:** Objet sourate (voir format ci-dessus)

---

## 📝 Versets

### GET /versets/sourate/:sourateNumero
Récupère tous les versets d'une sourate.

**Paramètres:**
- `sourateNumero` (integer 1-114) - Numéro de la sourate

**Réponse:**
```json
[
  {
    "id": "uuid",
    "sourateNumero": 1,
    "versetNumero": 1,
    "texteArabe": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "translitteration": "Bismi Allāhi Ar-Raḥmāni Ar-Raḥīmi",
    "traduction": "Au nom d'Allah, le Tout Miséricordieux...",
    "audioUrl": null,
    "createdAt": "2026-02-17T...",
    "updatedAt": "2026-02-17T..."
  }
]
```

### GET /versets/sourate/:sourateNumero/verset/:versetNumero
Récupère un verset spécifique.

**Paramètres:**
- `sourateNumero` (integer) - Numéro de la sourate
- `versetNumero` (integer) - Numéro du verset

**Réponse:** Objet verset (voir format ci-dessus)

---

## 💾 Progression de lecture (UserSave)

### GET /users/:userId/save 🔒
Récupère la dernière position de lecture d'un utilisateur.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur

**Réponse:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "sourateNumero": 2,
  "versetNumero": 45,
  "lastReadAt": "2026-02-17T...",
  "createdAt": "2026-02-17T...",
  "updatedAt": "2026-02-17T..."
}
```

**Réponse si aucune sauvegarde:** `null`

### PUT /users/:userId/save 🔒
Sauvegarde ou met à jour la position de lecture.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur

**Body:**
```json
{
  "sourateNumero": 2,
  "versetNumero": 45
}
```

**Validation:**
- `sourateNumero`: integer, min=1, max=114
- `versetNumero`: integer, min=1

**Réponse:** Objet UserSave (voir format ci-dessus)

---

## 🧠 Mémorisation (UserMemorization)

### GET /users/:userId/memorizations 🔒
Récupère tous les versets en cours de mémorisation.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur

**Réponse:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "versetId": "uuid",
    "sourateNumero": 1,
    "versetNumero": 1,
    "statut": "en_cours",
    "niveauMaitrise": 65,
    "exercicesTotal": 5,
    "exercicesReussis": 3,
    "derniereRevision": "2026-02-15T...",
    "prochaineRevision": "2026-02-18T...",
    "createdAt": "2026-02-17T...",
    "updatedAt": "2026-02-17T..."
  }
]
```

**Statuts possibles:**
- `en_cours` - En cours d'apprentissage
- `memorise` - Mémorisé
- `a_reviser` - À réviser

### GET /users/:userId/memorizations/revisions 🔒
Récupère les versets à réviser (date de révision <= maintenant).

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur

**Réponse:** Array d'objets UserMemorization

### GET /users/:userId/memorizations/:id 🔒
Récupère les détails d'une mémorisation.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur
- `id` (uuid) - ID de la mémorisation

**Réponse:** Objet UserMemorization

### POST /users/:userId/memorizations 🔒
Commence la mémorisation d'un nouveau verset.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur

**Body:**
```json
{
  "versetId": "uuid",
  "sourateNumero": 1,
  "versetNumero": 1
}
```

**Validation:**
- `versetId`: uuid
- `sourateNumero`: integer, min=1, max=114
- `versetNumero`: integer, min=1

**Réponse:** Objet UserMemorization créé

**Erreur 409:** Si l'utilisateur mémorise déjà ce verset

### PUT /users/:userId/memorizations/:id 🔒
Met à jour la progression d'une mémorisation.

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur
- `id` (uuid) - ID de la mémorisation

**Body (tous optionnels):**
```json
{
  "statut": "memorise",
  "niveauMaitrise": 85,
  "exercicesTotal": 10,
  "exercicesReussis": 8,
  "prochaineRevision": "2026-02-20T14:00:00Z"
}
```

**Validation:**
- `statut`: enum ["en_cours", "memorise", "a_reviser"]
- `niveauMaitrise`: integer, min=0, max=100
- `exercicesTotal`: integer, min=0
- `exercicesReussis`: integer, min=0
- `prochaineRevision`: ISO 8601 date string

**Réponse:** Objet UserMemorization mis à jour

### DELETE /users/:userId/memorizations/:id 🔒
Supprime une mémorisation (abandon).

**Paramètres:**
- `userId` (uuid) - ID de l'utilisateur
- `id` (uuid) - ID de la mémorisation

**Réponse:** `204 No Content`

---

## Codes d'erreur

- `200` - Succès
- `201` - Créé
- `204` - Pas de contenu (succès sans réponse)
- `400` - Mauvaise requête (validation échouée)
- `401` - Non authentifié
- `404` - Ressource non trouvée
- `409` - Conflit (ex: mémorisation déjà existante)
- `500` - Erreur serveur

---

## Exemples d'utilisation

### Flux typique de mémorisation

1️⃣ **Récupérer une sourate**
```bash
GET /sourates/1
```

2️⃣ **Récupérer ses versets**
```bash
GET /versets/sourate/1
```

3️⃣ **Commencer à mémoriser le premier verset**
```bash
POST /users/{userId}/memorizations
Body: { "versetId": "...", "sourateNumero": 1, "versetNumero": 1 }
```

4️⃣ **Faire des exercices et mettre à jour la progression**
```bash
PUT /users/{userId}/memorizations/{id}
Body: { "exercicesTotal": 3, "exercicesReussis": 2, "niveauMaitrise": 70 }
```

5️⃣ **Vérifier les versets à réviser**
```bash
GET /users/{userId}/memorizations/revisions
```

### Flux de lecture

1️⃣ **Lire un verset**
```bash
GET /versets/sourate/2/verset/45
```

2️⃣ **Sauvegarder la position**
```bash
PUT /users/{userId}/save
Body: { "sourateNumero": 2, "versetNumero": 45 }
```

3️⃣ **Reprendre où on s'était arrêté**
```bash
GET /users/{userId}/save
```

---

## Notes d'implémentation

- Tous les UUIDs sont au format standard (v4)
- Les dates sont au format ISO 8601
- Les requêtes JSON utilisent `Content-Type: application/json`
- La pagination n'est pas encore implémentée (à venir si nécessaire)
- Les versets sont triés par numéro
- Les mémorisations sont triées par sourate puis verset
