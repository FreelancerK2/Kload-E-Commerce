import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Running database schema migration...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Run raw SQL to create tables
    const results = {
      categories: { created: false, error: null as string | null },
      siteContent: { created: false, error: null as string | null },
      users: { created: false, error: null as string | null },
      products: { created: false, error: null as string | null },
      orders: { created: false, error: null as string | null },
      orderItems: { created: false, error: null as string | null }
    };
    
    // Create categories table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."categories" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "description" TEXT,
          "color" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
        )
      `;
      results.categories.created = true;
      console.log('✅ Categories table created');
    } catch (error) {
      results.categories.error = error instanceof Error ? error.message : String(error);
      console.log('Categories table error:', results.categories.error);
    }
    
    // Create site_content table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."site_content" (
          "id" TEXT NOT NULL,
          "section" TEXT NOT NULL,
          "title" TEXT,
          "subtitle" TEXT,
          "description" TEXT,
          "buttonText" TEXT,
          "buttonLink" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "backgroundColor" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
        )
      `;
      results.siteContent.created = true;
      console.log('✅ Site content table created');
    } catch (error) {
      results.siteContent.error = error instanceof Error ? error.message : String(error);
      console.log('Site content table error:', results.siteContent.error);
    }
    
    // Create users table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."users" (
          "id" TEXT NOT NULL,
          "clerkId" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "phoneNumber" TEXT,
          "address" TEXT,
          "city" TEXT,
          "state" TEXT,
          "zipCode" TEXT,
          "country" TEXT,
          "isAdmin" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        )
      `;
      results.users.created = true;
      console.log('✅ Users table created');
    } catch (error) {
      results.users.error = error instanceof Error ? error.message : String(error);
      console.log('Users table error:', results.users.error);
    }
    
    // Create products table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."products" (
          "id" TEXT NOT NULL,
          "sanityId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "price" DECIMAL(10,2) NOT NULL,
          "images" TEXT,
          "category" TEXT,
          "tags" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "products_pkey" PRIMARY KEY ("id")
        )
      `;
      results.products.created = true;
      console.log('✅ Products table created');
    } catch (error) {
      results.products.error = error instanceof Error ? error.message : String(error);
      console.log('Products table error:', results.products.error);
    }
    
    // Create orders table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."orders" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "total" DECIMAL(10,2) NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "stripeSessionId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
        )
      `;
      results.orders.created = true;
      console.log('✅ Orders table created');
    } catch (error) {
      results.orders.error = error instanceof Error ? error.message : String(error);
      console.log('Orders table error:', results.orders.error);
    }
    
    // Create order_items table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "public"."order_items" (
          "id" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" DECIMAL(10,2) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
        )
      `;
      results.orderItems.created = true;
      console.log('✅ Order items table created');
    } catch (error) {
      results.orderItems.error = error instanceof Error ? error.message : String(error);
      console.log('Order items table error:', results.orderItems.error);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database schema migration completed!',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to migrate the database schema',
    usage: 'POST /api/migrate-schema'
  });
}
