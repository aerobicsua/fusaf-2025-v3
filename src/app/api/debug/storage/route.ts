import { NextResponse } from 'next/server';
import { ClubRequestsStorage } from '@/lib/club-requests-storage';

export async function GET() {
  try {
    const requests = await ClubRequestsStorage.getAll();
    const stats = await ClubRequestsStorage.getStats();

    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      storage: {
        total: requests.length,
        requests: requests.map((r: any) => ({
          id: r.id,
          clubName: r.club.name,
          userEmail: r.user.email,
          status: r.status,
          submittedAt: r.submittedAt
        })),
        stats: stats
      },
      message: 'Debug info для ClubRequestsStorage'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Помилка отримання debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
