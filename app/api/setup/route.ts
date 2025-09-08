import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Starting simple database setup...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to create a simple table structure
    // First, let's try to create a category
    const testCategory = await prisma.category.create({
      data: {
        id: 'test_category',
        name: 'Test Category',
        slug: 'test-category',
        description: 'This is a test category',
        color: '#3B82F6',
        isActive: true,
        sortOrder: 1
      }
    }).catch(async (error) => {
      console.log('Category creation error:', error.message);
      // If it already exists, try to update it
      return await prisma.category.upsert({
        where: { id: 'test_category' },
        update: {
          name: 'Test Category Updated',
          updatedAt: new Date()
        },
        create: {
          id: 'test_category',
          name: 'Test Category',
          slug: 'test-category',
          description: 'This is a test category',
          color: '#3B82F6',
          isActive: true,
          sortOrder: 1
        }
      });
    });
    
    console.log('✅ Test category created/updated:', testCategory.id);
    
    // Try to create site content
    const testContent = await prisma.siteContent.create({
      data: {
        id: 'test_content',
        section: 'test',
        title: 'Test Content',
        description: 'This is test content',
        isActive: true
      }
    }).catch(async (error) => {
      console.log('Site content creation error:', error.message);
      // If it already exists, try to update it
      return await prisma.siteContent.upsert({
        where: { id: 'test_content' },
        update: {
          title: 'Test Content Updated',
          updatedAt: new Date()
        },
        create: {
          id: 'test_content',
          section: 'test',
          title: 'Test Content',
          description: 'This is test content',
          isActive: true
        }
      });
    });
    
    console.log('✅ Test content created/updated:', testContent.id);
    
    // Get counts
    const categoryCount = await prisma.category.count();
    const contentCount = await prisma.siteContent.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      results: {
        testCategory: testCategory.id,
        testContent: testContent.id,
        totalCategories: categoryCount,
        totalContent: contentCount
      }
    });
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    
    const counts = {
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      siteContent: await prisma.siteContent.count(),
      users: await prisma.user.count()
    };
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      counts,
      message: 'Database status retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
