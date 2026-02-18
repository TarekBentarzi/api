import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Seed Users
    const users = [
        { name: 'Bob', email: 'bob@example.com', password: 'password123' },
        { name: 'Carol', email: 'carol@example.com', password: 'password123' },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    console.log('✅ Users seeded');

    // Seed Sourates (les 3 premières pour test)
    const sourates = [
        {
            numero: 1,
            nomArabe: 'الفاتحة',
            nomTranslitteration: 'Al-Fatiha',
            nomTraduction: "L'Ouverture",
            nombreVersets: 7,
            revelation: 'Mecquoise',
            versets: [
                {
                    versetNumero: 1,
                    texteArabe: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    translitteration: 'Bismi Allāhi Ar-Raḥmāni Ar-Raḥīmi',
                    traduction: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",
                },
                {
                    versetNumero: 2,
                    texteArabe: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    translitteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīna',
                    traduction: "Louange à Allah, Seigneur de l'univers",
                },
                {
                    versetNumero: 3,
                    texteArabe: 'الرَّحْمَٰنِ الرَّحِيمِ',
                    translitteration: 'Ar-Raḥmāni Ar-Raḥīmi',
                    traduction: 'Le Tout Miséricordieux, le Très Miséricordieux',
                },
                {
                    versetNumero: 4,
                    texteArabe: 'مَالِكِ يَوْمِ الدِّينِ',
                    translitteration: 'Māliki yawmi d-dīni',
                    traduction: 'Maître du Jour de la rétribution',
                },
                {
                    versetNumero: 5,
                    texteArabe: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                    translitteration: 'Iyyāka naʿbudu wa iyyāka nastaʿīnu',
                    traduction: "C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons secours",
                },
                {
                    versetNumero: 6,
                    texteArabe: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                    translitteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīma',
                    traduction: 'Guide-nous dans le droit chemin',
                },
                {
                    versetNumero: 7,
                    texteArabe: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                    translitteration: 'Ṣirāṭa llaḏīna anʿamta ʿalayhim ġayri l-maġḍūbi ʿalayhim wa lā ḍ-ḍāllīna',
                    traduction: "le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés",
                },
            ],
        },
        {
            numero: 2,
            nomArabe: 'البقرة',
            nomTranslitteration: 'Al-Baqara',
            nomTraduction: 'La Vache',
            nombreVersets: 286,
            revelation: 'Médinoise',
            versets: [
                {
                    versetNumero: 1,
                    texteArabe: 'الم',
                    translitteration: 'Alif-Lām-Mīm',
                    traduction: 'Alif, Lam, Mim',
                },
                {
                    versetNumero: 2,
                    texteArabe: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
                    translitteration: 'Ḏālika l-kitābu lā rayba fīhi hudan li-l-muttaqīna',
                    traduction: "C'est le Livre au sujet duquel il n'y a aucun doute, c'est un guide pour les pieux",
                },
                {
                    versetNumero: 3,
                    texteArabe: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
                    translitteration: 'Allaḏīna yuʾminūna bi-l-ġaybi wa yuqīmūna ṣ-ṣalāta wa mimmā razaqnāhum yunfiqūna',
                    traduction: "qui croient à l'invisible et accomplissent la Salat et dépensent [dans l'obéissance à Allah], de ce que Nous leur avons attribué",
                },
            ],
        },
        {
            numero: 112,
            nomArabe: 'الإخلاص',
            nomTranslitteration: 'Al-Ikhlas',
            nomTraduction: 'Le Monothéisme pur',
            nombreVersets: 4,
            revelation: 'Mecquoise',
            versets: [
                {
                    versetNumero: 1,
                    texteArabe: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
                    translitteration: 'Qul huwa Allāhu aḥadun',
                    traduction: "Dis: «Il est Allah, Unique",
                },
                {
                    versetNumero: 2,
                    texteArabe: 'اللَّهُ الصَّمَدُ',
                    translitteration: 'Allāhu ṣ-ṣamadu',
                    traduction: 'Allah, Le Seul à être imploré pour ce que nous désirons',
                },
                {
                    versetNumero: 3,
                    texteArabe: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
                    translitteration: 'Lam yalid wa lam yūlad',
                    traduction: "Il n'a jamais engendré, n'a pas été engendré non plus",
                },
                {
                    versetNumero: 4,
                    texteArabe: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
                    translitteration: 'Wa lam yakun lahu kufuwan aḥadun',
                    traduction: "Et nul n'est égal à Lui»",
                },
            ],
        },
    ];

    for (const sourateData of sourates) {
        const { versets, ...sourateInfo } = sourateData;
        
        const sourate = await prisma.sourate.upsert({
            where: { numero: sourateInfo.numero },
            update: {},
            create: sourateInfo,
        });

        console.log(`✅ Sourate ${sourate.numero} - ${sourate.nomTranslitteration} seeded`);

        // Seed versets for this sourate
        for (const versetData of versets) {
            await prisma.verset.upsert({
                where: {
                    sourateNumero_versetNumero: {
                        sourateNumero: sourate.numero,
                        versetNumero: versetData.versetNumero,
                    },
                },
                update: {},
                create: {
                    sourateNumero: sourate.numero,
                    ...versetData,
                },
            });
        }
        console.log(`   ✅ ${versets.length} versets seeded`);
    }

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
