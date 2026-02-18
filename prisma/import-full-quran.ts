import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Créer le client Prisma avec des options spéciales pour éviter les problèmes de pooling
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

interface ApiAyah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

interface ApiSurah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: ApiAyah[];
}

interface ApiResponse {
    data: {
        surahs: ApiSurah[];
    };
}

async function importCompleteQuran() {
    try {
        console.log('📥 Fetching Quran data from API...');
        
        // Récupérer le Coran complet avec traduction française
        const response = await axios.get<ApiResponse>('https://api.alquran.cloud/v1/quran/fr.hamidullah');
        const quranData = response.data.data;
        
        console.log('✅ Data fetched successfully');
        console.log(`📊 Total sourates: ${quranData.surahs.length}`);
        
        let totalVersetsImported = 0;
        
        for (const surah of quranData.surahs) {
            // Créer la sourate
            const nombreVersets = surah.numberOfAyahs || surah.ayahs?.length || 0;
            const sourate = await prisma.sourate.upsert({
                where: { numero: surah.number },
                update: {
                    nomArabe: surah.name,
                    nomTranslitteration: surah.englishName,
                    nomTraduction: surah.englishNameTranslation,
                    nombreVersets: nombreVersets,
                    revelation: surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise',
                },
                create: {
                    numero: surah.number,
                    nomArabe: surah.name,
                    nomTranslitteration: surah.englishName,
                    nomTraduction: surah.englishNameTranslation,
                    nombreVersets: nombreVersets,
                    revelation: surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise',
                },
            });
            
            console.log(`✅ Sourate ${sourate.numero} - ${sourate.nomTranslitteration} (${sourate.nombreVersets} versets)`);
            
            // Créer les versets un par un pour éviter les problèmes de connexion
            for (const ayah of surah.ayahs) {
                await prisma.verset.upsert({
                    where: {
                        sourateNumero_versetNumero: {
                            sourateNumero: surah.number,
                            versetNumero: ayah.numberInSurah,
                        },
                    },
                    update: {
                        texteArabe: ayah.text,
                        traduction: ayah.text, // API retourne déjà la traduction française
                    },
                    create: {
                        sourateNumero: surah.number,
                        versetNumero: ayah.numberInSurah,
                        texteArabe: ayah.text,
                        traduction: ayah.text, // API retourne déjà la traduction française
                    },
                });
            }
            
            totalVersetsImported += surah.ayahs.length;
            
            console.log(`   ✅ ${surah.ayahs.length} versets importés`);
        }
        
        console.log('\n🎉 Import complet terminé!');
        console.log(`📊 Résumé:`);
        console.log(`   - ${quranData.surahs.length} sourates importées`);
        console.log(`   - ${totalVersetsImported} versets importés`);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        throw error;
    }
}

// Fonction pour récupérer le texte arabe séparément (API différente)
async function importArabicText() {
    try {
        console.log('\n📥 Fetching Arabic text from API...');
        
        const response = await axios.get<ApiResponse>('https://api.alquran.cloud/v1/quran/ar.alafasy');
        const quranData = response.data.data;
        
        console.log('✅ Arabic data fetched successfully');
        
        for (const surah of quranData.surahs) {
            console.log(`✅ Updating Arabic text for Sourate ${surah.number} - ${surah.englishName}`);
            
            for (const ayah of surah.ayahs) {
                await prisma.verset.update({
                    where: {
                        sourateNumero_versetNumero: {
                            sourateNumero: surah.number,
                            versetNumero: ayah.numberInSurah,
                        },
                    },
                    data: {
                        texteArabe: ayah.text,
                    },
                });
            }
            
            console.log(`   ✅ ${surah.ayahs.length} versets updated`);
        }
        
        console.log('\n🎉 Arabic text import completed!');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'import du texte arabe:', error);
        throw error;
    }
}

async function main() {
    console.log('🌙 Starting Quran import process...\n');
    
    // Importer les traductions françaises d'abord
    await importCompleteQuran();
    
    // Puis mettre à jour avec le texte arabe correct
    await importArabicText();
    
    console.log('\n✨ All done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
