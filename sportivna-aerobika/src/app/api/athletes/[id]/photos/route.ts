import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { AthletesStorage, type MediaItem } from '@/lib/athletes-storage';

// POST - додати фото/медіа до спортсмена
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;

    // Перевірка авторизації (адмін або власний профіль)
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

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Недостатньо прав для редагування профілю' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, url, title, description, isProfileImage, competitionId, tags } = body;

    // Валідація
    if (!type || !url) {
      return NextResponse.json(
        { error: 'Обов\'язкові поля: type, url' },
        { status: 400 }
      );
    }

    if (!['photo', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Тип медіа має бути photo або video' },
        { status: 400 }
      );
    }

    // Створюємо новий медіа об'єкт
    const mediaItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      url,
      title: title || '',
      description: description || '',
      uploadDate: new Date().toISOString(),
      isProfileImage: isProfileImage || false,
      competitionId: competitionId || undefined,
      tags: tags || []
    };

    // Якщо це нове фото профілю, скидаємо попереднє
    if (isProfileImage) {
      const existingMedia = athlete.media || [];
      existingMedia.forEach(media => {
        if (media.isProfileImage) {
          media.isProfileImage = false;
        }
      });
    }

    const success = AthletesStorage.addMedia(athleteId, mediaItem);

    if (!success) {
      return NextResponse.json(
        { error: 'Помилка додавання медіа' },
        { status: 500 }
      );
    }

    console.log('📸 Додано медіа:', {
      athleteId,
      mediaId: mediaItem.id,
      type: mediaItem.type,
      isProfileImage: mediaItem.isProfileImage
    });

    return NextResponse.json({
      message: 'Медіа успішно додано',
      media: mediaItem
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Помилка POST /api/athletes/[id]/photos:', error);
    return NextResponse.json(
      { error: 'Помилка додавання медіа' },
      { status: 500 }
    );
  }
}

// GET - отримати всі медіа спортсмена
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // photo або video
    const competitionId = url.searchParams.get('competitionId');

    const athlete = AthletesStorage.findById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Спортсмена не знайдено' },
        { status: 404 }
      );
    }

    let media = athlete.media || [];

    // Фільтрація по типу
    if (type && ['photo', 'video'].includes(type)) {
      media = media.filter(item => item.type === type);
    }

    // Фільтрація по змаганню
    if (competitionId) {
      media = media.filter(item => item.competitionId === competitionId);
    }

    // Сортуємо по даті завантаження (нові спочатку)
    media.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return NextResponse.json({
      athleteId,
      media,
      total: media.length,
      profileImage: media.find(item => item.isProfileImage),
      stats: {
        photos: media.filter(item => item.type === 'photo').length,
        videos: media.filter(item => item.type === 'video').length,
        withCompetition: media.filter(item => item.competitionId).length
      }
    });

  } catch (error) {
    console.error('❌ Помилка GET /api/athletes/[id]/photos:', error);
    return NextResponse.json(
      { error: 'Помилка завантаження медіа' },
      { status: 500 }
    );
  }
}

// DELETE - видалити медіа
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession(request);
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;
    const url = new URL(request.url);
    const mediaId = url.searchParams.get('mediaId');

    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна авторизація' },
        { status: 401 }
      );
    }

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Не вказано ID медіа' },
        { status: 400 }
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

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Недостатньо прав для редагування профілю' },
        { status: 403 }
      );
    }

    // Знаходимо та видаляємо медіа
    const mediaIndex = athlete.media.findIndex(item => item.id === mediaId);
    if (mediaIndex === -1) {
      return NextResponse.json(
        { error: 'Медіа не знайдено' },
        { status: 404 }
      );
    }

    const removedMedia = athlete.media.splice(mediaIndex, 1)[0];

    // Оновлюємо дані спортсмена
    AthletesStorage.update(athleteId, { media: athlete.media });

    console.log('🗑️ Видалено медіа:', {
      athleteId,
      mediaId,
      type: removedMedia.type
    });

    return NextResponse.json({
      message: 'Медіа успішно видалено',
      removedMedia
    });

  } catch (error) {
    console.error('❌ Помилка DELETE /api/athletes/[id]/photos:', error);
    return NextResponse.json(
      { error: 'Помилка видалення медіа' },
      { status: 500 }
    );
  }
}
