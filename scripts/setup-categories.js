const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up categories...');

  // Create categories table if it doesn't exist
  try {
    // This will create the table based on your Prisma schema
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        imageUrl TEXT,
        color TEXT DEFAULT '#3B82F6',
        isActive BOOLEAN DEFAULT true,
        sortOrder INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Categories table created successfully!');

    // Insert some default categories
    const defaultCategories = [
      {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        imageUrl: '/images/categories/electronics.svg',
        color: '#3B82F6',
        isActive: true,
        sortOrder: 0,
      },
      {
        id: 'cat-2',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        imageUrl: '/images/categories/clothing.svg',
        color: '#8B5CF6',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'cat-3',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Various accessories and add-ons',
        imageUrl: '/images/categories/accessories.svg',
        color: '#10B981',
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'cat-4',
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        imageUrl: '/images/categories/home-garden.svg',
        color: '#F97316',
        isActive: true,
        sortOrder: 3,
      },
      {
        id: 'cat-5',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and athletic gear',
        imageUrl: '/images/categories/sports.svg',
        color: '#EF4444',
        isActive: true,
        sortOrder: 4,
      },
    ];

    for (const category of defaultCategories) {
      try {
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO categories (id, name, slug, description, imageUrl, color, isActive, sortOrder)
          VALUES (${category.id}, ${category.name}, ${category.slug}, ${category.description}, ${category.imageUrl}, ${category.color}, ${category.isActive}, ${category.sortOrder})
        `;
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        console.log(
          `⚠️  Category ${category.name} already exists or error:`,
          error.message
        );
      }
    }

    console.log('🎉 Categories setup completed!');
  } catch (error) {
    console.error('❌ Error setting up categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
