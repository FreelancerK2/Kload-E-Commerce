import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Cleaning up orphaned order items...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Find all order items first
    const allOrderItems = await prisma.orderItem.findMany();
    
    // Filter out items that reference non-existent products
    const orphanedItems = [];
    for (const item of allOrderItems) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (!product) {
          orphanedItems.push(item);
        }
      } catch (error) {
        // If product doesn't exist, add to orphaned items
        orphanedItems.push(item);
      }
    }
    
    console.log(`Found ${orphanedItems.length} orphaned order items`);
    
    // Delete orphaned order items
    if (orphanedItems.length > 0) {
      const deleteResult = await prisma.orderItem.deleteMany({
        where: {
          id: {
            in: orphanedItems.map(item => item.id)
          }
        }
      });
      
      console.log(`✅ Deleted ${deleteResult.count} orphaned order items`);
    }
    
    // Find orders with no items
    const emptyOrders = await prisma.order.findMany({
      where: {
        items: {
          none: {}
        }
      }
    });
    
    console.log(`Found ${emptyOrders.length} orders with no items`);
    
    // Delete empty orders
    if (emptyOrders.length > 0) {
      const deleteOrdersResult = await prisma.order.deleteMany({
        where: {
          items: {
            none: {}
          }
        }
      });
      
      console.log(`✅ Deleted ${deleteOrdersResult.count} empty orders`);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Order cleanup completed successfully!',
      results: {
        orphanedItemsDeleted: orphanedItems.length,
        emptyOrdersDeleted: emptyOrders.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Order cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to clean up orphaned order items',
    usage: 'POST /api/cleanup-orders'
  });
}
