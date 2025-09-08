const { PrismaClient } = require('@prisma/client');

// This script will run database migrations and import data
async function migrateProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Setting up production database...');
    
    // First, let's check if we can connect
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Run a simple query to test the connection
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`📊 Current database state:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    
    if (userCount === 0 && productCount === 0 && categoryCount === 0) {
      console.log('📝 Database is empty. You can now import your data using:');
      console.log('   node scripts/import-data.js');
    } else {
      console.log('✅ Database already has data!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProduction();
