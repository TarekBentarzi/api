import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

// Récitateurs disponibles sur EveryAyah.com
const RECITATEURS = {
    abdulbasit: 'Abdul_Basit_Murattal_192kbps',
    alafasy: 'Alafasy_128kbps',
    husary: 'Husary_128kbps',
    minshawi: 'Minshawy_Murattal_128kbps',
    sudais: 'Sudais_192kbps',
};

// Utiliser Abdul Basit par défaut (haute qualité)
const DEFAULT_RECITATEUR = RECITATEURS.abdulbasit;

async function addAudioUrls() {
    try {
        console.log('🎵 Starting audio URL update...\n');
        console.log(`📻 Récitateur: ${DEFAULT_RECITATEUR}\n`);

        // Récupérer tous les versets
        const versets = await prisma.verset.findMany({
            orderBy: [{ sourateNumero: 'asc' }, { versetNumero: 'asc' }],
        });

        console.log(`📊 Total versets: ${versets.length}\n`);

        let updated = 0;

        for (const verset of versets) {
            // Format: 001001.mp3 (sourate sur 3 chiffres + verset sur 3 chiffres)
            const sourateStr = verset.sourateNumero.toString().padStart(3, '0');
            const versetStr = verset.versetNumero.toString().padStart(3, '0');
            
            const audioUrl = `https://everyayah.com/data/${DEFAULT_RECITATEUR}/${sourateStr}${versetStr}.mp3`;

            await prisma.verset.update({
                where: { id: verset.id },
                data: { audioUrl },
            });

            updated++;

            // Log tous les 100 versets
            if (updated % 100 === 0) {
                console.log(`✅ ${updated} versets mis à jour...`);
            }
        }

        console.log(`\n🎉 Mise à jour terminée!`);
        console.log(`📊 ${updated} URLs audio ajoutées`);
        console.log(`\n💡 Récitateurs disponibles:`);
        Object.entries(RECITATEURS).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    }
}

addAudioUrls()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
