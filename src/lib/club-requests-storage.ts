import { createPool } from './mysql';

// MySQL storage для заявок клубів
interface ClubRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    registeredAt: string;
  };
  club: {
    name: string;
    type: 'club' | 'subdivision';
    address: string;
    city: string;
    region: string;
    zipCode: string;
    description: string;
    experience: string;
    legalStatus: string;
    website?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  documents?: {
    name: string;
    url: string;
  }[];
}

export class ClubRequestsStorage {
  private static getPool() {
    return createPool();
  }

  static async getAll(): Promise<ClubRequest[]> {
    try {
      const pool = this.getPool();
      const connection = await pool.getConnection();

      const [rows] = await connection.execute(`
        SELECT
          id,
          user_id,
          user_name,
          user_email,
          user_phone,
          club_name,
          club_type,
          club_address,
          club_city,
          club_region,
          club_zip_code,
          club_description,
          club_experience,
          club_legal_status,
          club_website,
          status,
          submitted_at,
          reviewed_at,
          reviewed_by,
          review_notes,
          documents
        FROM club_requests
        ORDER BY submitted_at DESC
      `) as any[];

      connection.release();

      const requests = rows.map((row: any) => ({
        id: row.id,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          phone: row.user_phone,
          registeredAt: row.submitted_at
        },
        club: {
          name: row.club_name,
          type: row.club_type,
          address: row.club_address,
          city: row.club_city,
          region: row.club_region,
          zipCode: row.club_zip_code,
          description: row.club_description || '',
          experience: row.club_experience || '',
          legalStatus: row.club_legal_status,
          website: row.club_website || undefined
        },
        status: row.status,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at || undefined,
        reviewedBy: row.reviewed_by || undefined,
        reviewNotes: row.review_notes || undefined,
        documents: (() => {
          try {
            return row.documents ? JSON.parse(row.documents) : undefined;
          } catch (e) {
            console.warn('⚠️ Помилка парсингу JSON для documents:', row.documents);
            return undefined;
          }
        })()
      }));

      console.log(`📋 Завантажено ${requests.length} заявок з MySQL`);
      return requests;

    } catch (error) {
      console.error('❌ Помилка читання з MySQL:', error);
      return [];
    }
  }

  static async add(request: ClubRequest): Promise<void> {
    try {
      const pool = this.getPool();
      const connection = await pool.getConnection();

      await connection.execute(`
        INSERT INTO club_requests (
          id,
          user_id,
          user_name,
          user_email,
          user_phone,
          club_name,
          club_type,
          club_address,
          club_city,
          club_region,
          club_zip_code,
          club_description,
          club_experience,
          club_legal_status,
          club_website,
          status,
          submitted_at,
          documents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        request.id,
        request.user.id,
        request.user.name,
        request.user.email,
        request.user.phone,
        request.club.name,
        request.club.type,
        request.club.address,
        request.club.city,
        request.club.region,
        request.club.zipCode,
        request.club.description,
        request.club.experience,
        request.club.legalStatus,
        request.club.website || null,
        request.status,
        request.submittedAt,
        request.documents ? JSON.stringify(request.documents) : null
      ]);

      connection.release();

      console.log(`✅ Заявка додана до MySQL: ${request.id}`);
      console.log(`📋 Заявка деталі:`, {
        id: request.id,
        clubName: request.club.name,
        status: request.status,
        userEmail: request.user.email
      });

    } catch (error) {
      console.error('❌ Помилка додавання до MySQL:', error);
      throw error;
    }
  }

  static async update(requestId: string, updates: Partial<ClubRequest>): Promise<ClubRequest | null> {
    try {
      const pool = this.getPool();
      const connection = await pool.getConnection();

      // Будуємо динамічний запит оновлення
      const updateFields = [];
      const updateValues = [];

      if (updates.status) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }

      if (updates.reviewedAt) {
        updateFields.push('reviewed_at = ?');
        updateValues.push(updates.reviewedAt);
      }

      if (updates.reviewedBy) {
        updateFields.push('reviewed_by = ?');
        updateValues.push(updates.reviewedBy);
      }

      if (updates.reviewNotes) {
        updateFields.push('review_notes = ?');
        updateValues.push(updates.reviewNotes);
      }

      if (updateFields.length === 0) {
        connection.release();
        return null;
      }

      updateValues.push(requestId);

      await connection.execute(`
        UPDATE club_requests
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, updateValues);

      // Отримуємо оновлену заявку
      const [rows] = await connection.execute(`
        SELECT * FROM club_requests WHERE id = ?
      `, [requestId]) as any[];

      connection.release();

      if (rows.length === 0) {
        console.log(`❌ Заявка не знайдена для оновлення: ${requestId}`);
        return null;
      }

      const row = rows[0];
      const updatedRequest: ClubRequest = {
        id: row.id,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          phone: row.user_phone,
          registeredAt: row.submitted_at
        },
        club: {
          name: row.club_name,
          type: row.club_type,
          address: row.club_address,
          city: row.club_city,
          region: row.club_region,
          zipCode: row.club_zip_code,
          description: row.club_description || '',
          experience: row.club_experience || '',
          legalStatus: row.club_legal_status,
          website: row.club_website || undefined
        },
        status: row.status,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at || undefined,
        reviewedBy: row.reviewed_by || undefined,
        reviewNotes: row.review_notes || undefined,
        documents: (() => {
          try {
            return row.documents ? JSON.parse(row.documents) : undefined;
          } catch (e) {
            console.warn('⚠️ Помилка парсингу JSON для documents:', row.documents);
            return undefined;
          }
        })()
      };

      console.log(`✅ Заявка оновлена в MySQL: ${requestId}`);
      return updatedRequest;

    } catch (error) {
      console.error('❌ Помилка оновлення в MySQL:', error);
      return null;
    }
  }

  static async getStats() {
    try {
      const pool = this.getPool();
      const connection = await pool.getConnection();

      const [rows] = await connection.execute(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM club_requests
      `) as any[];

      connection.release();

      const stats = {
        total: parseInt(rows[0].total),
        pending: parseInt(rows[0].pending),
        approved: parseInt(rows[0].approved),
        rejected: parseInt(rows[0].rejected)
      };

      console.log(`📊 Статистика з MySQL:`, stats);
      return stats;

    } catch (error) {
      console.error('❌ Помилка отримання статистики з MySQL:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  static async clear(): Promise<void> {
    try {
      const pool = this.getPool();
      const connection = await pool.getConnection();

      await connection.execute('DELETE FROM club_requests');

      connection.release();

      console.log('🗑️ MySQL storage для заявок очищено');

    } catch (error) {
      console.error('❌ Помилка очищення MySQL storage:', error);
      throw error;
    }
  }
}

export default ClubRequestsStorage;
