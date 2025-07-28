import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, updates } = await request.json();

    if (!email || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Email та оновлення обов\'язкові'
      }, { status: 400 });
    }

    console.log(`🔄 Оновлення даних користувача: ${email}`);
    console.log(`📝 Оновлення:`, updates);

    // Будуємо динамічний запит
    const updateFields = [];
    const values = [];

    if (updates.date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      values.push(updates.date_of_birth);
    }

    if (updates.gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(updates.gender);
    }

    if (updates.first_name !== undefined) {
      updateFields.push('first_name = ?');
      values.push(updates.first_name);
    }

    if (updates.last_name !== undefined) {
      updateFields.push('last_name = ?');
      values.push(updates.last_name);
    }

    if (updates.middle_name !== undefined) {
      updateFields.push('middle_name = ?');
      values.push(updates.middle_name);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає полів для оновлення'
      }, { status: 400 });
    }

    // Додаємо email для WHERE
    values.push(email);

    // Виконуємо оновлення
    await executeQuery(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE email = ?
    `, values);

    console.log(`✅ Дані користувача ${email} оновлено успішно`);

    return NextResponse.json({
      success: true,
      message: 'Дані користувача оновлено',
      updatedFields: Object.keys(updates)
    });

  } catch (error) {
    console.error('❌ Помилка оновлення користувача:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення даних користувача',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
