const { PrismaClient } = require('@prisma/client');

async function setupProductionDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Setting up production database schema...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Create some initial data to test the schema
    console.log('📝 Creating initial categories...');
    
    const categories = [
      {
        id: 'cat_electronics',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronic devices and gadgets',
        color: '#3B82F6',
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'cat_clothing',
        name: 'Clothing',
        slug: 'clothing', 
        description: 'Fashion and apparel for all seasons',
        color: '#EF4444',
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'cat_home',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home and garden',
        color: '#10B981',
        isActive: true,
        sortOrder: 3
      }
    ];
    
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    
    console.log('📝 Creating initial site content...');
    
    const siteContent = [
      {
        id: 'hero_section',
        section: 'hero',
        title: 'Welcome to Kload',
        subtitle: 'Your Premium Shopping Destination',
        description: 'Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, secure delivery.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        isActive: true,
        backgroundColor: '#ffffff'
      },
      {
        id: 'about_section',
        section: 'about',
        title: 'About Kload',
        subtitle: 'Your Trusted Shopping Partner',
        description: 'We are committed to providing you with the best shopping experience, quality products, and exceptional customer service.',
        isActive: true
      }
    ];
    
    for (const content of siteContent) {
      await prisma.siteContent.upsert({
        where: { id: content.id },
        update: content,
        create: content
      });
    }
    
    // Check what we created
    const categoryCount = await prisma.category.count();
    const contentCount = await prisma.siteContent.count();
    
    console.log('✅ Database setup completed!');
    console.log(`📊 Created:`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Site Content: ${contentCount}`);
    
    console.log('🚀 Your production database is now ready!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('Full error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionDatabase();
