import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('👨‍🏫 GET /api/coaches/list - завантаження списку тренерів...');

    // Поки що тренери не мігровані в MySQL, повертаємо пустий список
    // TODO: В майбутньому додати реальних тренерів з MySQL
    const coaches: string[] = [];

    console.log(`✅ Повернуто ${coaches.length} тренерів (пустий список - демо прибрано)`);

    return NextResponse.json({
      success: true,
      coaches: coaches,
      total: coaches.length,
      message: 'Демо-тренери прибрані. Список порожній.'
    });

  } catch (error) {
    console.error('❌ Помилка завантаження списку тренерів:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження списку тренерів',
      coaches: [],
      total: 0
    }, { status: 500 });
  }
}
