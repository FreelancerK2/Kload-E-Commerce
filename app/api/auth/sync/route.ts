import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk session
    const { sessionClaims } = await auth();

    if (!sessionClaims) {
      return NextResponse.json(
        { error: 'No session data found' },
        { status: 400 }
      );
    }

    // Extract user information from session claims
    const email = sessionClaims.email as string;
    const firstName = sessionClaims.given_name as string;
    const lastName = sessionClaims.family_name as string;
    const imageUrl = sessionClaims.picture as string;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found in session' },
        { status: 400 }
      );
    }

    // First, check if a user with this email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });

    let dbUser;

    if (existingUserByEmail) {
      // User with this email exists, update their clerkId
      dbUser = await prisma.user.update({
        where: { email: email },
        data: {
          clerkId: userId,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          imageUrl: imageUrl || undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      // No user with this email, create new one
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          firstName: firstName || null,
          lastName: lastName || null,
          imageUrl: imageUrl || null,
        },
      });
    }

    return NextResponse.json({
      message: 'User synced successfully',
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        clerkId: dbUser.clerkId,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
