import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking environment variables...');
    
    // Check if environment variables are available
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      POSTGRES_URL: process.env.POSTGRES_URL ? '✅ Set' : '❌ Missing',
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    };
    
    console.log('Environment variables:', envCheck);
    
    // Try to import Prisma
    let prismaStatus = '❌ Failed to import';
    try {
      const { PrismaClient } = await import('@prisma/client');
      prismaStatus = '✅ Imported successfully';
      
      // Try to create Prisma client
      const prisma = new PrismaClient();
      prismaStatus += ' | ✅ Client created';
      
      // Try to connect
      await prisma.$connect();
      prismaStatus += ' | ✅ Connected to database';
      
      // Try a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      prismaStatus += ' | ✅ Query successful';
      
      await prisma.$disconnect();
      
    } catch (prismaError) {
      prismaStatus += ` | ❌ Error: ${prismaError instanceof Error ? prismaError.message : String(prismaError)}`;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      prisma: prismaStatus,
      message: 'Debug information collected'
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
