import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    console.log('📋 GET /api/clubs/list - завантаження списку клубів...');

    // Отримуємо всі активні клуби з MySQL
    const clubs = await executeQuery(`
      SELECT name, id FROM clubs
      WHERE status = 'active'
      ORDER BY name ASC
    `);

    const clubNames = clubs.map((club: any) => club.name);

    console.log(`✅ Завантажено ${clubNames.length} клубів`);

    return NextResponse.json({
      success: true,
      clubs: clubNames,
      total: clubNames.length
    });

  } catch (error) {
    console.error('❌ Помилка завантаження списку клубів:', error);

    // Fallback список клубів
    const fallbackClubs = [
      "Спортивний клуб 'Орігамі'",
      "СК 'Динамо' Київ",
      "СК 'Шахтар' Донецьк",
      "СК 'Дніпро'",
      "СК 'Львів'",
      "СК 'Зоря' Луганськ",
      "СК 'Десна' Чернігів",
      "СК 'Колос' Ковалівка",
      "СК 'Маріуполь'",
      "СК 'Олександрія'"
    ];

    return NextResponse.json({
      success: true,
      clubs: fallbackClubs,
      total: fallbackClubs.length,
      fallback: true
    });
  }
}
