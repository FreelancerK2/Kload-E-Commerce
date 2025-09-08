const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('👤 Creating user in database...');

    // Replace these values with your actual Clerk user ID and email
    const userData = {
      clerkId: 'user_2example123', // Replace with your actual Clerk user ID
      email: 'lensomnang.ls@gmail.com', // Your email
      firstName: 'Lensomnang', // Your first name
      lastName: 'LS', // Your last name
      imageUrl: null,
    };

    console.log('User data:', userData);

    const user = await prisma.user.upsert({
      where: { clerkId: userData.clerkId },
      update: userData,
      create: userData,
    });

    console.log('✅ User created/updated successfully:', {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
