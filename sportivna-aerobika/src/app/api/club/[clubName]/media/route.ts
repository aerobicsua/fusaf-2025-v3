import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// GET - отримання медіа-файлів клубу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubName: string }> }
) {
  try {
    const resolvedParams = await params;
    const clubName = decodeURIComponent(resolvedParams.clubName);
    console.log(`📸 [GET MEDIA] Завантаження медіа-галереї клубу: ${clubName}`);

    // Спочатку перевіримо чи існує таблиця clubs та поле media_files
    try {
      await executeQuery(`
        ALTER TABLE clubs ADD COLUMN media_files LONGTEXT
      `);
      console.log('✅ [GET MEDIA] Поле media_files додано до таблиці clubs');
    } catch (alterError) {
      console.log('ℹ️ [GET MEDIA] Поле media_files вже існує або таблиця clubs не існує');
    }

    // Отримуємо медіа-файли з таблиці clubs
    const clubs = await executeQuery(`
      SELECT media_files, name, id, owner_id, owner_name
      FROM clubs
      WHERE name = ?
      LIMIT 1
    `, [clubName]);

    console.log('🔍 [GET MEDIA] Результат пошуку клубу в таблиці clubs:', {
      clubName,
      found: clubs.length > 0,
      clubData: clubs.length > 0 ? {
        id: clubs[0].id,
        name: clubs[0].name,
        owner_id: clubs[0].owner_id,
        hasMediaFiles: !!clubs[0].media_files,
        mediaFilesLength: clubs[0].media_files ? clubs[0].media_files.length : 0
      } : null
    });

    if (clubs.length === 0) {
      console.log('⚠️ [GET MEDIA] Клуб не знайдено в таблиці clubs, перевіряємо таблицю users...');

      // Шукаємо клуб в таблиці users
      const users = await executeQuery(`
        SELECT id, name, email, club
        FROM users
        WHERE club = ? AND roles LIKE '%club_owner%'
        LIMIT 1
      `, [clubName]);

      if (users.length > 0) {
        console.log('✅ [GET MEDIA] Власник клубу знайдений в таблиці users, створюємо запис в таблиці clubs');

        // Створюємо запис клубу в таблиці clubs
        const clubId = `club_${clubName.replace(/\s+/g, '_')}_${Date.now()}`;

        try {
          await executeQuery(`
            INSERT INTO clubs (
              id, name, description, owner_id, owner_name,
              media_files, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            clubId,
            clubName,
            `Спортивний клуб "${clubName}"`,
            users[0].email,
            users[0].name,
            '[]', // Порожній JSON масив для медіа
            true
          ]);

          console.log(`✅ [GET MEDIA] Клуб "${clubName}" створено в таблиці clubs з ID: ${clubId}`);

          // Повертаємо порожню галерею
          return NextResponse.json({
            success: true,
            media: [],
            total: 0,
            clubName: clubName,
            debug: {
              action: 'created_new_club',
              clubId: clubId,
              message: 'Клуб створено, медіа-галерея порожня'
            }
          });

        } catch (insertError) {
          console.error('❌ [GET MEDIA] Помилка створення клубу в таблиці clubs:', insertError);
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Клуб не знайдено',
        debug: {
          action: 'club_not_found',
          message: 'Клуб відсутній як в таблиці clubs, так і в users'
        }
      }, { status: 404 });
    }

    // Парсимо JSON з медіа-файлами
    let mediaFiles = [];
    const mediaFilesRaw = clubs[0].media_files;

    console.log('🔍 [GET MEDIA] Raw media_files з БД:', {
      type: typeof mediaFilesRaw,
      isNull: mediaFilesRaw === null,
      isUndefined: mediaFilesRaw === undefined,
      isEmpty: mediaFilesRaw === '',
      length: mediaFilesRaw ? mediaFilesRaw.length : 0,
      preview: mediaFilesRaw ? mediaFilesRaw.substring(0, 100) : 'null/undefined'
    });

    if (mediaFilesRaw) {
      try {
        if (typeof mediaFilesRaw === 'string') {
          mediaFiles = JSON.parse(mediaFilesRaw);
          console.log('✅ [GET MEDIA] Успішно розпарсили JSON медіа-файли');
        } else if (Array.isArray(mediaFilesRaw)) {
          mediaFiles = mediaFilesRaw;
          console.log('✅ [GET MEDIA] Медіа-файли вже масив');
        } else {
          console.warn('⚠️ [GET MEDIA] Незвичний тип медіа-файлів:', typeof mediaFilesRaw);
          mediaFiles = [];
        }
      } catch (parseError) {
        console.error('❌ [GET MEDIA] Помилка парсингу медіа-файлів:', {
          error: parseError,
          rawData: mediaFilesRaw,
          rawType: typeof mediaFilesRaw
        });
        mediaFiles = [];
      }
    } else {
      console.log('ℹ️ [GET MEDIA] media_files є null/undefined/empty, повертаємо порожній масив');
      mediaFiles = [];
    }

    console.log(`✅ [GET MEDIA] Фінальний результат: ${mediaFiles.length} медіа-файлів для клубу "${clubName}"`);

    // Логування кожного медіа-файлу (тільки ID та тип для performance)
    mediaFiles.forEach((media, index) => {
      console.log(`  📄 [GET MEDIA] Медіа ${index + 1}: ID=${media.id}, тип=${media.type}, назва=${media.title || media.fileName}`);
    });

    return NextResponse.json({
      success: true,
      media: mediaFiles,
      total: mediaFiles.length,
      clubName: clubName,
      debug: {
        action: 'loaded_media',
        clubFound: true,
        clubId: clubs[0].id,
        ownerId: clubs[0].owner_id,
        rawMediaFilesType: typeof mediaFilesRaw,
        rawMediaFilesLength: mediaFilesRaw ? mediaFilesRaw.length : 0,
        parsedMediaCount: mediaFiles.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [GET MEDIA] Критична помилка отримання медіа-галереї:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка завантаження медіа-галереї',
        details: error instanceof Error ? error.message : 'Невідома помилка',
        debug: {
          action: 'critical_error',
          endpoint: 'GET /api/club/[clubName]/media',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// POST - завантаження нового медіа-файлу
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubName: string }> }
) {
  try {
    const resolvedParams = await params;
    const clubName = decodeURIComponent(resolvedParams.clubName);
    const { mediaData, uploaderEmail } = await request.json();

    console.log(`📤 [POST MEDIA] Завантаження медіа-файлу в клуб: ${clubName}`);
    console.log('🔍 [POST MEDIA] Отримані дані:', {
      clubName,
      uploaderEmail,
      mediaType: mediaData?.type,
      mediaTitle: mediaData?.title,
      hasFileData: !!mediaData?.fileData,
      fileSizeKB: mediaData?.fileData ? Math.round(mediaData.fileData.length / 1024) : 0
    });

    if (!mediaData || !uploaderEmail) {
      return NextResponse.json({
        success: false,
        error: 'Дані медіа-файлу та email користувача обов\'язкові'
      }, { status: 400 });
    }

    // Перевіряємо, чи користувач є власником клубу
    const ownerCheck = await executeQuery(`
      SELECT id, name, email, club
      FROM users
      WHERE email = ? AND club = ? AND roles LIKE '%club_owner%'
      LIMIT 1
    `, [uploaderEmail, clubName]);

    console.log('🔍 [POST MEDIA] Перевірка власника клубу:', {
      uploaderEmail,
      clubName,
      ownerFound: ownerCheck.length > 0,
      ownerData: ownerCheck.length > 0 ? ownerCheck[0] : null
    });

    if (ownerCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Тільки власник клубу може завантажувати медіа-файли'
      }, { status: 403 });
    }

    // Отримуємо поточні медіа-файли
    const clubs = await executeQuery(`
      SELECT media_files, id, name
      FROM clubs
      WHERE name = ?
      LIMIT 1
    `, [clubName]);

    console.log('🔍 [POST MEDIA] Пошук клубу в таблиці clubs:', {
      clubName,
      found: clubs.length > 0
    });

    if (clubs.length === 0) {
      console.log('⚠️ [POST MEDIA] Клуб не знайдено в таблиці clubs, створюємо автоматично...');

      // Створюємо запис клубу
      const clubId = `club_${clubName.replace(/\s+/g, '_')}_${Date.now()}`;

      try {
        await executeQuery(`
          INSERT INTO clubs (
            id, name, description, owner_id, owner_name,
            media_files, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          clubId,
          clubName,
          `Спортивний клуб "${clubName}"`,
          uploaderEmail,
          ownerCheck[0].name,
          '[]', // Порожній JSON масив для медіа
          true
        ]);

        console.log(`✅ [POST MEDIA] Клуб "${clubName}" автоматично створено в таблиці clubs`);
      } catch (insertError) {
        console.error('❌ [POST MEDIA] Помилка автоматичного створення клубу:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Помилка створення запису клубу'
        }, { status: 500 });
      }
    }

    // Отримуємо поточні медіа-файли (після можливого створення клубу)
    const updatedClubs = await executeQuery(`
      SELECT media_files
      FROM clubs
      WHERE name = ?
      LIMIT 1
    `, [clubName]);

    if (updatedClubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Помилка доступу до запису клубу'
      }, { status: 500 });
    }

    // Парсимо поточні медіа-файли
    let currentMedia = [];
    const mediaFilesRaw = updatedClubs[0].media_files;

    console.log('🔍 [POST MEDIA] Поточні медіа перед додаванням:', {
      type: typeof mediaFilesRaw,
      raw: mediaFilesRaw ? mediaFilesRaw.substring(0, 100) : 'null',
      length: mediaFilesRaw ? mediaFilesRaw.length : 0
    });

    if (mediaFilesRaw) {
      try {
        if (typeof mediaFilesRaw === 'string') {
          currentMedia = JSON.parse(mediaFilesRaw);
        } else if (Array.isArray(mediaFilesRaw)) {
          currentMedia = mediaFilesRaw;
        }
      } catch (parseError) {
        console.warn('⚠️ [POST MEDIA] Помилка парсингу існуючих медіа-файлів:', parseError);
        currentMedia = [];
      }
    }

    // Додаємо новий медіа-файл
    const newMediaFile = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: mediaData.type, // 'photo' or 'video'
      title: mediaData.title || '',
      description: mediaData.description || '',
      fileName: mediaData.fileName || '',
      fileData: mediaData.fileData, // Base64 string
      uploadedBy: uploaderEmail,
      uploadedAt: new Date().toISOString(),
      category: mediaData.category || 'general' // 'training', 'competition', 'events', 'general'
    };

    currentMedia.push(newMediaFile);

    console.log('🔍 [POST MEDIA] Новий медіа-файл:', {
      id: newMediaFile.id,
      type: newMediaFile.type,
      title: newMediaFile.title,
      hasFileData: !!newMediaFile.fileData,
      fileSizeKB: Math.round(newMediaFile.fileData.length / 1024),
      totalMediaAfter: currentMedia.length
    });

    // Зберігаємо оновлений список медіа-файлів
    const jsonMediaFiles = JSON.stringify(currentMedia);

    await executeQuery(`
      UPDATE clubs
      SET media_files = ?, updated_at = NOW()
      WHERE name = ?
    `, [jsonMediaFiles, clubName]);

    console.log(`✅ [POST MEDIA] Медіа-файл додано до клубу "${clubName}". Загалом медіа: ${currentMedia.length}`);

    return NextResponse.json({
      success: true,
      message: 'Медіа-файл успішно завантажено',
      mediaId: newMediaFile.id,
      totalMedia: currentMedia.length,
      debug: {
        action: 'media_uploaded',
        clubName,
        newMediaId: newMediaFile.id,
        totalAfterUpload: currentMedia.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [POST MEDIA] Помилка завантаження медіа-файлу:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка завантаження медіа-файлу',
        details: error instanceof Error ? error.message : 'Невідома помилка',
        debug: {
          action: 'upload_error',
          endpoint: 'POST /api/club/[clubName]/media',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// DELETE - видалення медіа-файлу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubName: string }> }
) {
  try {
    const resolvedParams = await params;
    const clubName = decodeURIComponent(resolvedParams.clubName);
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const userEmail = searchParams.get('userEmail');

    if (!mediaId || !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'ID медіа-файлу та email користувача обов\'язкові'
      }, { status: 400 });
    }

    console.log(`🗑️ [DELETE MEDIA] Видалення медіа-файлу ${mediaId} з клубу: ${clubName}`);

    // Перевіряємо права доступу
    const ownerCheck = await executeQuery(`
      SELECT id
      FROM users
      WHERE email = ? AND club = ? AND roles LIKE '%club_owner%'
      LIMIT 1
    `, [userEmail, clubName]);

    if (ownerCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Тільки власник клубу може видаляти медіа-файли'
      }, { status: 403 });
    }

    // Отримуємо поточні медіа-файли
    const clubs = await executeQuery(`
      SELECT media_files
      FROM clubs
      WHERE name = ?
      LIMIT 1
    `, [clubName]);

    if (clubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Клуб не знайдено'
      }, { status: 404 });
    }

    // Парсимо та фільтруємо медіа-файли
    let currentMedia = [];
    if (clubs[0].media_files) {
      try {
        currentMedia = JSON.parse(clubs[0].media_files);
        const beforeCount = currentMedia.length;
        currentMedia = currentMedia.filter((media: any) => media.id !== mediaId);
        console.log(`🔍 [DELETE MEDIA] Видалено медіа: було ${beforeCount}, стало ${currentMedia.length}`);
      } catch (parseError) {
        console.warn('⚠️ [DELETE MEDIA] Помилка парсингу медіа-файлів:', parseError);
        return NextResponse.json({
          success: false,
          error: 'Помилка обробки медіа-файлів'
        }, { status: 500 });
      }
    }

    // Зберігаємо оновлений список
    await executeQuery(`
      UPDATE clubs
      SET media_files = ?, updated_at = NOW()
      WHERE name = ?
    `, [JSON.stringify(currentMedia), clubName]);

    console.log(`✅ [DELETE MEDIA] Медіа-файл ${mediaId} видалено з клубу "${clubName}"`);

    return NextResponse.json({
      success: true,
      message: 'Медіа-файл успішно видалено',
      totalMedia: currentMedia.length
    });

  } catch (error) {
    console.error('❌ [DELETE MEDIA] Помилка видалення медіа-файлу:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка видалення медіа-файлу',
        details: error instanceof Error ? error.message : 'Невідома помилка'
      },
      { status: 500 }
    );
  }
}
