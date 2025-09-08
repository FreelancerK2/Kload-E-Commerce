const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupFlashDeals() {
  try {
    console.log('🔥 Setting up flash deals...');

    // Get all products
    const allProducts = await prisma.product.findMany();
    console.log(`Found ${allProducts.length} products in database`);

    if (allProducts.length === 0) {
      console.log('❌ No products found. Please run seed-products.js first.');
      return;
    }

    // Set the first 10 products as flash deals
    const productsToUpdate = allProducts.slice(0, 10);

    for (const product of productsToUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: { isFlashDeal: true },
      });
      console.log(`✅ Set ${product.name} as flash deal`);
    }

    // Also set some products as featured, new arrivals, trending, and top rated for variety
    if (allProducts.length >= 4) {
      await prisma.product.update({
        where: { id: allProducts[0].id },
        data: { isFeatured: true },
      });
      console.log(`✅ Set ${allProducts[0].name} as featured`);

      await prisma.product.update({
        where: { id: allProducts[1].id },
        data: { isNewArrival: true },
      });
      console.log(`✅ Set ${allProducts[1].name} as new arrival`);

      await prisma.product.update({
        where: { id: allProducts[2].id },
        data: { isTrending: true },
      });
      console.log(`✅ Set ${allProducts[2].name} as trending`);

      await prisma.product.update({
        where: { id: allProducts[3].id },
        data: { isTopRated: true },
      });
      console.log(`✅ Set ${allProducts[3].name} as top rated`);
    }

    // Display flash deal products
    const flashDealProducts = await prisma.product.findMany({
      where: { isFlashDeal: true },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        isFlashDeal: true,
      },
    });

    console.log('\n🔥 Flash Deal Products:');
    flashDealProducts.forEach((product) => {
      const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          )
        : 0;
      console.log(
        `- ${product.name}: $${product.price} ${discount > 0 ? `(${discount}% OFF)` : ''}`
      );
    });

    console.log(
      `\n🎉 Setup completed! ${flashDealProducts.length} products are now flash deals.`
    );
    console.log(
      '💡 You can now test the 5-column, 2-row layout on your website.'
    );
  } catch (error) {
    console.error('❌ Error setting up flash deals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFlashDeals();
