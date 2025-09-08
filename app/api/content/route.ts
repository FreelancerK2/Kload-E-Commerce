import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all site content (public endpoint, no auth required)
export async function GET() {
  try {
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
