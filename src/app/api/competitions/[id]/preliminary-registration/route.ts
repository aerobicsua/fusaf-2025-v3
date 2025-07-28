import { NextRequest, NextResponse } from 'next/server';
import { validatePreliminaryRegistration, calculateRegistrationFee } from '@/lib/competition-types';

// Демонстраційні дані змагань
const demoCompetitions = {
  'comp-1': {
    id: 'comp-1',
    title: 'Кубок України зі спортивної аеробіки 2025',
    date: '2025-04-15',
    status: 'registration_open',
    registration_deadline: '2025-04-01',
    registration_fee: 300,
    entry_fee: 200
  },
  'comp-2': {
    id: 'comp-2',
    title: 'Чемпіонат Львівської області',
    date: '2025-03-20',
    status: 'registration_open',
    registration_deadline: '2025-03-10',
    registration_fee: 250,
    entry_fee: 150
  },
  'comp-3': {
    id: 'comp-3',
    title: 'Першість Дніпропетровської області',
    date: '2025-05-10',
    status: 'published',
    registration_deadline: '2025-04-25',
    registration_fee: 200,
    entry_fee: 100
  }
};

// POST /api/competitions/[id]/preliminary-registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Demo: Preliminary registration request received');

    const competitionId = params.id;
    const registrationData = await request.json();

    console.log('Registration data:', {
      competitionId,
      club_name: registrationData.club_name,
      participants_count: registrationData.participants_count?.length
    });

    // Валідація даних реєстрації
    const validationErrors = validatePreliminaryRegistration(registrationData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Помилки валідації', details: validationErrors },
        { status: 400 }
      );
    }

    // Перевіряємо чи існує змагання
    const competition = demoCompetitions[competitionId as keyof typeof demoCompetitions];

    if (!competition) {
      return NextResponse.json(
        { error: 'Змагання не знайдено' },
        { status: 404 }
      );
    }

    if (competition.status !== 'registration_open') {
      return NextResponse.json(
        { error: 'Реєстрація на це змагання закрита' },
        { status: 400 }
      );
    }

    // Перевіряємо дедлайн реєстрації
    if (new Date() > new Date(competition.registration_deadline)) {
      return NextResponse.json(
        { error: 'Термін реєстрації минув' },
        { status: 400 }
      );
    }

    // Розраховуємо загальну кількість учасників та вартість
    const totalParticipants = registrationData.participants_count.reduce(
      (sum: number, category: any) => sum + category.total_count, 0
    );

    const estimatedFee = calculateRegistrationFee(
      registrationData.participants_count,
      competition.registration_fee,
      competition.entry_fee
    );

    // Створюємо демонстраційну попередню реєстрацію
    const preliminaryRegistration = {
      id: `prelim-${Date.now()}`,
      registration_number: `PR-${competitionId.toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      competition_id: competitionId,
      club_name: registrationData.club_name,
      organization_name: registrationData.organization_name,
      contact_person: registrationData.contact_person,
      participants_count: registrationData.participants_count,
      total_participants: totalParticipants,
      estimated_fee: estimatedFee,
      notes: registrationData.notes,
      registration_date: new Date().toISOString(),
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Demo preliminary registration created:', {
      id: preliminaryRegistration.id,
      registration_number: preliminaryRegistration.registration_number,
      total_participants: totalParticipants,
      estimated_fee: estimatedFee
    });

    // Симуляція відправки email
    console.log(`📧 Demo email sent to: ${registrationData.contact_person.email}`);
    console.log(`📧 Email subject: Підтвердження попередньої реєстрації на ${competition.title}`);

    return NextResponse.json({
      success: true,
      message: '✅ Попередна реєстрація створена успішно (демонстраційний режим)',
      registration: preliminaryRegistration,
      estimatedFee,
      totalParticipants,
      demo: true,
      competition: {
        title: competition.title,
        date: competition.date
      }
    });

  } catch (error) {
    console.error('Demo preliminary registration error:', error);
    return NextResponse.json(
      { error: 'Помилка демонстраційного сервера', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/competitions/[id]/preliminary-registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = params.id;

    // Демонстраційні дані реєстрацій
    const demoRegistrations = [
      {
        id: 'prelim-1',
        registration_number: 'PR-COMP1-001',
        competition_id: competitionId,
        club_name: 'СК "Грація"',
        contact_person: {
          full_name: 'Мельник Сергій Олександрович',
          phone: '+380671234567',
          email: 'sergiy.melnik@gracia.kiev.ua'
        },
        total_participants: 15,
        estimated_fee: 4500,
        status: 'confirmed',
        created_at: '2024-12-01T10:00:00Z'
      },
      {
        id: 'prelim-2',
        registration_number: 'PR-COMP1-002',
        competition_id: competitionId,
        club_name: 'Аеробіка Львів',
        contact_person: {
          full_name: 'Савченко Тетяна Миколаївна',
          phone: '+380672345678',
          email: 'tetyana@aerobika-lviv.ua'
        },
        total_participants: 8,
        estimated_fee: 2400,
        status: 'pending',
        created_at: '2024-12-02T14:30:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      registrations: demoRegistrations,
      count: demoRegistrations.length,
      message: '🎯 Демонстраційні дані попередніх реєстрацій'
    });

  } catch (error) {
    console.error('Get preliminary registrations error:', error);
    return NextResponse.json(
      { error: 'Помилка демонстраційного сервера' },
      { status: 500 }
    );
  }
}
