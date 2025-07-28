import { google } from 'googleapis';
import { supabase } from './supabase';

// Конфігурація Google API
const GOOGLE_SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Інтерфейси для експорту
export interface ExportConfig {
  title: string;
  type: 'users' | 'competitions' | 'registrations' | 'financial' | 'clubs' | 'analytics';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  includeHeaders?: boolean;
}

export interface ExportResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  error?: string;
  totalRows?: number;
}

// Клас для роботи з Google Sheets
export class GoogleSheetsService {
  private auth: any;
  private sheets: any;

  constructor() {
    // Ініціалізуємо Google Auth
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // В реальному проекті тут буде Service Account ключ
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: GOOGLE_SHEETS_SCOPES,
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    } catch (error) {
      console.error('Failed to initialize Google Sheets auth:', error);
    }
  }

  // Створення нової таблиці
  async createSpreadsheet(title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `ФУСАФ - ${title} - ${new Date().toLocaleDateString('uk-UA')}`,
            locale: 'uk_UA',
            timeZone: 'Europe/Kiev',
          },
          sheets: [{
            properties: {
              title: 'Дані',
              gridProperties: {
                rowCount: 1000,
                columnCount: 20,
              },
            },
          }],
        },
      });

      const spreadsheetId = response.data.spreadsheetId!;
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      return { spreadsheetId, spreadsheetUrl };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  // Запис даних в таблицю
  async writeData(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error writing data to spreadsheet:', error);
      throw error;
    }
  }

  // Форматування таблиці
  async formatSpreadsheet(spreadsheetId: string, sheetId = 0): Promise<void> {
    try {
      const requests = [
        // Заголовки жирним шрифтом
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.2,
                  green: 0.6,
                  blue: 1.0,
                },
                textFormat: {
                  foregroundColor: {
                    red: 1.0,
                    green: 1.0,
                    blue: 1.0,
                  },
                  bold: true,
                },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        // Автоматичний розмір колонок
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 20,
            },
          },
        },
        // Закріплення заголовка
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
    } catch (error) {
      console.error('Error formatting spreadsheet:', error);
      throw error;
    }
  }

  // Експорт користувачів
  async exportUsers(config: ExportConfig): Promise<ExportResult> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role,
          phone,
          date_of_birth,
          address,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID',
        'Email',
        'Повне ім\'я',
        'Роль',
        'Телефон',
        'Дата народження',
        'Адреса',
        'Дата реєстрації',
        'Останнє оновлення'
      ];

      const rows = users?.map(user => [
        user.id,
        user.email,
        user.full_name,
        this.translateRole(user.role),
        user.phone || '',
        user.date_of_birth || '',
        user.address || '',
        new Date(user.created_at).toLocaleDateString('uk-UA'),
        new Date(user.updated_at).toLocaleDateString('uk-UA')
      ]) || [];

      const { spreadsheetId, spreadsheetUrl } = await this.createSpreadsheet(config.title);

      const allData = [headers, ...rows];
      await this.writeData(spreadsheetId, 'A1', allData);
      await this.formatSpreadsheet(spreadsheetId);

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: rows.length
      };

    } catch (error) {
      console.error('Error exporting users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Експорт змагань
  async exportCompetitions(config: ExportConfig): Promise<ExportResult> {
    try {
      const { data: competitions, error } = await supabase
        .from('competitions')
        .select(`
          *,
          club:clubs(name),
          registrations_count:registrations(count)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID',
        'Назва',
        'Дата',
        'Час',
        'Місце',
        'Адреса',
        'Організатор',
        'Категорія',
        'Статус',
        'Реєстраційний внесок (грн)',
        'Вступний внесок (грн)',
        'Макс. учасників',
        'Кількість реєстрацій',
        'Дедлайн реєстрації',
        'Дата створення'
      ];

      const rows = competitions?.map(comp => [
        comp.id,
        comp.title,
        comp.date,
        comp.time,
        comp.location,
        comp.address,
        comp.club?.name || '',
        this.translateCategory(comp.category),
        this.translateStatus(comp.status),
        comp.registration_fee || '',
        comp.entry_fee || '',
        comp.max_participants || '',
        comp.registrations_count?.[0]?.count || 0,
        comp.registration_deadline || '',
        new Date(comp.created_at).toLocaleDateString('uk-UA')
      ]) || [];

      const { spreadsheetId, spreadsheetUrl } = await this.createSpreadsheet(config.title);

      const allData = [headers, ...rows];
      await this.writeData(spreadsheetId, 'A1', allData);
      await this.formatSpreadsheet(spreadsheetId);

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: rows.length
      };

    } catch (error) {
      console.error('Error exporting competitions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Експорт реєстрацій
  async exportRegistrations(config: ExportConfig): Promise<ExportResult> {
    try {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          user:users(full_name, email, phone),
          competition:competitions(title, date, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID',
        'Учасник',
        'Email',
        'Телефон',
        'Змагання',
        'Дата змагання',
        'Місце змагання',
        'Статус реєстрації',
        'Статус оплати',
        'Вікова група',
        'Категорія',
        'Дата реєстрації',
        'Примітки'
      ];

      const rows = registrations?.map(reg => [
        reg.id,
        reg.user?.full_name || '',
        reg.user?.email || '',
        reg.user?.phone || '',
        reg.competition?.title || '',
        reg.competition?.date || '',
        reg.competition?.location || '',
        this.translateRegistrationStatus(reg.status),
        this.translatePaymentStatus(reg.payment_status),
        reg.age_group || '',
        reg.category || '',
        new Date(reg.created_at).toLocaleDateString('uk-UA'),
        reg.notes || ''
      ]) || [];

      const { spreadsheetId, spreadsheetUrl } = await this.createSpreadsheet(config.title);

      const allData = [headers, ...rows];
      await this.writeData(spreadsheetId, 'A1', allData);
      await this.formatSpreadsheet(spreadsheetId);

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: rows.length
      };

    } catch (error) {
      console.error('Error exporting registrations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Експорт клубів
  async exportClubs(config: ExportConfig): Promise<ExportResult> {
    try {
      const { data: clubs, error } = await supabase
        .from('clubs')
        .select(`
          *,
          owner:users!clubs_owner_id_fkey(full_name, email),
          athletes_count:athlete_profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID',
        'Назва клубу',
        'Місто',
        'Адреса',
        'Телефон',
        'Email',
        'Веб-сайт',
        'Власник',
        'Email власника',
        'Рік заснування',
        'Кількість спортсменів',
        'Опис',
        'Дата реєстрації'
      ];

      const rows = clubs?.map(club => [
        club.id,
        club.name,
        club.city,
        club.address,
        club.phone || '',
        club.email || '',
        club.website || '',
        club.owner?.full_name || '',
        club.owner?.email || '',
        club.founded_year || '',
        club.athletes_count?.[0]?.count || 0,
        club.description || '',
        new Date(club.created_at).toLocaleDateString('uk-UA')
      ]) || [];

      const { spreadsheetId, spreadsheetUrl } = await this.createSpreadsheet(config.title);

      const allData = [headers, ...rows];
      await this.writeData(spreadsheetId, 'A1', allData);
      await this.formatSpreadsheet(spreadsheetId);

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: rows.length
      };

    } catch (error) {
      console.error('Error exporting clubs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Фінансовий звіт
  async exportFinancialReport(config: ExportConfig): Promise<ExportResult> {
    try {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          user:users(full_name, email),
          competition:competitions(title, registration_fee, entry_fee)
        `)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID транзакції',
        'Учасник',
        'Email',
        'Змагання',
        'Реєстраційний внесок (грн)',
        'Вступний внесок (грн)',
        'Загальна сума (грн)',
        'Дата оплати',
        'Статус',
        'Примітки'
      ];

      const rows = registrations?.map(reg => {
        const regFee = reg.competition?.registration_fee || 0;
        const entryFee = reg.competition?.entry_fee || 0;
        const total = regFee + entryFee;

        return [
          reg.id,
          reg.user?.full_name || '',
          reg.user?.email || '',
          reg.competition?.title || '',
          regFee,
          entryFee,
          total,
          new Date(reg.created_at).toLocaleDateString('uk-UA'),
          'Оплачено',
          reg.notes || ''
        ];
      }) || [];

      // Додаємо підсумки
      const totalRevenue = rows.reduce((sum, row) => sum + (row[6] as number), 0);
      rows.push([]);
      rows.push(['', '', '', '', '', '', `ЗАГАЛЬНИЙ ДОХІД: ${totalRevenue} грн`, '', '', '']);

      const { spreadsheetId, spreadsheetUrl } = await this.createSpreadsheet(config.title);

      const allData = [headers, ...rows];
      await this.writeData(spreadsheetId, 'A1', allData);
      await this.formatSpreadsheet(spreadsheetId);

      return {
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        totalRows: rows.length - 2 // Віднімаємо підсумкові рядки
      };

    } catch (error) {
      console.error('Error exporting financial report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Основна функція експорту
  async exportData(config: ExportConfig): Promise<ExportResult> {
    if (!this.sheets) {
      await this.initializeAuth();
    }

    switch (config.type) {
      case 'users':
        return this.exportUsers(config);
      case 'competitions':
        return this.exportCompetitions(config);
      case 'registrations':
        return this.exportRegistrations(config);
      case 'clubs':
        return this.exportClubs(config);
      case 'financial':
        return this.exportFinancialReport(config);
      default:
        return {
          success: false,
          error: `Невідомий тип експорту: ${config.type}`
        };
    }
  }

  // Допоміжні функції перекладу
  private translateRole(role: string): string {
    const roles = {
      'athlete': 'Спортсмен',
      'coach': 'Тренер',
      'judge': 'Суддя',
      'club_owner': 'Власник клубу'
    };
    return roles[role as keyof typeof roles] || role;
  }

  private translateCategory(category: string): string {
    const categories = {
      'professional': 'Професійна',
      'amateur': 'Аматорська',
      'junior': 'Юніорська'
    };
    return categories[category as keyof typeof categories] || category;
  }

  private translateStatus(status: string): string {
    const statuses = {
      'draft': 'Чернетка',
      'published': 'Опубліковано',
      'registration_open': 'Відкрита реєстрація',
      'registration_closed': 'Реєстрація закрита',
      'in_progress': 'Проходить',
      'completed': 'Завершено',
      'cancelled': 'Скасовано'
    };
    return statuses[status as keyof typeof statuses] || status;
  }

  private translateRegistrationStatus(status: string): string {
    const statuses = {
      'pending': 'Очікує',
      'confirmed': 'Підтверджено',
      'cancelled': 'Скасовано',
      'waitlist': 'Список очікування'
    };
    return statuses[status as keyof typeof statuses] || status;
  }

  private translatePaymentStatus(status: string): string {
    const statuses = {
      'pending': 'Очікує оплати',
      'paid': 'Оплачено',
      'failed': 'Помилка оплати',
      'refunded': 'Повернено'
    };
    return statuses[status as keyof typeof statuses] || status;
  }
}

// Експорт сервісу
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
