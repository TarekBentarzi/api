const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestMemorizations() {
  try {
    console.log('🔍 Recherche des utilisateurs...');
    
    // Récupérer un utilisateur de test
    const users = await prisma.user.findMany({ take: 1 });
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Utilisateur trouvé: ${user.name} (${user.id})`);
    
    // Sourates à marquer comme mémorisées (les plus courtes pour tester)
    const souratesToMemorize = [1, 112, 113, 114, 109, 108];
    
    console.log('\n📚 Ajout des sourates mémorisées...');
    
    for (const sourateNumero of souratesToMemorize) {
      // Vérifier si la sourate existe
      const sourate = await prisma.sourate.findUnique({
        where: { numero: sourateNumero },
      });
      
      if (!sourate) {
        console.log(`⚠️  Sourate ${sourateNumero} introuvable`);
        continue;
      }
      
      // Marquer la sourate comme mémorisée
      await prisma.sourateProgress.upsert({
        where: {
          userId_sourateNumero: {
            userId: user.id,
            sourateNumero: sourateNumero,
          },
        },
        update: {
          isMemorized: true,
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          sourateNumero: sourateNumero,
          isMemorized: true,
          completedAt: new Date(),
        },
      });
      
      console.log(`✅ Sourate ${sourateNumero} - ${sourate.nomTranslitteration} marquée comme mémorisée`);
      
      // Générer les questions de quiz pour cette sourate
      console.log(`   🎯 Génération des questions...`);
      
      // Récupérer les versets de cette sourate
      const versets = await prisma.verset.findMany({
        where: { sourateNumero: sourateNumero },
      });
      
      let questionsCreated = 0;
      for (const verset of versets) {
        // Vérifier si des questions existent déjà
        const existing = await prisma.quizQuestion.findMany({
          where: { versetId: verset.id },
        });
        
        if (existing.length > 0) {
          continue; // Questions déjà créées
        }
        
        // Extraire les mots arabes
        const words = verset.texteArabe.split(' ').filter(w => w.trim());
        
        if (words.length < 4) {
          continue; // Trop court
        }
        
        // Générer une question pour chaque mot significatif
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          
          // Skip mots trop courts
          if (word.length < 3) continue;
          
          // Créer le texte avec un blanc
          const texteWithBlank = words
            .map((w, idx) => (idx === i ? '_____' : w))
            .join(' ');
          
          // Générer 3 options incorrectes
          const otherWords = words.filter(
            (w, idx) => idx !== i && w.length >= 3 && w !== word
          );
          
          // Sélectionner 3 mots aléatoires
          const shuffled = otherWords.sort(() => 0.5 - Math.random());
          const incorrectOptions = shuffled.slice(0, 3);
          
          // S'assurer qu'on a 4 options
          while (incorrectOptions.length < 3) {
            incorrectOptions.push('...');
          }
          
          // Mélanger les options
          const options = [word, ...incorrectOptions].sort(() => 0.5 - Math.random());
          
          // Créer la question
          await prisma.quizQuestion.create({
            data: {
              versetId: verset.id,
              sourateNumero: sourateNumero,
              versetNumero: verset.versetNumero,
              texteArabe: verset.texteArabe,
              texteWithBlank: texteWithBlank,
              correctAnswer: word,
              options: options,
              wordPosition: i,
            },
          });
          
          questionsCreated++;
        }
      }
      
      console.log(`   ✅ ${questionsCreated} questions créées`);
    }
    
    console.log('\n🎉 Terminé! Les sourates suivantes sont maintenant disponibles pour les quiz:');
    souratesToMemorize.forEach(num => {
      console.log(`   - Sourate ${num}`);
    });
    
    console.log(`\n👤 Pour l'utilisateur: ${user.name} (ID: ${user.id})`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestMemorizations();
