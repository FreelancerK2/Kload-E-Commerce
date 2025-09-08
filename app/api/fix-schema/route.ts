import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Fixing database schema by adding missing columns...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    const results = {
      orderStatusEnum: { created: false, error: null as string | null },
      categories: { fixed: false, error: null as string | null },
      siteContent: { fixed: false, error: null as string | null },
      users: { fixed: false, error: null as string | null },
      products: { fixed: false, error: null as string | null },
      orders: { fixed: false, error: null as string | null },
      orderItems: { fixed: false, error: null as string | null }
    };
    
    // Create OrderStatus enum first
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;
      results.orderStatusEnum.created = true;
      console.log('✅ OrderStatus enum created');
    } catch (error) {
      results.orderStatusEnum.error = error instanceof Error ? error.message : String(error);
      console.log('OrderStatus enum error:', results.orderStatusEnum.error);
    }

    // Fix categories table - add missing columns
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Add imageUrl column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'imageUrl') THEN
            ALTER TABLE "public"."categories" ADD COLUMN "imageUrl" TEXT;
          END IF;
          
          -- Add unique constraint to slug if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'categories' AND constraint_name = 'categories_slug_key') THEN
            ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");
          END IF;
        END $$;
      `;
      results.categories.fixed = true;
      console.log('✅ Categories table fixed');
    } catch (error) {
      results.categories.error = error instanceof Error ? error.message : String(error);
      console.log('Categories table error:', results.categories.error);
    }
    
    // Fix site_content table - add missing columns
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Add missing columns if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'backgroundOpacity') THEN
            ALTER TABLE "public"."site_content" ADD COLUMN "backgroundOpacity" INTEGER DEFAULT 50;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'heroImage') THEN
            ALTER TABLE "public"."site_content" ADD COLUMN "heroImage" TEXT;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'removeBackground') THEN
            ALTER TABLE "public"."site_content" ADD COLUMN "removeBackground" BOOLEAN DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'aggressiveRemoval') THEN
            ALTER TABLE "public"."site_content" ADD COLUMN "aggressiveRemoval" BOOLEAN DEFAULT false;
          END IF;
          
          -- Add unique constraint to section if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'site_content' AND constraint_name = 'site_content_section_key') THEN
            ALTER TABLE "public"."site_content" ADD CONSTRAINT "site_content_section_key" UNIQUE ("section");
          END IF;
        END $$;
      `;
      results.siteContent.fixed = true;
      console.log('✅ Site content table fixed');
    } catch (error) {
      results.siteContent.error = error instanceof Error ? error.message : String(error);
      console.log('Site content table error:', results.siteContent.error);
    }
    
    // Fix users table - add missing columns
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Add imageUrl column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'imageUrl') THEN
            ALTER TABLE "public"."users" ADD COLUMN "imageUrl" TEXT;
          END IF;
          
          -- Add unique constraints if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_name = 'users_clerkId_key') THEN
            ALTER TABLE "public"."users" ADD CONSTRAINT "users_clerkId_key" UNIQUE ("clerkId");
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_name = 'users_email_key') THEN
            ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
          END IF;
        END $$;
      `;
      results.users.fixed = true;
      console.log('✅ Users table fixed');
    } catch (error) {
      results.users.error = error instanceof Error ? error.message : String(error);
      console.log('Users table error:', results.users.error);
    }
    
    // Fix products table - add missing columns
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Add missing columns if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'inStock') THEN
            ALTER TABLE "public"."products" ADD COLUMN "inStock" BOOLEAN NOT NULL DEFAULT true;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stockCount') THEN
            ALTER TABLE "public"."products" ADD COLUMN "stockCount" INTEGER NOT NULL DEFAULT 0;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
            ALTER TABLE "public"."products" ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isFeatured') THEN
            ALTER TABLE "public"."products" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isNewArrival') THEN
            ALTER TABLE "public"."products" ADD COLUMN "isNewArrival" BOOLEAN NOT NULL DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isTrending') THEN
            ALTER TABLE "public"."products" ADD COLUMN "isTrending" BOOLEAN NOT NULL DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isTopRated') THEN
            ALTER TABLE "public"."products" ADD COLUMN "isTopRated" BOOLEAN NOT NULL DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isFlashDeal') THEN
            ALTER TABLE "public"."products" ADD COLUMN "isFlashDeal" BOOLEAN NOT NULL DEFAULT false;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'originalPrice') THEN
            ALTER TABLE "public"."products" ADD COLUMN "originalPrice" DOUBLE PRECISION;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'discountPercentage') THEN
            ALTER TABLE "public"."products" ADD COLUMN "discountPercentage" INTEGER;
          END IF;
          
          -- Add unique constraint to sanityId if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_name = 'products_sanityId_key') THEN
            ALTER TABLE "public"."products" ADD CONSTRAINT "products_sanityId_key" UNIQUE ("sanityId");
          END IF;
        END $$;
      `;
      results.products.fixed = true;
      console.log('✅ Products table fixed');
    } catch (error) {
      results.products.error = error instanceof Error ? error.message : String(error);
      console.log('Products table error:', results.products.error);
    }
    
    // Fix orders table - update status column type
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Change status column to use OrderStatus enum if it's not already
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status' AND data_type = 'text') THEN
            ALTER TABLE "public"."orders" ALTER COLUMN "status" TYPE "public"."OrderStatus" USING "status"::"public"."OrderStatus";
          END IF;
          
          -- Add unique constraint to stripeSessionId if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'orders' AND constraint_name = 'orders_stripeSessionId_key') THEN
            ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_stripeSessionId_key" UNIQUE ("stripeSessionId");
          END IF;
        END $$;
      `;
      results.orders.fixed = true;
      console.log('✅ Orders table fixed');
    } catch (error) {
      results.orders.error = error instanceof Error ? error.message : String(error);
      console.log('Orders table error:', results.orders.error);
    }
    
    // Fix order_items table - remove updatedAt constraint issue
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Remove updatedAt column if it exists (it shouldn't be there according to schema)
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'updatedAt') THEN
            ALTER TABLE "public"."order_items" DROP COLUMN "updatedAt";
          END IF;
          
          -- Remove createdAt column if it exists (it shouldn't be there according to schema)
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'createdAt') THEN
            ALTER TABLE "public"."order_items" DROP COLUMN "createdAt";
          END IF;
        END $$;
      `;
      results.orderItems.fixed = true;
      console.log('✅ Order items table fixed');
    } catch (error) {
      results.orderItems.error = error instanceof Error ? error.message : String(error);
      console.log('Order items table error:', results.orderItems.error);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database schema fixed successfully!',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to fix the database schema',
    usage: 'POST /api/fix-schema'
  });
}
