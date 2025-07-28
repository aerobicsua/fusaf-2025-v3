import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Перевірка користувача andfedos@gmail.com...');

    // Знаходимо користувача
    const users = await executeQuery(`
      SELECT id, email, name, roles, status, password_hash, created_at
      FROM users
      WHERE email = ?
    `, ['andfedos@gmail.com']);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Користувач andfedos@gmail.com не знайдений',
        found: false
      });
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      message: 'Користувач знайдений',
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        status: user.status,
        created_at: user.created_at,
        hasPassword: !!user.password_hash
      }
    });

  } catch (error) {
    console.error('❌ Помилка перевірки користувача:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка перевірки користувача',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Оновлення пароля для andfedos@gmail.com...');

    // Створюємо новий хеш пароля
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновлюємо пароль користувача
    await executeQuery(`
      UPDATE users
      SET password_hash = ?, status = 'active', email_verified = TRUE
      WHERE email = ?
    `, [hashedPassword, 'andfedos@gmail.com']);

    console.log('✅ Пароль оновлено успішно');

    return NextResponse.json({
      success: true,
      message: 'Пароль для andfedos@gmail.com оновлено успішно',
      newPassword: newPassword
    });

  } catch (error) {
    console.error('❌ Помилка оновлення пароля:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення пароля',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
