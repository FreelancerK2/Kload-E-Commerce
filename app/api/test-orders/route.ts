import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔄 Testing orders API...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to fetch orders
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('✅ Orders fetched:', orders.length);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Orders API test successful',
      count: orders.length,
      orders: orders,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Orders API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.toString() : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔄 Testing order creation...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to create a test order
    const testOrder = await prisma.order.create({
      data: {
        total: 99.99,
        status: 'PENDING',
        stripeSessionId: `test_${Date.now()}`
      }
    });
    
    console.log('✅ Test order created:', testOrder.id);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      orderId: testOrder.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Order creation test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.toString() : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
