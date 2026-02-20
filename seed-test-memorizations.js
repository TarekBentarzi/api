const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ajout de données de test pour la mémorisation...');

  // Récupérer Bob
  const bob = await prisma.user.findUnique({
    where: { email: 'bob@example.com' },
  });

  if (!bob) {
    console.error('❌ Utilisateur Bob non trouvé');
    return;
  }

  console.log(`✅ Utilisateur trouvé: ${bob.name} (${bob.id})`);

  // Marquer les sourates 1, 112, 113, 114 comme mémorisées
  const souratesToMemorize = [1, 112, 113, 114];

  for (const sourateNumero of souratesToMemorize) {
    // Créer le progress
    await prisma.sourateProgress.upsert({
      where: {
        userId_sourateNumero: {
          userId: bob.id,
          sourateNumero,
        },
      },
      update: {
        isMemorized: true,
        completedAt: new Date(),
      },
      create: {
        userId: bob.id,
        sourateNumero,
        isMemorized: true,
        completedAt: new Date(),
      },
    });

    console.log(`   ✅ Sourate ${sourateNumero} marquée comme mémorisée`);
  }

  console.log('\n🎉 Données de test ajoutées avec succès!');
  console.log(`\n📊 Bob a maintenant ${souratesToMemorize.length} sourates mémorisées`);
  console.log('   - Sourate 1 (Al-Fatiha)');
  console.log('   - Sourate 112 (Al-Ikhlas)');
  console.log('   - Sourate 113 (Al-Falaq)');
  console.log('   - Sourate 114 (An-Nas)');
  console.log('\n💡 Connectez-vous avec bob@example.com / password123 pour voir les quiz!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
