import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
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

    // Transform orders to match the frontend expected structure
    const transformedOrders = validOrders.map((order) => ({
      id: order.id,
      stripeSessionId: order.stripeSessionId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product?.name || 'Unknown Product',
        price: item.price,
        quantity: item.quantity,
        image: item.product?.images || '',
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
