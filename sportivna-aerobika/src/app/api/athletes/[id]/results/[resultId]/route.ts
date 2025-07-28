import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { AthletesStorage, type CompetitionResult } from '@/lib/athletes-storage';

// GET - отримати конкретний результат
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  try {
    const { id: athleteId, resultId } = await params;

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    const result = athlete.results.find(r => r.id === resultId);
    if (!result) {
      return NextResponse.json(
        { error: 'Результат не знайдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      athleteId,
      result
    });

  } catch (error) {
    console.error('❌ Помилка GET /api/athletes/[id]/results/[resultId]:', error);
    return NextResponse.json(
      { error: 'Помилка завантаження результату' },
      { status: 500 }
    );
  }
}

// PUT - оновити результат змагання
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  try {
    const session = await getApiSession(request);
    const { id: athleteId, resultId } = await params;

    // Перевірка авторизації
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    const isAdmin = session.user?.roles?.includes('admin');
    const isOwnProfile = session.user?.email === athlete.email;
    const canEditResults = isAdmin || isOwnProfile || session.user?.roles?.includes('coach_judge');

    if (!canEditResults) {
      return NextResponse.json(
        { error: 'Недостатньо прав для редагування результатів' },
        { status: 403 }
      );
    }

    const existingResult = athlete.results.find(r => r.id === resultId);
    if (!existingResult) {
      return NextResponse.json(
        { error: 'Результат не знайдено' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates = { ...body };

    // Видаляємо id з оновлень (не можна змінювати)
    delete updates.id;

    const success = AthletesStorage.updateResult(athleteId, resultId, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Помилка оновлення результату' },
        { status: 500 }
      );
    }

    // Отримуємо оновлений результат
    const updatedAthlete = AthletesStorage.findById(athleteId);
    const updatedResult = updatedAthlete?.results.find(r => r.id === resultId);

    console.log('✏️ Оновлено результат змагання:', {
      athleteId,
      resultId,
      competition: updatedResult?.competitionName,
      changes: Object.keys(updates)
    });

    return NextResponse.json({
      message: 'Результат успішно оновлено',
      result: updatedResult
    });

  } catch (error) {
    console.error('❌ Помилка PUT /api/athletes/[id]/results/[resultId]:', error);
    return NextResponse.json(
      { error: 'Помилка оновлення результату' },
      { status: 500 }
    );
  }
}

// DELETE - видалити результат змагання
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  try {
    const session = await getApiSession(request);
    const { id: athleteId, resultId } = await params;

    // Перевірка авторизації
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    const isAdmin = session.user?.roles?.includes('admin');
    const isOwnProfile = session.user?.email === athlete.email;
    const canEditResults = isAdmin || isOwnProfile || session.user?.roles?.includes('coach_judge');

    if (!canEditResults) {
      return NextResponse.json(
        { error: 'Недостатньо прав для видалення результатів' },
        { status: 403 }
      );
    }

    const existingResult = athlete.results.find(r => r.id === resultId);
    if (!existingResult) {
      return NextResponse.json(
        { error: 'Результат не знайдено' },
        { status: 404 }
      );
    }

    const success = AthletesStorage.deleteResult(athleteId, resultId);

    if (!success) {
      return NextResponse.json(
        { error: 'Помилка видалення результату' },
        { status: 500 }
      );
    }

    console.log('🗑️ Видалено результат змагання:', {
      athleteId,
      resultId,
      competition: existingResult.competitionName
    });

    return NextResponse.json({
      message: 'Результат успішно видалено',
      deletedResult: existingResult
    });

  } catch (error) {
    console.error('❌ Помилка DELETE /api/athletes/[id]/results/[resultId]:', error);
    return NextResponse.json(
      { error: 'Помилка видалення результату' },
      { status: 500 }
    );
  }
}
