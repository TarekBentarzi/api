# Import des données complètes du Coran

## État actuel
Le seed actuel (`seed.ts`) contient seulement 3 sourates de test:
- Sourate 1 (Al-Fatiha) - 7 versets
- Sourate 2 (Al-Baqara) - 3 versets (sur 286)
- Sourate 112 (Al-Ikhlas) - 4 versets

## Import complet recommandé

### Option 1: API Alquran Cloud (Recommandé)
API gratuite avec toutes les sourates et versets en arabe avec traductions.

**Endpoint principal:**
```
https://api.alquran.cloud/v1/quran/fr.hamidullah
```

**Exemple de script d'import:**
```typescript
// prisma/import-full-quran.ts
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function importCompleteQuran() {
    console.log('📥 Fetching Quran data from API...');
    
    // Récupérer le Coran complet avec traduction française
    const response = await axios.get('https://api.alquran.cloud/v1/quran/fr.hamidullah');
    const quranData = response.data.data;
    
    console.log('✅ Data fetched successfully');
    console.log(`📊 Total sourates: ${quranData.surahs.length}`);
    
    for (const surah of quranData.surahs) {
        // Créer la sourate
        const sourate = await prisma.sourate.upsert({
            where: { numero: surah.number },
            update: {},
            create: {
                numero: surah.number,
                nomArabe: surah.name,
                nomTranslitteration: surah.englishName,
                nomTraduction: surah.englishNameTranslation,
                nombreVersets: surah.numberOfAyahs,
                revelation: surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise',
            },
        });
        
        console.log(`✅ Sourate ${sourate.numero} - ${sourate.nomTranslitteration}`);
        
        // Créer les versets
        for (const ayah of surah.ayahs) {
            await prisma.verset.upsert({
                where: {
                    sourateNumero_versetNumero: {
                        sourateNumero: surah.number,
                        versetNumero: ayah.numberInSurah,
                    },
                },
                update: {},
                create: {
                    sourateNumero: surah.number,
                    versetNumero: ayah.numberInSurah,
                    texteArabe: ayah.text,
                    traduction: ayah.text, // C'est déjà la traduction française
                },
            });
        }
        
        console.log(`   ✅ ${surah.numberOfAyahs} versets importés`);
    }
    
    console.log('🎉 Import complet terminé!');
}

importCompleteQuran()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

**Pour exécuter:**
```bash
npm install axios
npx ts-node prisma/import-full-quran.ts
```

### Option 2: API Quran.com
API moderne avec plus d'options de récitateurs et traductions.

**Endpoints:**
```
https://api.quran.com/api/v4/chapters
https://api.quran.com/api/v4/verses/by_chapter/{chapter_number}
```

### Option 3: Fichier JSON local
Télécharger un fichier JSON complet du Coran et l'importer.

**Sources:**
- https://github.com/risan/quran-json
- https://github.com/islamic-network/api.alquran.cloud

## Structure des données importées

Après l'import complet, votre base contiendra:
- **114 sourates** (de La Fatiha à An-Nas)
- **~6,236 versets** au total
- Texte arabe pour chaque verset
- Traduction française
- Métadonnées (révélation mecquoise/médinoise)

## Audio (À faire plus tard)

Pour les fichiers MP3 de récitation:

### Sources recommandées:
1. **EveryAyah.com**
   ```
   https://everyayah.com/data/[reciter]/[surah]_[ayah].mp3
   ```
   Exemple: `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3`

2. **Quran.com CDN**
   ```
   https://verses.quran.com/[reciter]/mp3/[verse_key].mp3
   ```

### Script pour ajouter les URLs audio:
```typescript
const reciter = 'AbdulBaset/Mujawwad/128';
await prisma.verset.updateMany({
    data: {
        audioUrl: `https://everyayah.com/data/${reciter}/${sourateNumero.toString().padStart(3, '0')}${versetNumero.toString().padStart(3, '0')}.mp3`
    }
});
```

## Prochaines étapes

1. ✅ Structure de base créée
2. ⏳ Importer les 114 sourates complètes
3. ⏳ Ajouter les URLs audio
4. ⏳ Créer les endpoints API (NestJS)
5. ⏳ Connecter avec l'app React Native
