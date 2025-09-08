const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedHeroContent() {
  try {
    console.log('🌱 Seeding hero content...');

    const heroContent = await prisma.siteContent.upsert({
      where: { section: 'hero' },
      update: {},
      create: {
        section: 'hero',
        title: 'Your One-Stop Electronic Market',
        subtitle: 'Electronic Market',
        description:
          'Welcome to e-shop, a place where you can buy everything about electronics. Sale every day!',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        backgroundColor: '#ffffff',
        removeBackground: false,
        aggressiveRemoval: false,
        isActive: true,
      },
    });

    console.log('✅ Hero content seeded successfully:', heroContent);
  } catch (error) {
    console.error('❌ Error seeding hero content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHeroContent();
