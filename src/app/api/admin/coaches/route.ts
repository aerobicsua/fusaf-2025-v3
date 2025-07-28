import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// GET - отримати список всіх тренерів та суддів
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено. Потрібні права адміністратора.'
      }, { status: 403 });
    }

    const url = new URL(request.url);

    // Параметри фільтрації
    const status = url.searchParams.get('status');
    const qualification = url.searchParams.get('qualification');
    const specialization = url.searchParams.get('specialization');
    const region = url.searchParams.get('region');
    const search = url.searchParams.get('search');
    const license_status = url.searchParams.get('license_status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('👨‍🏫 Admin GET /api/admin/coaches з фільтрами:', {
      status, qualification, specialization, region, search, license_status, page, limit
    });

    // Спочатку створимо таблицю для тренерів/суддів, якщо вона не існує
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS coaches (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),

        # Основна інформація
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        middle_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        date_of_birth DATE,
        gender ENUM('male', 'female') DEFAULT 'male',

        # Локація
        country VARCHAR(100) DEFAULT 'Україна',
        region VARCHAR(100),
        city VARCHAR(100),
        address TEXT,

        # Професійна інформація
        coach_type ENUM('coach', 'judge', 'both') DEFAULT 'coach',
        qualification_level VARCHAR(100),
        license_number VARCHAR(100),
        license_issued_date DATE,
        license_expiry_date DATE,
        license_status ENUM('active', 'expired', 'suspended', 'revoked') DEFAULT 'active',

        # Кваліфікації та спеціалізації
        qualifications JSON,
        specializations JSON,
        experience_years INT DEFAULT 0,

        # Клуб та робота
        primary_club VARCHAR(255),
        employment_status ENUM('full_time', 'part_time', 'volunteer', 'retired') DEFAULT 'full_time',

        # Документи
        documents JSON,
        photo_url TEXT,

        # Контакти та соціальні мережі
        website VARCHAR(255),
        social_media JSON,

        # Статистика
        athletes_trained INT DEFAULT 0,
        competitions_judged INT DEFAULT 0,
        achievements JSON,

        # Системні поля
        status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
        email_verified BOOLEAN DEFAULT FALSE,
        profile_verified BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        # Індекси
        INDEX idx_coach_type (coach_type),
        INDEX idx_qualification (qualification_level),
        INDEX idx_license_status (license_status),
        INDEX idx_region (region),
        INDEX idx_status (status),
        INDEX idx_email (email),

        # Зв'язок з користувачами
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Таблиця для сертифікатів
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS coach_certificates (
        id VARCHAR(36) PRIMARY KEY,
        coach_id VARCHAR(36) NOT NULL,

        certificate_name VARCHAR(255) NOT NULL,
        issuing_organization VARCHAR(255) NOT NULL,
        certificate_type ENUM('coaching', 'judging', 'first_aid', 'education', 'other') DEFAULT 'coaching',

        issue_date DATE NOT NULL,
        expiry_date DATE,
        certificate_number VARCHAR(100),

        file_url TEXT,
        file_name VARCHAR(255),

        verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by VARCHAR(36),
        verified_at TIMESTAMP NULL,

        notes TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_coach_id (coach_id),
        INDEX idx_certificate_type (certificate_type),
        INDEX idx_expiry_date (expiry_date),
        INDEX idx_verification_status (verification_status),

        FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
      )
    `);

    // Базовий запит для тренерів/суддів
    let query = `
      SELECT
        c.id, c.user_id, c.first_name, c.last_name, c.middle_name,
        c.email, c.phone, c.date_of_birth, c.gender,
        c.country, c.region, c.city, c.address,
        c.coach_type, c.qualification_level, c.license_number,
        c.license_issued_date, c.license_expiry_date, c.license_status,
        c.qualifications, c.specializations, c.experience_years,
        c.primary_club, c.employment_status,
        c.documents, c.photo_url, c.website, c.social_media,
        c.athletes_trained, c.competitions_judged, c.achievements,
        c.status, c.email_verified, c.profile_verified,
        c.created_at, c.updated_at,
        u.name as user_name
      FROM coaches c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM coaches c WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (status) {
      query += ` AND c.status = ?`;
      countQuery += ` AND c.status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (qualification) {
      query += ` AND c.qualification_level = ?`;
      countQuery += ` AND c.qualification_level = ?`;
      queryParams.push(qualification);
      countParams.push(qualification);
    }

    if (specialization) {
      query += ` AND JSON_CONTAINS(c.specializations, ?)`;
      countQuery += ` AND JSON_CONTAINS(c.specializations, ?)`;
      queryParams.push(`"${specialization}"`);
      countParams.push(`"${specialization}"`);
    }

    if (region) {
      query += ` AND c.region LIKE ?`;
      countQuery += ` AND c.region LIKE ?`;
      queryParams.push(`%${region}%`);
      countParams.push(`%${region}%`);
    }

    if (license_status) {
      query += ` AND c.license_status = ?`;
      countQuery += ` AND c.license_status = ?`;
      queryParams.push(license_status);
      countParams.push(license_status);
    }

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.primary_club LIKE ?)`;
      countQuery += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.primary_club LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Сортування та пагінація
    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит для тренерів/суддів');

    // Виконуємо запити
    const [coaches, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${coaches.length} тренерів/суддів з ${total} загалом`);

    // Обробляємо дані тренерів/суддів
    const processedCoaches = [];

    for (const coach of coaches) {
      try {
        // Отримуємо сертифікати для кожного тренера
        const certificates = await executeQuery<any>(`
          SELECT
            id, certificate_name, issuing_organization, certificate_type,
            issue_date, expiry_date, certificate_number, verification_status
          FROM coach_certificates
          WHERE coach_id = ?
          ORDER BY issue_date DESC
        `, [coach.id]);

        // Парсимо JSON поля безпечно
        let qualifications: string[] = [];
        let specializations: string[] = [];
        let documents: any[] = [];
        let socialMedia: any = {};
        let achievements: any[] = [];

        try {
          qualifications = typeof coach.qualifications === 'string'
            ? JSON.parse(coach.qualifications)
            : coach.qualifications || [];
        } catch (e) {
          qualifications = [];
        }

        try {
          specializations = typeof coach.specializations === 'string'
            ? JSON.parse(coach.specializations)
            : coach.specializations || [];
        } catch (e) {
          specializations = [];
        }

        try {
          documents = typeof coach.documents === 'string'
            ? JSON.parse(coach.documents)
            : coach.documents || [];
        } catch (e) {
          documents = [];
        }

        try {
          socialMedia = typeof coach.social_media === 'string'
            ? JSON.parse(coach.social_media)
            : coach.social_media || {};
        } catch (e) {
          socialMedia = {};
        }

        try {
          achievements = typeof coach.achievements === 'string'
            ? JSON.parse(coach.achievements)
            : coach.achievements || [];
        } catch (e) {
          achievements = [];
        }

        processedCoaches.push({
          id: coach.id,
          userId: coach.user_id,
          userName: coach.user_name,

          // Особиста інформація
          firstName: coach.first_name,
          lastName: coach.last_name,
          middleName: coach.middle_name,
          fullName: `${coach.last_name} ${coach.first_name} ${coach.middle_name || ''}`.trim(),
          email: coach.email,
          phone: coach.phone,
          dateOfBirth: coach.date_of_birth,
          gender: coach.gender,

          // Локація
          country: coach.country,
          region: coach.region,
          city: coach.city,
          address: coach.address,

          // Професійна інформація
          coachType: coach.coach_type,
          qualificationLevel: coach.qualification_level,
          licenseNumber: coach.license_number,
          licenseIssuedDate: coach.license_issued_date,
          licenseExpiryDate: coach.license_expiry_date,
          licenseStatus: coach.license_status,

          // Кваліфікації та спеціалізації
          qualifications: qualifications,
          specializations: specializations,
          experienceYears: coach.experience_years,

          // Робота
          primaryClub: coach.primary_club,
          employmentStatus: coach.employment_status,

          // Медіа та документи
          documents: documents,
          photoUrl: coach.photo_url,
          website: coach.website,
          socialMedia: socialMedia,

          // Статистика
          athletesTrained: coach.athletes_trained,
          competitionsJudged: coach.competitions_judged,
          achievements: achievements,

          // Сертифікати
          certificates: certificates,
          certificatesCount: certificates.length,
          validCertificates: certificates.filter(cert =>
            !cert.expiry_date || new Date(cert.expiry_date) > new Date()
          ).length,

          // Системна інформація
          status: coach.status,
          emailVerified: coach.email_verified,
          profileVerified: coach.profile_verified,
          createdAt: coach.created_at,
          updatedAt: coach.updated_at
        });

      } catch (error) {
        console.warn('⚠️ Помилка обробки тренера/судді:', coach.id, error);

        // Додаємо тренера з мінімальними даними
        processedCoaches.push({
          ...coach,
          qualifications: [],
          specializations: [],
          documents: [],
          socialMedia: {},
          achievements: [],
          certificates: [],
          certificatesCount: 0,
          validCertificates: 0
        });
      }
    }

    // Статистика тренерів/суддів
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN coach_type = 'coach' THEN 1 END) as coaches,
        COUNT(CASE WHEN coach_type = 'judge' THEN 1 END) as judges,
        COUNT(CASE WHEN coach_type = 'both' THEN 1 END) as both,
        COUNT(CASE WHEN license_status = 'active' THEN 1 END) as active_licenses,
        COUNT(CASE WHEN license_status = 'expired' THEN 1 END) as expired_licenses,
        AVG(experience_years) as avg_experience
      FROM coaches
    `);

    const regionStats = await executeQuery<any>(`
      SELECT region, COUNT(*) as count
      FROM coaches
      WHERE region IS NOT NULL AND region != ''
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    const qualificationStats = await executeQuery<any>(`
      SELECT qualification_level, COUNT(*) as count
      FROM coaches
      WHERE qualification_level IS NOT NULL AND qualification_level != ''
      GROUP BY qualification_level
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      coaches: processedCoaches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        ...stats[0],
        byRegion: regionStats.reduce((acc: any, item) => {
          acc[item.region] = item.count;
          return acc;
        }, {}),
        byQualification: qualificationStats.reduce((acc: any, item) => {
          acc[item.qualification_level] = item.count;
          return acc;
        }, {})
      },
      filters: { status, qualification, specialization, region, search, license_status }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/coaches:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження тренерів/суддів',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - створити нового тренера/суддю
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const coachData = await request.json();

    console.log('👨‍🏫 Admin POST /api/admin/coaches - створення тренера/судді');

    // Валідація обов'язкових полів
    if (!coachData.firstName || !coachData.lastName || !coachData.email) {
      return NextResponse.json({
        success: false,
        error: 'Ім\'я, прізвище та email обов\'язкові'
      }, { status: 400 });
    }

    // Перевіряємо унікальність email
    const existingCoaches = await executeQuery<any>(`
      SELECT id FROM coaches WHERE email = ?
    `, [coachData.email]);

    if (existingCoaches.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Тренер/суддя з таким email вже існує'
      }, { status: 409 });
    }

    const coachId = uuidv4();

    // Створюємо тренера/суддю
    await executeQuery(`
      INSERT INTO coaches (
        id, user_id, first_name, last_name, middle_name, email, phone,
        date_of_birth, gender, country, region, city, address,
        coach_type, qualification_level, license_number, license_issued_date,
        license_expiry_date, license_status, qualifications, specializations,
        experience_years, primary_club, employment_status, documents,
        photo_url, website, social_media, athletes_trained, competitions_judged,
        achievements, status, email_verified, profile_verified,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      coachId,
      coachData.userId || null,
      coachData.firstName,
      coachData.lastName,
      coachData.middleName || '',
      coachData.email,
      coachData.phone || '',
      coachData.dateOfBirth || null,
      coachData.gender || 'male',
      coachData.country || 'Україна',
      coachData.region || '',
      coachData.city || '',
      coachData.address || '',
      coachData.coachType || 'coach',
      coachData.qualificationLevel || '',
      coachData.licenseNumber || '',
      coachData.licenseIssuedDate || null,
      coachData.licenseExpiryDate || null,
      coachData.licenseStatus || 'active',
      JSON.stringify(coachData.qualifications || []),
      JSON.stringify(coachData.specializations || []),
      coachData.experienceYears || 0,
      coachData.primaryClub || '',
      coachData.employmentStatus || 'full_time',
      JSON.stringify(coachData.documents || []),
      coachData.photoUrl || '',
      coachData.website || '',
      JSON.stringify(coachData.socialMedia || {}),
      coachData.athletesTrained || 0,
      coachData.competitionsJudged || 0,
      JSON.stringify(coachData.achievements || []),
      coachData.status || 'pending',
      coachData.emailVerified || false,
      coachData.profileVerified || false
    ]);

    console.log('✅ Тренера/суддю створено адміністратором:', coachData.firstName, coachData.lastName);

    return NextResponse.json({
      success: true,
      message: 'Тренера/суддю успішно створено',
      coachId: coachId
    });

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/coaches:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення тренера/судді',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// PUT - оновити тренера/суддю
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { coachId, updates } = await request.json();

    if (!coachId) {
      return NextResponse.json({
        success: false,
        error: 'ID тренера/судді обов\'язковий'
      }, { status: 400 });
    }

    console.log('👨‍🏫 Admin PUT /api/admin/coaches для:', coachId);

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    // Дозволені поля для оновлення
    const allowedFields = [
      'user_id', 'first_name', 'last_name', 'middle_name', 'email', 'phone',
      'date_of_birth', 'gender', 'country', 'region', 'city', 'address',
      'coach_type', 'qualification_level', 'license_number', 'license_issued_date',
      'license_expiry_date', 'license_status', 'experience_years', 'primary_club',
      'employment_status', 'photo_url', 'website', 'athletes_trained',
      'competitions_judged', 'status', 'email_verified', 'profile_verified'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    // JSON поля
    if (updates.qualifications !== undefined) {
      updateFields.push('qualifications = ?');
      updateValues.push(JSON.stringify(updates.qualifications));
    }

    if (updates.specializations !== undefined) {
      updateFields.push('specializations = ?');
      updateValues.push(JSON.stringify(updates.specializations));
    }

    if (updates.documents !== undefined) {
      updateFields.push('documents = ?');
      updateValues.push(JSON.stringify(updates.documents));
    }

    if (updates.socialMedia !== undefined) {
      updateFields.push('social_media = ?');
      updateValues.push(JSON.stringify(updates.socialMedia));
    }

    if (updates.achievements !== undefined) {
      updateFields.push('achievements = ?');
      updateValues.push(JSON.stringify(updates.achievements));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(coachId);

    const updateQuery = `
      UPDATE coaches
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Тренера/суддю оновлено адміністратором');

    return NextResponse.json({
      success: true,
      message: 'Тренера/суддю успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin PUT /api/admin/coaches:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення тренера/судді',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - видалити тренера/суддю
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { coachId } = await request.json();

    if (!coachId) {
      return NextResponse.json({
        success: false,
        error: 'ID тренера/судді обов\'язковий'
      }, { status: 400 });
    }

    console.log('👨‍🏫 Admin DELETE /api/admin/coaches для:', coachId);

    // Перевіряємо чи існує тренер/суддя
    const coaches = await executeQuery<any>(`
      SELECT id, first_name, last_name FROM coaches WHERE id = ?
    `, [coachId]);

    if (coaches.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Тренера/суддю не знайдено'
      }, { status: 404 });
    }

    const coach = coaches[0];

    // Видаляємо тренера/суддю (каскадне видалення для сертифікатів)
    await executeQuery(`DELETE FROM coaches WHERE id = ?`, [coachId]);

    console.log('✅ Тренера/суддю видалено адміністратором:', coach.first_name, coach.last_name);

    return NextResponse.json({
      success: true,
      message: 'Тренера/суддю успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin DELETE /api/admin/coaches:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення тренера/судді',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
