import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total customers
    const totalCustomers = await prisma.user.count();

    // Get recent orders with user information
    const recentOrders = await prisma.order.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Get top products by order count
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          ...item,
          product,
        };
      })
    );

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.user ? {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
        } : null,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            name: item.product.name,
            images: item.product.images,
          },
        })),
      })),
      topProducts: topProductsWithDetails.map((item) => ({
        id: item.productId,
        totalQuantity: item._sum.quantity,
        product: item.product,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch admin statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
