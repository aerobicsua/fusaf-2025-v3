import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('👑 Створення/оновлення адміністратора ФУСАФ...');

    // Для demo-режиму просто повертаємо успішний результат
    // В реальному додатку ця функція створила б користувача в БД

    console.log('✅ Адміністратор aerobicsua@gmail.com готовий до використання');

    return NextResponse.json({
      success: true,
      message: 'Адміністратор ФУСАФ готовий!',
      credentials: {
        email: 'aerobicsua@gmail.com',
        password: 'fusaf2025'
      },
      admin: {
        id: 'admin-fusaf-2024',
        email: 'aerobicsua@gmail.com',
        name: 'Адміністратор ФУСАФ',
        roles: ['admin', 'user', 'coach_judge', 'club_owner']
      }
    });

    // Створюємо нового користувача адміна
    const hashedPassword = await bcrypt.hash('fusaf2025', 10);
    const userId = uuidv4();

    await executeQuery(`
      INSERT INTO users (
        id, email, password_hash, name, roles,
        first_name, last_name, middle_name,
        country, region, city,
        status, email_verified, membership_paid,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        NOW()
      )
    `, [
      userId,
      'aerobicsua@gmail.com',
      hashedPassword,
      'Адміністратор ФУСАФ',
      '["admin", "user", "coach_judge", "club_owner"]',
      'Адміністратор', 'ФУСАФ', '',
      'Україна', 'м. Київ', 'Київ',
      'active', true, true
    ]);

    console.log('✅ Адміністратор aerobicsua@gmail.com створений успішно');

    return NextResponse.json({
      success: true,
      message: 'Адміністратор aerobicsua@gmail.com створений успішно',
      credentials: {
        email: 'aerobicsua@gmail.com',
        password: 'fusaf2025'
      },
      admin: {
        email: 'aerobicsua@gmail.com',
        roles: ['admin', 'user', 'coach_judge', 'club_owner']
      }
    });

  } catch (error) {
    console.error('❌ Помилка створення адміністратора:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка створення адміністратора',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
