import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    // Читаємо файл з запитами
    const DATA_FILE = join(process.cwd(), 'data', 'role-requests.json');
    let allRequests: any[] = [];

    console.log('🔍 Перевірка статусу для:', session.user.email);
    console.log('📂 Шлях до файлу:', DATA_FILE);
    console.log('📁 Файл існує:', existsSync(DATA_FILE));

    try {
      if (existsSync(DATA_FILE)) {
        const data = readFileSync(DATA_FILE, 'utf8');
        allRequests = JSON.parse(data);
        console.log('📋 Завантажено запитів:', allRequests.length);
        console.log('📝 Всі запити:', allRequests.map(r => ({ email: r.userEmail, role: r.requestedRole, status: r.status })));
      }
    } catch (error) {
      console.error('❌ Помилка читання файлу:', error);
    }

    // Шукаємо активний запит користувача
    const userRequest = allRequests.find(
      req => req.userEmail === session.user.email && req.status === 'pending'
    );

    console.log('🎯 Знайдений запит для користувача:', userRequest || 'Немає');

    return NextResponse.json({
      user: {
        email: session.user.email,
        roles: session.user.roles || [],
        primaryRole: session.user.roles?.[0] || 'athlete'
      },
      hasActiveRequest: !!userRequest,
      roleRequest: userRequest || null,
      allRequestsCount: allRequests.length,
      debug: {
        dataFileExists: existsSync(DATA_FILE),
        totalRequests: allRequests.length,
        userEmail: session.user.email
      }
    });

  } catch (error) {
    console.error('💥 Помилка API user-role-status:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
