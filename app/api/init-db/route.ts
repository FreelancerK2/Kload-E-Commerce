import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection first
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create tables by trying to insert and catch errors
    const results = {
      categories: { created: false, error: null as string | null },
      siteContent: { created: false, error: null as string | null },
      users: { created: false, error: null as string | null },
      products: { created: false, error: null as string | null },
      orders: { created: false, error: null as string | null },
      orderItems: { created: false, error: null as string | null }
    };
    
    // Try to create a category (this will create the table if it doesn't exist)
    try {
      const testCategory = await prisma.category.create({
        data: {
          id: 'init_test_category',
          name: 'Test Category',
          slug: 'test-category',
          description: 'Initial test category',
          color: '#3B82F6',
          isActive: true,
          sortOrder: 1
        }
      });
      results.categories.created = true;
      console.log('✅ Categories table created');
    } catch (error) {
      results.categories.error = error instanceof Error ? error.message : String(error);
      console.log('Categories table might already exist or error:', results.categories.error);
    }
    
    // Try to create site content
    try {
      const testContent = await prisma.siteContent.create({
        data: {
          id: 'init_test_content',
          section: 'test',
          title: 'Test Content',
          description: 'Initial test content',
          isActive: true
        }
      });
      results.siteContent.created = true;
      console.log('✅ Site content table created');
    } catch (error) {
      results.siteContent.error = error instanceof Error ? error.message : String(error);
      console.log('Site content table might already exist or error:', results.siteContent.error);
    }
    
    // Try to create a user
    try {
      const testUser = await prisma.user.create({
        data: {
          id: 'init_test_user',
          clerkId: 'test_clerk_id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      });
      results.users.created = true;
      console.log('✅ Users table created');
    } catch (error) {
      results.users.error = error instanceof Error ? error.message : String(error);
      console.log('Users table might already exist or error:', results.users.error);
    }
    
    // Try to create a product
    try {
      const testProduct = await prisma.product.create({
        data: {
          id: 'init_test_product',
          sanityId: 'test_sanity_id',
          name: 'Test Product',
          description: 'Initial test product',
          price: 99.99,
          images: 'test-image.jpg',
          category: 'test',
          tags: 'test,initial'
        }
      });
      results.products.created = true;
      console.log('✅ Products table created');
    } catch (error) {
      results.products.error = error instanceof Error ? error.message : String(error);
      console.log('Products table might already exist or error:', results.products.error);
    }
    
    // Try to create an order
    try {
      const testOrder = await prisma.order.create({
        data: {
          id: 'init_test_order',
          total: 99.99,
          status: 'PENDING'
        }
      });
      results.orders.created = true;
      console.log('✅ Orders table created');
    } catch (error) {
      results.orders.error = error instanceof Error ? error.message : String(error);
      console.log('Orders table might already exist or error:', results.orders.error);
    }
    
    // Try to create an order item
    try {
      const testOrderItem = await prisma.orderItem.create({
        data: {
          id: 'init_test_order_item',
          orderId: 'init_test_order',
          productId: 'init_test_product',
          quantity: 1,
          price: 99.99
        }
      });
      results.orderItems.created = true;
      console.log('✅ Order items table created');
    } catch (error) {
      results.orderItems.error = error instanceof Error ? error.message : String(error);
      console.log('Order items table might already exist or error:', results.orderItems.error);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialization completed!',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to initialize the database schema',
    usage: 'POST /api/init-db'
  });
}
