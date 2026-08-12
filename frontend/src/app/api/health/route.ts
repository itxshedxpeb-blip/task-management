import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    frontend: true,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}
