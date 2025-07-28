import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// Функція для перетворення даних в CSV
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = data.map(row =>
    headers.map(header => {
      const value = row[header] || '';
      // Екрануємо коми та лапки
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

// GET - експорт даних
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено. Потрібні права адміністратора.'
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'users';
    const format = url.searchParams.get('format') || 'csv';

    console.log(`📊 Admin EXPORT ${type} в форматі ${format}`);

    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        // Експорт користувачів
        data = await executeQuery<any>(`
          SELECT
            id, email, name, first_name, last_name, middle_name,
            date_of_birth, gender, phone,
            country, region, city, address,
            club, coach, sport_category, experience,
            roles, status, email_verified, membership_paid,
            created_at, last_login
          FROM users
          ORDER BY created_at DESC
        `);

        headers = [
          'id', 'email', 'name', 'first_name', 'last_name', 'middle_name',
          'date_of_birth', 'gender', 'phone',
          'country', 'region', 'city', 'address',
          'club', 'coach', 'sport_category', 'experience',
          'roles', 'status', 'email_verified', 'membership_paid',
          'created_at', 'last_login'
        ];

        filename = `FUSAF_Users_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'athletes':
        // Експорт спортсменів
        data = await executeQuery<any>(`
          SELECT
            id, email, name, first_name, last_name, middle_name,
            date_of_birth, gender, phone,
            region, city, club, coach, sport_category, experience,
            status, membership_paid, created_at
          FROM users
          WHERE JSON_CONTAINS(roles, '"athlete"')
          ORDER BY last_name, first_name
        `);

        headers = [
          'id', 'email', 'name', 'first_name', 'last_name', 'middle_name',
          'date_of_birth', 'gender', 'phone',
          'region', 'city', 'club', 'coach', 'sport_category', 'experience',
          'status', 'membership_paid', 'created_at'
        ];

        filename = `FUSAF_Athletes_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'clubs':
        // Експорт клубів
        data = await executeQuery<any>(`
          SELECT
            c.id, c.name, c.full_name, c.description,
            c.city, c.region, c.phone, c.email, c.website,
            c.legal_status, c.registration_number, c.founding_date,
            c.members_count, c.coaches_count, c.status, c.membership_paid,
            c.created_at,
            u.name as owner_name, u.email as owner_email
          FROM clubs c
          LEFT JOIN users u ON c.owner_id = u.id
          ORDER BY c.name
        `);

        headers = [
          'id', 'name', 'full_name', 'description',
          'city', 'region', 'phone', 'email', 'website',
          'legal_status', 'registration_number', 'founding_date',
          'members_count', 'coaches_count', 'status', 'membership_paid',
          'created_at', 'owner_name', 'owner_email'
        ];

        filename = `FUSAF_Clubs_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'competitions':
        // Експорт змагань
        data = await executeQuery<any>(`
          SELECT
            c.id, c.title, c.description, c.date, c.time,
            c.location, c.address, c.city, c.region,
            c.organizing_club, c.registration_deadline, c.status,
            c.created_at,
            u.name as organizer_name, u.email as organizer_email
          FROM competitions c
          LEFT JOIN users u ON c.organizer_id = u.id
          ORDER BY c.date DESC
        `);

        headers = [
          'id', 'title', 'description', 'date', 'time',
          'location', 'address', 'city', 'region',
          'organizing_club', 'registration_deadline', 'status',
          'created_at', 'organizer_name', 'organizer_email'
        ];

        filename = `FUSAF_Competitions_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'registrations':
        // Експорт реєстрацій
        data = await executeQuery<any>(`
          SELECT
            r.id, r.competition_id, r.participant_id,
            r.registration_type, r.program, r.category,
            r.club_name, r.coach_name, r.coach_phone,
            r.registration_fee, r.entry_fee, r.total_fee,
            r.payment_status, r.status, r.created_at,
            u.name as participant_name, u.email as participant_email,
            c.title as competition_title, c.date as competition_date
          FROM registrations r
          LEFT JOIN users u ON r.participant_id = u.id
          LEFT JOIN competitions c ON r.competition_id = c.id
          ORDER BY r.created_at DESC
        `);

        headers = [
          'id', 'competition_id', 'participant_id',
          'registration_type', 'program', 'category',
          'club_name', 'coach_name', 'coach_phone',
          'registration_fee', 'entry_fee', 'total_fee',
          'payment_status', 'status', 'created_at',
          'participant_name', 'participant_email',
          'competition_title', 'competition_date'
        ];

        filename = `FUSAF_Registrations_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Невідомий тип експорту'
        }, { status: 400 });
    }

    // Обробляємо дані для експорту
    const processedData = data.map(row => {
      const processedRow: any = {};

      for (const header of headers) {
        let value = row[header];

        // Обробляємо JSON поля
        if (header === 'roles' && typeof value === 'string') {
          try {
            const roles = JSON.parse(value);
            value = Array.isArray(roles) ? roles.join('; ') : value;
          } catch (e) {
            // Залишаємо як є
          }
        }

        // Обробляємо дати
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }

        // Обробляємо boolean
        if (typeof value === 'boolean') {
          value = value ? 'Так' : 'Ні';
        }

        // Обробляємо null/undefined
        if (value === null || value === undefined) {
          value = '';
        }

        processedRow[header] = value;
      }

      return processedRow;
    });

    console.log(`✅ Підготовлено ${processedData.length} записів для експорту`);

    if (format === 'csv') {
      // CSV експорт
      const csvContent = convertToCSV(processedData, headers);

      // Додаємо BOM для правильного відображення української мови в Excel
      const bom = '\uFEFF';
      const csvWithBom = bom + csvContent;

      return new NextResponse(csvWithBom, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });

    } else if (format === 'json') {
      // JSON експорт
      return NextResponse.json({
        success: true,
        data: processedData,
        totalRecords: processedData.length,
        exportType: type,
        exportDate: new Date().toISOString(),
        filename: `${filename}.json`
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Підтримуються тільки формати: csv, json'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Помилка Admin EXPORT:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка експорту даних',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - масовий експорт з фільтрами
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { exportTypes, filters, format = 'csv' } = await request.json();

    console.log('📊 Admin POST EXPORT з типами:', exportTypes);

    const exportResults: any = {};

    for (const type of exportTypes) {
      try {
        let query = '';
        let headers: string[] = [];
        const queryParams: any[] = [];

        switch (type) {
          case 'users':
            query = `
              SELECT
                id, email, name, first_name, last_name,
                region, city, club, roles, status, created_at
              FROM users
              WHERE 1=1
            `;
            headers = ['id', 'email', 'name', 'first_name', 'last_name', 'region', 'city', 'club', 'roles', 'status', 'created_at'];

            if (filters?.status) {
              query += ` AND status = ?`;
              queryParams.push(filters.status);
            }
            if (filters?.region) {
              query += ` AND region LIKE ?`;
              queryParams.push(`%${filters.region}%`);
            }
            break;

          case 'athletes':
            query = `
              SELECT
                id, name, first_name, last_name,
                region, city, club, sport_category, status
              FROM users
              WHERE JSON_CONTAINS(roles, '"athlete"')
            `;
            headers = ['id', 'name', 'first_name', 'last_name', 'region', 'city', 'club', 'sport_category', 'status'];

            if (filters?.region) {
              query += ` AND region LIKE ?`;
              queryParams.push(`%${filters.region}%`);
            }
            break;

          default:
            continue;
        }

        const data = await executeQuery<any>(query, queryParams);

        if (format === 'csv') {
          exportResults[type] = {
            data: convertToCSV(data, headers),
            recordCount: data.length,
            headers: headers
          };
        } else {
          exportResults[type] = {
            data: data,
            recordCount: data.length,
            headers: headers
          };
        }

      } catch (error) {
        console.error(`❌ Помилка експорту ${type}:`, error);
        exportResults[type] = {
          error: `Помилка експорту ${type}`,
          recordCount: 0
        };
      }
    }

    const totalRecords = Object.values(exportResults).reduce((sum: number, result: any) =>
      sum + (result.recordCount || 0), 0
    );

    console.log(`✅ Масовий експорт завершено, ${totalRecords} записів`);

    return NextResponse.json({
      success: true,
      exports: exportResults,
      totalRecords: totalRecords,
      exportDate: new Date().toISOString(),
      format: format
    });

  } catch (error) {
    console.error('❌ Помилка масового експорту:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка масового експорту',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
