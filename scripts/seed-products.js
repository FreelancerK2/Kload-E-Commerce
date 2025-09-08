const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testProducts = [
  {
    id: 'premium-wireless-headphones',
    sanityId: 'premium-wireless-headphones',
    name: 'Premium Wireless Headphones',
    description:
      'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
    price: 431.46,
    originalPrice: 499.99,
    discountPercentage: 14,
    images: JSON.stringify([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIEhlYWRwaG9uZXMgYm9keSAtLT4KPHJlY3QgeD0iNDAiIHk9IjgwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiMyMDIwMjAiLz4KPGNpcmNsZSBjeD0iNjAiIGN5PSIxMjAiIHI9IjE1IiBmaWxsPSIjMjAyMDIwIi8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEyMCIgcj0iMTUiIGZpbGw9IiMyMDIwMjAiLz4KPCEtLSBTUE9OWSBsb2dvIC0tPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjRkZENzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TT05ZPC90ZXh0Pgo8IS0tIEFjY2VudCBjaXJjbGUgLS0+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEyMCIgcj0iOCIgZmlsbD0iIiNGRkQ3MDAiLz4KPC9zdmc+',
    ]),
    category: 'Electronics',
    tags: 'headphones,wireless,premium,audio',
    inStock: true,
    stockCount: 50,
    rating: 4.5,
  },
  {
    id: 'smart-watch-pro',
    sanityId: 'smart-watch-pro',
    name: 'Smart Watch Pro',
    description:
      'Advanced smartwatch with health monitoring, GPS tracking, and smartphone connectivity. Features include heart rate monitoring, sleep tracking, and fitness metrics.',
    price: 299.99,
    originalPrice: 399.99,
    discountPercentage: 25,
    images: JSON.stringify([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI2MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4MCIgcng9IjEwIiBmaWxsPSIjMzM3OUY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
    ]),
    category: 'Electronics',
    tags: 'smartwatch,health,fitness,wearable',
    inStock: true,
    stockCount: 30,
    rating: 4.2,
  },
  {
    id: 'wireless-earbuds',
    sanityId: 'wireless-earbuds',
    name: 'Wireless Earbuds',
    description:
      'True wireless earbuds with active noise cancellation, long battery life, and premium sound quality. Perfect for workouts and daily use.',
    price: 149.99,
    originalPrice: 199.99,
    discountPercentage: 25,
    images: JSON.stringify([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iIzMzNzlGNiIvPgo8Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMDAiIHI9IjIwIiBmaWxsPSIjMzM3OUY2Ii8+Cjwvc3ZnPg==',
    ]),
    category: 'Electronics',
    tags: 'earbuds,wireless,audio,bluetooth',
    inStock: true,
    stockCount: 75,
    rating: 4.0,
  },
  {
    id: 'laptop-stand',
    sanityId: 'laptop-stand',
    name: 'Adjustable Laptop Stand',
    description:
      'Ergonomic laptop stand with adjustable height and angle. Improves posture and reduces neck strain during long work sessions.',
    price: 79.99,
    originalPrice: 99.99,
    discountPercentage: 20,
    images: JSON.stringify([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjQwIiB5PSIxMjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTUiIHJ4PSI1IiBmaWxsPSIjMzM3OUY2Ii8+CjxyZWN0IHg9IjYwIiB5PSI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iIzMzNzlGNiIvPgo8L3N2Zz4=',
    ]),
    category: 'Accessories',
    tags: 'laptop,stand,ergonomic,desk',
    inStock: true,
    stockCount: 100,
    rating: 4.3,
  },
  {
    id: 'mechanical-keyboard',
    sanityId: 'mechanical-keyboard',
    name: 'Mechanical Gaming Keyboard',
    description:
      'High-performance mechanical keyboard with RGB backlighting, programmable keys, and premium switches. Perfect for gaming and productivity.',
    price: 129.99,
    originalPrice: 159.99,
    discountPercentage: 19,
    images: JSON.stringify([
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSI4MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI0MCIgcng9IjUiIGZpbGw9IiMzMzc5RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzMzNzlGNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5bC01LjUgNS4zOSAxLjMgNy42MUwxMiAxOC43NCA2LjIgMjEuOTlsMS4zLTcuNjFMMiA5bDYuOTEtLjc0TDEyIDJ6Ii8+Cjwvc3ZnPgo8L3N2Zz4=',
    ]),
    category: 'Electronics',
    tags: 'keyboard,mechanical,gaming,rgb',
    inStock: true,
    stockCount: 45,
    rating: 4.7,
  },
];

async function seedProducts() {
  try {
    console.log('🌱 Seeding products...');

    for (const product of testProducts) {
      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });

      if (existingProduct) {
        // Update existing product
        const updatedProduct = await prisma.product.update({
          where: { id: product.id },
          data: product,
        });
        console.log(
          `✅ Updated product: ${updatedProduct.name} (ID: ${updatedProduct.id})`
        );
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: product,
        });
        console.log(
          `✅ Created product: ${newProduct.name} (ID: ${newProduct.id})`
        );
      }
    }

    console.log('🎉 Product seeding completed!');

    // Display all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        rating: true,
        inStock: true,
        stockCount: true,
      },
    });

    console.log('\n📋 Current products in database:');
    allProducts.forEach((product) => {
      console.log(
        `- ${product.name}: $${product.price} (Rating: ${product.rating}, Stock: ${product.stockCount}, In Stock: ${product.inStock})`
      );
    });
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
