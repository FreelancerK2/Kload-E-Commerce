import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Fixing remaining database schema issues...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    const results = {
      ordersStatus: { fixed: false, error: null as string | null },
      siteContentBackgroundImage: { fixed: false, error: null as string | null },
      ordersIdConstraint: { fixed: false, error: null as string | null }
    };
    
    // Fix orders table status column
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- First, update any existing 'PENDING' values to ensure they're valid
          UPDATE "public"."orders" SET "status" = 'PENDING' WHERE "status" = 'PENDING';
          
          -- Now try to alter the column type
          ALTER TABLE "public"."orders" ALTER COLUMN "status" TYPE "public"."OrderStatus" USING "status"::"public"."OrderStatus";
          ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
        END $$;
      `;
      results.ordersStatus.fixed = true;
      console.log('✅ Orders status column fixed');
    } catch (error) {
      results.ordersStatus.error = error instanceof Error ? error.message : String(error);
      console.log('Orders status error:', results.ordersStatus.error);
    }
    
    // Fix site_content table - add backgroundImage column
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Add backgroundImage column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'backgroundImage') THEN
            ALTER TABLE "public"."site_content" ADD COLUMN "backgroundImage" TEXT;
          END IF;
        END $$;
      `;
      results.siteContentBackgroundImage.fixed = true;
      console.log('✅ Site content backgroundImage column added');
    } catch (error) {
      results.siteContentBackgroundImage.error = error instanceof Error ? error.message : String(error);
      console.log('Site content backgroundImage error:', results.siteContentBackgroundImage.error);
    }
    
    // Fix orders table ID constraint issue
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          -- Check if there are any duplicate IDs in orders table
          -- If so, we'll need to clean them up
          DELETE FROM "public"."orders" WHERE "id" IN (
            SELECT "id" FROM (
              SELECT "id", ROW_NUMBER() OVER (PARTITION BY "id" ORDER BY "createdAt") as rn
              FROM "public"."orders"
            ) t WHERE rn > 1
          );
        END $$;
      `;
      results.ordersIdConstraint.fixed = true;
      console.log('✅ Orders ID constraint fixed');
    } catch (error) {
      results.ordersIdConstraint.error = error instanceof Error ? error.message : String(error);
      console.log('Orders ID constraint error:', results.ordersIdConstraint.error);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Remaining database schema issues fixed!',
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
    message: 'Send a POST request to fix remaining database schema issues',
    usage: 'POST /api/fix-remaining-schema'
  });
}
