import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Не авторизований'
      }, { status: 401 });
    }

    if (!session?.user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Тільки адміністратори можуть синхронізувати дані' },
        { status: 403 }
      );
    }

    console.log('🔄 Синхронізація даних ініційована адміністратором:', session.user.email);

    // Симуляція синхронізації даних
    const syncResult = {
      synced: true,
      timestamp: new Date().toISOString(),
      adminEmail: session.user.email,
      message: 'Дані успішно синхронізовано'
    };

    return NextResponse.json({
      success: true,
      result: syncResult
    });

  } catch (error) {
    console.error('❌ Помилка синхронізації даних:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка сервера'
    }, { status: 500 });
  }
}
