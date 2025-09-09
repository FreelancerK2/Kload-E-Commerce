import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('🔄 Fetching orders...');
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Fetch order by session ID
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Transform order data for frontend
      const transformedOrder = {
        id: order.id,
        stripeSessionId: order.stripeSessionId,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.productId,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images,
        })),
        user: order.user
          ? {
              firstName: order.user.firstName,
              lastName: order.user.lastName,
              email: order.user.email,
            }
          : null,
      };

      return NextResponse.json({ orders: [transformedOrder] });
    }

    // Fetch all orders
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

    console.log('✅ Found orders:', orders.length);

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      stripeSessionId: order.stripeSessionId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images,
      })),
      user: order.user
        ? {
            firstName: order.user.firstName,
            lastName: order.user.lastName,
            email: order.user.email,
          }
        : null,
    }));

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating order...');
    
    const body = await request.json();
    const { items, guestInfo, paymentIntentId, total } = body;

    console.log('Order data:', {
      items: items?.length,
      guestInfo,
      paymentIntentId,
      total,
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      );
    }

    // Create or find user
    let user = null;
    const orderData: any = {
      total: total || 0,
      status: 'PENDING',
      stripeSessionId: paymentIntentId,
    };

    if (guestInfo && guestInfo.email) {
      try {
        // Check if guest user exists, create if not
        user = await prisma.user.findFirst({
          where: {
            email: guestInfo.email,
          },
        });

        if (!user) {
          // Create guest user
          user = await prisma.user.create({
            data: {
              email: guestInfo.email,
              firstName: guestInfo.firstName || '',
              lastName: guestInfo.lastName || '',
              clerkId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
          });
          console.log('✅ Created guest user:', user.id);
        } else {
          console.log('✅ Found existing user:', user.id);
        }

        orderData.userId = user.id;
      } catch (userError) {
        console.error('❌ Error handling user:', userError);
        // Continue without user if there's an error
        orderData.userId = null;
      }
    } else {
      console.log('No guest info provided, creating order without user');
      orderData.userId = null;
    }

    // Create the order
    const order = await prisma.order.create({
      data: orderData,
    });

    console.log('✅ Order created:', order.id);

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }

    console.log('✅ Order items created for order:', order.id);

    return NextResponse.json({
      orderId: order.id,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
