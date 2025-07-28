import { NextResponse } from 'next/server';
import { ClubRequestsStorage } from '@/lib/club-requests-storage';

// 📋 ПУБЛІЧНИЙ ENDPOINT для адмін панелі - показує запити без авторизації
// Використовується AdminRoleRequestsTab для отримання списку запитів

export async function GET(request: Request) {
  try {
    console.log('📋 Admin requests endpoint: завантаження даних для адмін панелі');

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    // Отримуємо дані з MySQL ClubRequestsStorage
    const allRequests = await ClubRequestsStorage.getAll();
    let filteredRequests = allRequests;

    if (status && status !== 'all') {
      filteredRequests = allRequests.filter(req => req.status === status);
    }

    const stats = await ClubRequestsStorage.getStats();

    console.log('📋 Admin endpoint запити:', {
      total: allRequests.length,
      filtered: filteredRequests.length,
      status,
      storageType: 'MYSQL_STORAGE'
    });

    // Повертаємо дані в тому ж форматі що й основний API
    return NextResponse.json({
      requests: filteredRequests.sort((a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
      total: filteredRequests.length,
      stats: stats,
      debug: {
        globalTotal: allRequests.length,
        storageType: 'MYSQL_STORAGE',
        lastUpdate: new Date().toISOString(),
        note: 'Публічний endpoint для адмін панелі з MySQL',
        endpoint: '/api/admin-requests'
      }
    });

  } catch (error) {
    console.error('❌ Помилка admin requests endpoint:', error);
    return NextResponse.json(
      {
        error: 'Помилка завантаження запитів',
        details: error instanceof Error ? error.message : 'Невідома помилка',
        storageType: 'MYSQL_STORAGE'
      },
      { status: 500 }
    );
  }
}
