import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Початок додавання демо змагань в MySQL...');

    // Демо змагання для додавання в БД
    const demoCompetitions = [
      {
        id: uuidv4(),
        title: 'Кубок України зі спортивної аеробіки 2025',
        description: 'Офіційні змагання федерації України зі спортивної аеробіки та фітнесу. Змагання проводяться згідно з міжнародними правилами FIG.',
        date: '2025-04-15',
        time: '10:00:00',
        registration_deadline: '2025-03-15',
        location: 'Палац спорту "Україна"',
        address: 'вул. Велика Васильківська, 55, Київ, 03150',
        city: 'Київ',
        region: 'м. Київ',
        organizing_club: 'СК "Грація"',
        organizer_id: '1', // admin user
        contact_person: JSON.stringify({
          name: 'Іваненко Марія Петрівна',
          phone: '+380 67 123 45 67',
          email: 'competitions@fusaf.org.ua'
        }),
        program_fees: JSON.stringify({
          individual: 200,
          pairs: 300,
          group: 500
        }),
        max_participants_by_program: JSON.stringify({
          individual: 100,
          pairs: 50,
          group: 20
        }),
        categories: JSON.stringify([
          'YOUTH / 12-14 YEARS',
          'JUNIORS / 15-17 YEARS',
          'SENIORS 18+ YEARS',
          'ND (за потребою)',
          'NDmini (за потребою)'
        ]),
        rules: 'Змагання проводяться згідно з правилами FIG та ФУСАФ. Вік учасників визначається на 31 грудня 2025 року.',
        status: 'registration_open'
      },
      {
        id: uuidv4(),
        title: 'Чемпіонат Львівської області',
        description: 'Регіональний чемпіонат з різних категорій та вікових груп.',
        date: '2025-03-20',
        time: '09:30:00',
        registration_deadline: '2025-02-28',
        location: 'Спорткомплекс "Арена Львів"',
        address: 'вул. Стрийська, 199, Львів',
        city: 'Львів',
        region: 'Львівська область',
        organizing_club: 'Аеробіка Львів',
        organizer_id: '1',
        contact_person: JSON.stringify({
          name: 'Коваленко Андрій Васильович',
          phone: '+380 32 123 45 67',
          email: 'lviv@fusaf.org.ua'
        }),
        program_fees: JSON.stringify({
          individual: 150,
          pairs: 250,
          group: 400
        }),
        max_participants_by_program: JSON.stringify({
          individual: 80,
          pairs: 40,
          group: 15
        }),
        categories: JSON.stringify([
          'YOUTH / 12-14 YEARS',
          'JUNIORS / 15-17 YEARS',
          'SENIORS 18+ YEARS'
        ]),
        rules: 'Регіональний чемпіонат для спортсменів Львівської області.',
        status: 'registration_open'
      },
      {
        id: uuidv4(),
        title: 'Першість Дніпропетровської області',
        description: 'Відкрита першість для всіх вікових груп та категорій.',
        date: '2025-05-10',
        time: '11:00:00',
        registration_deadline: '2025-04-25',
        location: 'ПК "Метеор"',
        address: 'пр. Гагаріна, 99, Дніпро',
        city: 'Дніпро',
        region: 'Дніпропетровська область',
        organizing_club: 'Фітнес-Динаміка',
        organizer_id: '1',
        contact_person: JSON.stringify({
          name: 'Петренко Світлана Олександрівна',
          phone: '+380 56 789 01 23',
          email: 'dnipro@fusaf.org.ua'
        }),
        program_fees: JSON.stringify({
          individual: 100,
          pairs: 200,
          group: 300
        }),
        max_participants_by_program: JSON.stringify({
          individual: 60,
          pairs: 30,
          group: 10
        }),
        categories: JSON.stringify([
          'YOUTH / 12-14 YEARS',
          'JUNIORS / 15-17 YEARS',
          'SENIORS 18+ YEARS',
          'ND',
          'NDmini'
        ]),
        rules: 'Відкрита першість з можливістю участі для всіх клубів України.',
        status: 'published'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    // Додаємо кожне змагання
    for (const competition of demoCompetitions) {
      try {
        await executeQuery(`
          INSERT INTO competitions (
            id, title, description, date, time, registration_deadline,
            location, address, city, region,
            organizing_club, organizer_id,
            contact_person, program_fees, max_participants_by_program,
            categories, rules, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          competition.id,
          competition.title,
          competition.description,
          competition.date,
          competition.time,
          competition.registration_deadline,
          competition.location,
          competition.address,
          competition.city,
          competition.region,
          competition.organizing_club,
          competition.organizer_id,
          competition.contact_person,
          competition.program_fees,
          competition.max_participants_by_program,
          competition.categories,
          competition.rules,
          competition.status
        ]);

        console.log('✅ Додано змагання:', competition.title);
        successCount++;

      } catch (error) {
        console.error('❌ Помилка додавання змагання:', competition.title, error);
        errorCount++;
      }
    }

    // Перевіряємо результат
    const competitions = await executeQuery(`
      SELECT COUNT(*) as count FROM competitions
    `);

    console.log('✅ Додавання демо змагань завершено!');
    console.log(`📊 Успішно: ${successCount}, Помилок: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: '✅ Демо змагання додано в MySQL!',
      statistics: {
        added: successCount,
        errors: errorCount,
        totalInDb: competitions[0]?.count || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Критична помилка додавання змагань:', error);

    return NextResponse.json({
      success: false,
      error: 'Критична помилка додавання змагань',
      details: error instanceof Error ? error.message : 'Невідома помилка',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
