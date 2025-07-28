import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Видалення демо користувача afedos@ukr.net');

    // Видаляємо користувача з email afedos@ukr.net
    const result = await executeQuery(`
      DELETE FROM users
      WHERE email = 'afedos@ukr.net'
    `);

    console.log('✅ Демо користувач afedos@ukr.net видалений з БД');

    return NextResponse.json({
      success: true,
      message: 'Демо користувач afedos@ukr.net успішно видалений',
      deletedRows: (result as any)?.affectedRows || 0
    });

  } catch (error) {
    console.error('❌ Помилка видалення демо користувача:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення демо користувача'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API для видалення демо користувача afedos@ukr.net. Використовуйте POST запит.'
  });
}
