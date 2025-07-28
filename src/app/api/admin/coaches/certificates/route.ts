import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// GET - отримати сертифікати тренера/судді
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const coachId = url.searchParams.get('coachId');
    const certificateType = url.searchParams.get('type');
    const verificationStatus = url.searchParams.get('verification_status');

    if (!coachId) {
      return NextResponse.json({
        success: false,
        error: 'ID тренера/судді обов\'язковий'
      }, { status: 400 });
    }

    let query = `
      SELECT
        cc.id, cc.coach_id, cc.certificate_name, cc.issuing_organization,
        cc.certificate_type, cc.issue_date, cc.expiry_date, cc.certificate_number,
        cc.file_url, cc.file_name, cc.verification_status, cc.verified_by,
        cc.verified_at, cc.notes, cc.created_at, cc.updated_at,
        c.first_name, c.last_name
      FROM coach_certificates cc
      LEFT JOIN coaches c ON cc.coach_id = c.id
      WHERE cc.coach_id = ?
    `;

    const queryParams = [coachId];

    if (certificateType) {
      query += ` AND cc.certificate_type = ?`;
      queryParams.push(certificateType);
    }

    if (verificationStatus) {
      query += ` AND cc.verification_status = ?`;
      queryParams.push(verificationStatus);
    }

    query += ` ORDER BY cc.issue_date DESC`;

    const certificates = await executeQuery<any>(query, queryParams);

    // Обробляємо дані сертифікатів
    const processedCertificates = certificates.map(cert => ({
      id: cert.id,
      coachId: cert.coach_id,
      coachName: `${cert.first_name} ${cert.last_name}`,
      certificateName: cert.certificate_name,
      issuingOrganization: cert.issuing_organization,
      certificateType: cert.certificate_type,
      issueDate: cert.issue_date,
      expiryDate: cert.expiry_date,
      certificateNumber: cert.certificate_number,
      fileUrl: cert.file_url,
      fileName: cert.file_name,
      verificationStatus: cert.verification_status,
      verifiedBy: cert.verified_by,
      verifiedAt: cert.verified_at,
      notes: cert.notes,
      isExpired: cert.expiry_date ? new Date(cert.expiry_date) < new Date() : false,
      daysUntilExpiry: cert.expiry_date ?
        Math.ceil((new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
      createdAt: cert.created_at,
      updatedAt: cert.updated_at
    }));

    return NextResponse.json({
      success: true,
      certificates: processedCertificates
    });

  } catch (error) {
    console.error('❌ Помилка завантаження сертифікатів:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження сертифікатів'
    }, { status: 500 });
  }
}

// POST - додати новий сертифікат
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const certificateData = await request.json();

    // Валідація обов'язкових полів
    if (!certificateData.coachId || !certificateData.certificateName || !certificateData.issuingOrganization) {
      return NextResponse.json({
        success: false,
        error: 'ID тренера, назва сертифіката та організація-видавець обов\'язкові'
      }, { status: 400 });
    }

    const certificateId = uuidv4();

    await executeQuery(`
      INSERT INTO coach_certificates (
        id, coach_id, certificate_name, issuing_organization, certificate_type,
        issue_date, expiry_date, certificate_number, file_url, file_name,
        verification_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      certificateId,
      certificateData.coachId,
      certificateData.certificateName,
      certificateData.issuingOrganization,
      certificateData.certificateType || 'coaching',
      certificateData.issueDate || new Date().toISOString().split('T')[0],
      certificateData.expiryDate || null,
      certificateData.certificateNumber || '',
      certificateData.fileUrl || '',
      certificateData.fileName || '',
      certificateData.verificationStatus || 'pending',
      certificateData.notes || ''
    ]);

    console.log('✅ Сертифікат додано:', certificateData.certificateName);

    return NextResponse.json({
      success: true,
      message: 'Сертифікат успішно додано',
      certificateId: certificateId
    });

  } catch (error) {
    console.error('❌ Помилка додавання сертифіката:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка додавання сертифіката'
    }, { status: 500 });
  }
}

// PUT - оновити сертифікат
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { certificateId, updates } = await request.json();

    if (!certificateId) {
      return NextResponse.json({
        success: false,
        error: 'ID сертифіката обов\'язковий'
      }, { status: 400 });
    }

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'certificate_name', 'issuing_organization', 'certificate_type',
      'issue_date', 'expiry_date', 'certificate_number', 'file_url',
      'file_name', 'verification_status', 'verified_by', 'notes'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    // Якщо верифікується, додаємо час верифікації
    if (updates.verification_status === 'verified') {
      updateFields.push('verified_at = NOW()');
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(certificateId);

    const updateQuery = `
      UPDATE coach_certificates
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Сертифікат оновлено');

    return NextResponse.json({
      success: true,
      message: 'Сертифікат успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка оновлення сертифіката:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення сертифіката'
    }, { status: 500 });
  }
}

// DELETE - видалити сертифікат
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { certificateId } = await request.json();

    if (!certificateId) {
      return NextResponse.json({
        success: false,
        error: 'ID сертифіката обов\'язковий'
      }, { status: 400 });
    }

    // Перевіряємо чи існує сертифікат
    const certificates = await executeQuery<any>(`
      SELECT id, certificate_name FROM coach_certificates WHERE id = ?
    `, [certificateId]);

    if (certificates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Сертифікат не знайдено'
      }, { status: 404 });
    }

    const certificate = certificates[0];

    // Видаляємо сертифікат
    await executeQuery(`DELETE FROM coach_certificates WHERE id = ?`, [certificateId]);

    console.log('✅ Сертифікат видалено:', certificate.certificate_name);

    return NextResponse.json({
      success: true,
      message: 'Сертифікат успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка видалення сертифіката:', error);
    return NextResponse.json({
      success: false,
      error: 'Помилка видалення сертифіката'
    }, { status: 500 });
  }
}
