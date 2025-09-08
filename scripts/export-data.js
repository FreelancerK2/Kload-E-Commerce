const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting data from local database...');
    
    // Export all tables
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany();
    const orderItems = await prisma.orderItem.findMany();
    const siteContent = await prisma.siteContent.findMany();
    const categories = await prisma.category.findMany();
    
    const exportData = {
      users,
      products,
      orders,
      orderItems,
      siteContent,
      categories,
      exportedAt: new Date().toISOString()
    };
    
    // Write to file
    fs.writeFileSync('data-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Data exported successfully!');
    console.log(`📊 Exported:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log(`   - Site Content: ${siteContent.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`📁 Data saved to: data-export.json`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
