const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔍 Vérification des tables existantes...');
    
    // Vérifier si les tables existent déjà
    const tablesExist = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_questions'
      ) as exists;
    `;
    
    console.log(`Tables existantes: ${tablesExist[0].exists}`);
    
    // Supprimer les tables si elles existent pour recréer proprement
    if (tablesExist[0].exists) {
      console.log('🗑️  Suppression des anciennes tables...');
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "quiz_attempts" CASCADE');
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "quiz_questions" CASCADE');
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "sourate_progress" CASCADE');
      console.log('✅ Tables supprimées');
    }
    
    console.log('📝 Lecture du fichier de migration...');
    const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20260219000000_add_quiz_system', 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Application de la migration...');
    
    // Diviser le SQL en commandes individuelles
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 ${statements.length} commandes SQL à exécuter...`);
    
    // Exécuter chaque commande individuellement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`  [${i + 1}/${statements.length}] Exécution...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ Migration appliquée avec succès!');
    console.log('📊 Tables créées: quiz_questions, quiz_attempts, sourate_progress');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:');
    console.error(error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Les tables existent déjà. Migration ignorée.');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✨ Migration terminée!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Échec de la migration:', error);
    process.exit(1);
  });
