const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function manageAdmins() {
  try {
    console.log('🔐 Admin User Management');
    console.log('========================\n');

    // List current admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@kload.com'], // Add more admin emails here
        },
      },
    });

    console.log('📋 Current Admin Users:');
    if (adminUsers.length === 0) {
      console.log('   No admin users found in database');
    } else {
      adminUsers.forEach((user) => {
        console.log(`   ✅ ${user.email} (${user.firstName} ${user.lastName})`);
      });
    }

    console.log('\n📝 To add a new admin user:');
    console.log('   1. Add their email to lib/admin.ts ADMIN_EMAILS array');
    console.log('   2. Create the user in Clerk dashboard');
    console.log('   3. Run this script to add them to the database');
    console.log('\n🔒 Admin emails configured in lib/admin.ts:');
    console.log('   - admin@kload.com');
  } catch (error) {
    console.error('Error managing admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageAdmins();
