import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Email та новий пароль обов\'язкові'
      }, { status: 400 });
    }

    console.log(`🔑 Скидання пароля для: ${email}`);

    // Перевіряємо чи користувач існує
    const users = await executeQuery(`
      SELECT id, email, name FROM users WHERE email = ? LIMIT 1
    `, [email]);

    if (users.length === 0) {
      console.log(`❌ Користувач ${email} не знайдений`);
      return NextResponse.json({
        success: false,
        error: 'Користувач не знайдений'
      }, { status: 404 });
    }

    const user = users[0];
    console.log(`✅ Користувач знайдений: ${user.name}`);

    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`🔒 Новий пароль захешовано`);

    // Оновлюємо пароль в базі
    await executeQuery(`
      UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?
    `, [hashedPassword, email]);

    console.log(`✅ Пароль оновлено для: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Пароль успішно скинуто',
      user: {
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Помилка скидання пароля:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка скидання пароля',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
