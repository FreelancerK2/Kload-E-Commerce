import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initial data to set up the database
const initialData = {
  categories: [
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
    },
    {
      id: 'cat_sports',
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and athletic gear',
      color: '#F59E0B',
      isActive: true,
      sortOrder: 4
    },
    {
      id: 'cat_accessories',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories and lifestyle items',
      color: '#8B5CF6',
      isActive: true,
      sortOrder: 5
    }
  ],
  siteContent: [
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
  ]
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting data migration...');
    
    // Import categories
    for (const category of initialData.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    
    // Import site content
    for (const content of initialData.siteContent) {
      await prisma.siteContent.upsert({
        where: { id: content.id },
        update: content,
        create: content
      });
    }
    
    console.log('✅ Migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data migrated successfully!',
      migrated: {
        categories: initialData.categories.length,
        siteContent: initialData.siteContent.length
      }
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const counts = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      categories: await prisma.category.count(),
      siteContent: await prisma.siteContent.count()
    };
    
    return NextResponse.json({ 
      success: true, 
      counts,
      message: 'Database status retrieved'
    });
    
  } catch (error) {
    console.error('❌ Error getting database status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get database status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
