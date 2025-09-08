import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔄 Testing categories API...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to fetch categories
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    console.log('✅ Categories fetched:', categories.length);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Categories API test successful',
      count: categories.length,
      categories: categories,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Categories API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.toString() : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
