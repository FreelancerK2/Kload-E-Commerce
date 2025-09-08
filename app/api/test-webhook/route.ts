import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { stripeSessionId } = await request.json();

    if (!stripeSessionId) {
      return NextResponse.json(
        { error: 'Stripe session ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Testing webhook for session:', stripeSessionId);

    // Find orders with this session ID
    const orders = await prisma.order.findMany({
      where: {
        stripeSessionId: stripeSessionId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    console.log(`Found ${orders.length} orders with session ID: ${stripeSessionId}`);

    if (orders.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No orders found with this session ID',
        stripeSessionId,
      });
    }

    // Update all orders to PAID status (simulating webhook)
    const updateResult = await prisma.order.updateMany({
      where: {
        stripeSessionId: stripeSessionId,
      },
      data: {
        status: 'PAID',
      },
    });

    console.log(`✅ Updated ${updateResult.count} orders to PAID status`);

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} orders to PAID status`,
      stripeSessionId,
      ordersUpdated: updateResult.count,
      orders: orders.map(order => ({
        id: order.id,
        status: 'PAID', // Updated status
        total: order.total,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to test webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
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

    return NextResponse.json({
      success: true,
      message: `Found ${pendingOrders.length} pending orders`,
      pendingOrders: pendingOrders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        stripeSessionId: order.stripeSessionId,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
        })),
        user: order.user ? {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
        } : null,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching pending orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pending orders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
