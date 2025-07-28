import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { supabase } from '@/lib/supabase';
import { validateIndividualRegistration, generateRegistrationNumber } from '@/lib/competition-types';
import { EmailService } from '@/lib/email';

// POST /api/competitions/[id]/individual-registration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const { id: competitionId } = await params;
    const registrationData = await request.json();

    // Валідація даних реєстрації
    const validationErrors = validateIndividualRegistration(registrationData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Помилки валідації', details: validationErrors },
        { status: 400 }
      );
    }

    // Перевіряємо чи існує змагання та чи відкрита реєстрація
    const { data: competition, error: competitionError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (competitionError || !competition) {
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

    // Перевіряємо ліміт учасників
    if (competition.max_participants) {
      const { count: currentParticipants } = await supabase
        .from('individual_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', competitionId)
        .in('status', ['pending', 'confirmed']);

      if (currentParticipants && currentParticipants >= competition.max_participants) {
        return NextResponse.json(
          { error: 'Досягнуто максимальну кількість учасників' },
          { status: 400 }
        );
      }
    }

    // Перевіряємо чи не зареєстрований вже цей учасник
    const { data: existingRegistration } = await supabase
      .from('individual_registrations')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('participant->full_name', registrationData.participant.full_name)
      .eq('participant->date_of_birth', registrationData.participant.date_of_birth)
      .neq('status', 'cancelled')
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Цей учасник вже зареєстрований на змагання' },
        { status: 400 }
      );
    }

    // Розраховуємо вартість реєстрації
    const registrationFee = competition.registration_fee + (competition.entry_fee || 0);

    // Генеруємо реєстраційний номер
    const { count: registrationCount } = await supabase
      .from('individual_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId);

    const registrationNumber = generateRegistrationNumber(
      competitionId,
      'individual',
      (registrationCount || 0) + 1
    );

    // Створюємо основну реєстрацію
    const individualRegistration = {
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
      created_by: session?.user?.id || 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: registration, error } = await supabase
      .from('individual_registrations')
      .insert([individualRegistration])
      .select()
      .single();

    if (error) {
      console.error('Error creating individual registration:', error);
      return NextResponse.json(
        { error: 'Помилка при створенні іменної реєстрації' },
        { status: 500 }
      );
    }

    // Відправляємо email підтвердження
    try {
      await EmailService.sendRegistrationConfirmation(
        registrationData.participant.email || session?.user?.email || '',
        {
          participantName: registrationData.participant.full_name,
          competitionTitle: competition.title,
          competitionDate: new Date(competition.date).toLocaleDateString('uk-UA'),
          competitionTime: competition.time,
          location: competition.location,
          address: competition.address,
          category: registrationData.program_details.category,
          ageGroup: registrationData.program_details.age_group,
          contactPerson: `${competition.organizer_name} (${competition.organizer_phone})`,
          competitionUrl: `${process.env.APP_URL}/competitions/${competitionId}`,
          dashboardUrl: `${process.env.APP_URL}/dashboard`
        }
      );
    } catch (emailError) {
      console.error('Failed to send registration confirmation email:', emailError);
      // Не перериваємо процес через помилку email
    }

    return NextResponse.json({
      success: true,
      message: 'Реєстрацію успішно створено',
      registration,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: competitionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('individual_registrations')
      .select(`
        *,
        competition:competitions(title, date, location, time),
        preliminary_registration:preliminary_registrations(club_name)
      `)
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error('Error fetching individual registrations:', error);
      return NextResponse.json(
        { error: 'Помилка при отриманні реєстрацій' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registrations: registrations || []
    });

  } catch (error) {
    console.error('Get individual registrations error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
