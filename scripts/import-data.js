const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL
    }
  }
});

async function importData() {
  try {
    console.log('🔄 Importing data to production database...');
    
    // Read exported data
    const exportData = JSON.parse(fs.readFileSync('data-export.json', 'utf8'));
    
    console.log(`📊 Found data to import:`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Products: ${exportData.products.length}`);
    console.log(`   - Orders: ${exportData.orders.length}`);
    console.log(`   - Order Items: ${exportData.orderItems.length}`);
    console.log(`   - Site Content: ${exportData.siteContent.length}`);
    console.log(`   - Categories: ${exportData.categories.length}`);
    
    // Import in correct order (respecting foreign key constraints)
    
    // 1. Import Users first
    if (exportData.users.length > 0) {
      console.log('👥 Importing users...');
      for (const user of exportData.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
    }
    
    // 2. Import Categories
    if (exportData.categories.length > 0) {
      console.log('📂 Importing categories...');
      for (const category of exportData.categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: category,
          create: category
        });
      }
    }
    
    // 3. Import Products
    if (exportData.products.length > 0) {
      console.log('🛍️ Importing products...');
      for (const product of exportData.products) {
        await prisma.product.upsert({
          where: { id: product.id },
          update: product,
          create: product
        });
      }
    }
    
    // 4. Import Orders
    if (exportData.orders.length > 0) {
      console.log('📦 Importing orders...');
      for (const order of exportData.orders) {
        await prisma.order.upsert({
          where: { id: order.id },
          update: order,
          create: order
        });
      }
    }
    
    // 5. Import Order Items
    if (exportData.orderItems.length > 0) {
      console.log('📋 Importing order items...');
      for (const orderItem of exportData.orderItems) {
        await prisma.orderItem.upsert({
          where: { id: orderItem.id },
          update: orderItem,
          create: orderItem
        });
      }
    }
    
    // 6. Import Site Content
    if (exportData.siteContent.length > 0) {
      console.log('🎨 Importing site content...');
      for (const content of exportData.siteContent) {
        await prisma.siteContent.upsert({
          where: { id: content.id },
          update: content,
          create: content
        });
      }
    }
    
    console.log('✅ Data imported successfully!');
    console.log('🚀 Your production database now has all your local data!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
