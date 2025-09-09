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

    // Fetch all orders without including products first
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // For each order, fetch valid items with products
    const validOrders = [];
    for (const order of orders) {
      const validItems = [];
      for (const item of order.items) {
        try {
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          });
          if (product) {
            validItems.push({
              ...item,
              product: product
            });
          }
        } catch (error) {
          console.log(`Product ${item.productId} not found, skipping item`);
        }
      }
      
      if (validItems.length > 0) {
        validOrders.push({
          ...order,
          items: validItems
        });
      }
    }

    console.log('✅ Found orders:', validOrders.length);

    const transformedOrders = validOrders.map((order) => ({
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
      status: 'PAID', // Automatically set to PAID since payment was successful
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

    // Create order items and update product stock
    for (const item of items) {
      // Check if product exists and has enough stock
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        console.error(`❌ Product ${item.id} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        console.error(`❌ Insufficient stock for product ${item.id}. Available: ${product.stock}, Requested: ${item.quantity}`);
        continue;
      }

      // Create the order item
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        },
      });

      // Update product stock (decrease by quantity ordered)
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      console.log(`✅ Updated stock for product ${item.id}: ${product.stock} → ${product.stock - item.quantity}`);
    }

    console.log('✅ Order items created and stock updated for order:', order.id);

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

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    console.log(`✅ Order ${orderId} updated to ${status}`);

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} updated to ${status}`,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total: updatedOrder.total,
        stripeSessionId: updatedOrder.stripeSessionId,
      },
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
