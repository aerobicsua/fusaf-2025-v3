import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API працює',
    timestamp: new Date().toISOString(),
    test: 'success'
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({
      message: 'POST запит обробено',
      receivedData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Помилка обробки POST',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
