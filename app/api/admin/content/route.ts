import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isAdminUser } from '@/lib/admin';

// GET - Fetch all site content
export async function GET() {
  try {
    const { userId } = await auth();

    // TEMPORARY: Bypass authentication for development
    // TODO: Re-enable authentication when Clerk is properly set up
    /*
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user || !isAdminUser(user.email)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        */

    const content = await prisma.siteContent.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update site content
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log('Content API - User ID:', userId);

    // TEMPORARY: Bypass authentication for development
    // TODO: Re-enable authentication when Clerk is properly set up
    /*
        if (!userId) {
            console.log('Content API - No user ID found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        console.log(
            'Content API - User found:',
            user ? { id: user.id, email: user.email } : 'Not found'
        );

        if (!user || !isAdminUser(user.email)) {
            console.log('Content API - User not admin:', {
                userExists: !!user,
                email: user?.email,
                isAdmin: user ? isAdminUser(user.email) : false,
            });
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }
        */

    const body = await request.json();
    console.log('Content API - Request body:', body);

    const {
      section,
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      heroImage,
      backgroundColor,
      removeBackground,
      aggressiveRemoval,
    } = body;

    if (!section) {
      console.log('Content API - Missing section');
      return NextResponse.json(
        { error: 'Section is required' },
        { status: 400 }
      );
    }

    console.log('Content API - Attempting database upsert...');

    // Upsert content (create if doesn't exist, update if it does)
    const content = await prisma.siteContent.upsert({
      where: { section },
      update: {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        heroImage,
        backgroundColor,
        removeBackground,
        aggressiveRemoval,
        updatedAt: new Date(),
      },
      create: {
        section,
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        heroImage,
        backgroundColor,
        removeBackground,
        aggressiveRemoval,
      },
    });

    console.log('Content API - Database upsert successful:', {
      id: content.id,
      section: content.section,
    });

    return NextResponse.json({
      message: 'Content updated successfully',
      content,
    });
  } catch (error) {
    console.error('Error updating site content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete site content
export async function DELETE(request: NextRequest) {
  try {
    // TEMPORARY: Bypass authentication for development
    // TODO: Re-enable authentication when Clerk is properly set up
    /*
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user || !isAdminUser(user.email)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        */

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter is required' },
        { status: 400 }
      );
    }

    await prisma.siteContent.delete({
      where: { section },
    });

    return NextResponse.json({
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting site content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
