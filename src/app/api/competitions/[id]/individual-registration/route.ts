import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateIndividualRegistration, generateRegistrationNumber } from '@/lib/competition-types';

// Демонстраційні дані змагань
const demoCompetitions = {
  'comp-1': {
    id: 'comp-1',
    title: 'Кубок України зі спортивної аеробіки 2025',
    date: '2025-04-15',
    time: '10:00',
    location: 'Палац спорту "Україна"',
    address: 'вул. Велика Васильківська, 55, Київ, 03150',
    status: 'registration_open',
    registration_deadline: '2025-04-01',
    registration_fee: 300,
    entry_fee: 200,
    max_participants: 200,
    organizer_name: 'ФУСАФ',
    organizer_phone: '+380442345678'
  }
};

// POST /api/competitions/[id]/individual-registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const competitionId = params.id;
    const registrationData = await request.json();

    // Валідація даних реєстрації
    const validationErrors = validateIndividualRegistration(registrationData);
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

    // Розраховуємо вартість реєстрації
    const registrationFee = competition.registration_fee + (competition.entry_fee || 0);

    // Генеруємо реєстраційний номер
    const registrationNumber = generateRegistrationNumber(
      competitionId,
      'individual',
      Math.floor(Math.random() * 100) + 1
    );

    // Створюємо демонстраційну реєстрацію
    const individualRegistration = {
      id: `indiv-${Date.now()}`,
      competition_id: competitionId,
      preliminary_registration_id: registrationData.preliminary_registration_id,
      participant: registrationData.participant,
      program_details: registrationData.program_details,
      coach_info: registrationData.coach_info,
      club_info: registrationData.club_info,
      medical_clearance: registrationData.medical_clearance,
      insurance_info: registrationData.insurance_info,
      emergency_contact: registrationData.emergency_contact,
      registration_fee: registrationFee,
      payment_status: 'pending',
      registration_date: new Date().toISOString(),
      registration_number: registrationNumber,
      status: 'pending',
      notes: registrationData.notes,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Demo individual registration created:', individualRegistration);

    // Симуляція відправки email
    console.log(`📧 Demo email sent to: ${registrationData.participant.email || session.user?.email}`);
    console.log(`Email content: Підтвердження реєстрації ${registrationData.participant.full_name} на ${competition.title}`);

    return NextResponse.json({
      success: true,
      message: '✅ Реєстрацію успішно створено (демонстраційний режим)',
      registration: individualRegistration,
      registrationNumber,
      registrationFee
    });

  } catch (error) {
    console.error('Individual registration error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}

// GET /api/competitions/[id]/individual-registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    // Демонстраційні дані реєстрацій
    const demoRegistrations = [
      {
        id: 'indiv-1',
        competition_id: competitionId,
        participant: {
          full_name: 'Петренко Оксана Вікторівна',
          age_group: 'SENIORS'
        },
        program_details: {
          program_type: 'individual_woman',
          category: 'master_sport'
        },
        registration_number: 'IN-COMP1-001',
        status: 'confirmed',
        payment_status: 'paid',
        created_at: '2024-12-01T10:00:00Z'
      },
      {
        id: 'indiv-2',
        competition_id: competitionId,
        participant: {
          full_name: 'Коваленко Андрій Сергійович',
          age_group: 'JUNIORS'
        },
        program_details: {
          program_type: 'individual_men',
          category: 'adult_1'
        },
        registration_number: 'IN-COMP1-002',
        status: 'pending',
        payment_status: 'pending',
        created_at: '2024-12-02T14:30:00Z'
      }
    ];

    let registrations = demoRegistrations;

    if (userId) {
      registrations = registrations.filter(reg => reg.id.includes(userId));
    }

    return NextResponse.json({
      success: true,
      registrations,
      message: '🎯 Демонстраційні дані індивідуальних реєстрацій'
    });

  } catch (error) {
    console.error('Get individual registrations error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
