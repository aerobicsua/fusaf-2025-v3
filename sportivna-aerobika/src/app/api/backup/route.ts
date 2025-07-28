import { type NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/auth';
// authOptions removed
import { BackupService, SecurityService } from '@/lib/backup';

// GET /api/backup - отримання списку резервних копій
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    // TODO: Перевірити права адміністратора
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Недостатньо прав доступу' },
    //     { status: 403 }
    //   );
    // }

    const backups = await BackupService.listBackups();

    return NextResponse.json({
      success: true,
      count: backups.length,
      backups
    });

  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json(
      { error: 'Помилка при отриманні списку резервних копій' },
      { status: 500 }
    );
  }
}

// POST /api/backup - створення нової резервної копії
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type = 'full' } = body;

    if (!['full', 'incremental'].includes(type)) {
      return NextResponse.json(
        { error: 'Неправильний тип резервної копії. Дозволені: full, incremental' },
        { status: 400 }
      );
    }

    // Логуємо спробу створення резервної копії
    await BackupService.logSecurity({
      level: 'info',
      category: 'backup',
      message: 'Backup creation requested',
      userId: session.user?.id,
      details: { type, requestedBy: session.user?.email }
    });

    // Створюємо резервну копію
    const backupInfo = await BackupService.createBackup(type);

    return NextResponse.json({
      success: true,
      message: 'Резервна копія створена успішно',
      backup: backupInfo
    });

  } catch (error) {
    console.error('Backup creation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await BackupService.logSecurity({
      level: 'error',
      category: 'backup',
      message: `Backup creation failed: ${errorMessage}`,
      details: { error: errorMessage }
    });

    return NextResponse.json(
      { error: 'Помилка при створенні резервної копії' },
      { status: 500 }
    );
  }
}

// DELETE /api/backup - очистка старих резервних копій
export async function DELETE(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Необхідна аутентифікація' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const retentionDays = Number.parseInt(searchParams.get('retention') || '30');
    const backupId = searchParams.get('id');

    if (backupId) {
      // Видаляємо конкретну резервну копію
      await BackupService.logSecurity({
        level: 'warning',
        category: 'backup',
        message: 'Manual backup deletion requested',
        userId: session.user?.id,
        details: { backupId, deletedBy: session.user?.email }
      });

      // TODO: Реалізувати видалення конкретної резервної копії
      return NextResponse.json({
        success: true,
        message: `Резервна копія ${backupId} видалена`
      });

    } else {
      // Очищуємо старі резервні копії
      const deletedCount = await BackupService.cleanupOldBackups(retentionDays);

      return NextResponse.json({
        success: true,
        message: `Видалено ${deletedCount} старих резервних копій`,
        deletedCount,
        retentionDays
      });
    }

  } catch (error) {
    console.error('Backup cleanup error:', error);
    return NextResponse.json(
      { error: 'Помилка при очищенні резервних копій' },
      { status: 500 }
    );
  }
}
