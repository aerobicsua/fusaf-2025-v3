import { supabase } from './supabase';
import { EmailService, EmailType } from './email';

// Типи для резервного копіювання
export interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeFiles: boolean;
  compression: boolean;
  encryption: boolean;
  notifications: {
    onSuccess: string[];
    onFailure: string[];
  };
}

export interface BackupInfo {
  id: string;
  timestamp: string;
  size: number;
  status: 'in_progress' | 'completed' | 'failed';
  type: 'full' | 'incremental';
  location: string;
  tables: string[];
  checksum: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'database' | 'api' | 'backup' | 'system';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// Класс для управління резервним копіюванням
export class BackupService {
  private static readonly BACKUP_TABLES = [
    'users',
    'clubs',
    'competitions',
    'registrations',
    'athlete_profiles',
    'coach_profiles',
    'payments'
  ];

  // Створення резервної копії
  static async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupInfo> {
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();

    try {
      await this.logSecurity({
        level: 'info',
        category: 'backup',
        message: `Starting ${type} backup`,
        details: { backupId, type }
      });

      const backupData: Record<string, any> = {};
      let totalSize = 0;

      // Створюємо резервну копію кожної таблиці
      for (const table of this.BACKUP_TABLES) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          throw new Error(`Failed to backup table ${table}: ${error.message}`);
        }

        backupData[table] = data;
        totalSize += JSON.stringify(data).length;
      }

      // Генеруємо контрольну суму
      const checksum = await this.generateChecksum(backupData);

      // Зберігаємо резервну копію (в реальному проекті це буде AWS S3, Google Cloud Storage тощо)
      const location = await this.storeBackup(backupId, backupData);

      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size: totalSize,
        status: 'completed',
        type,
        location,
        tables: this.BACKUP_TABLES,
        checksum
      };

      // Зберігаємо інформацію про резервну копію
      await this.saveBackupInfo(backupInfo);

      await this.logSecurity({
        level: 'info',
        category: 'backup',
        message: `Backup completed successfully`,
        details: { backupId, size: totalSize, checksum }
      });

      // Відправляємо повідомлення про успішне створення
      await this.notifyBackupSuccess(backupInfo);

      return backupInfo;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logSecurity({
        level: 'error',
        category: 'backup',
        message: `Backup failed: ${errorMessage}`,
        details: { backupId, error: errorMessage }
      });

      // Відправляємо повідомлення про помилку
      await this.notifyBackupFailure(backupId, errorMessage);

      throw error;
    }
  }

  // Відновлення з резервної копії
  static async restoreBackup(backupId: string): Promise<boolean> {
    try {
      await this.logSecurity({
        level: 'warning',
        category: 'backup',
        message: `Starting backup restoration`,
        details: { backupId }
      });

      const backupInfo = await this.getBackupInfo(backupId);
      if (!backupInfo) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupData = await this.loadBackup(backupInfo.location);

      // Перевіряємо контрольну суму
      const currentChecksum = await this.generateChecksum(backupData);
      if (currentChecksum !== backupInfo.checksum) {
        throw new Error('Backup integrity check failed');
      }

      // Відновлюємо дані (УВАГА: це видалить існуючі дані!)
      for (const table of this.BACKUP_TABLES) {
        if (backupData[table]) {
          // В реальному проекті тут має бути більш безпечна процедура
          const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Видаляємо всі записи

          if (error) {
            throw new Error(`Failed to clear table ${table}: ${error.message}`);
          }

          // Вставляємо дані з резервної копії
          const { error: insertError } = await supabase
            .from(table)
            .insert(backupData[table]);

          if (insertError) {
            throw new Error(`Failed to restore table ${table}: ${insertError.message}`);
          }
        }
      }

      await this.logSecurity({
        level: 'warning',
        category: 'backup',
        message: `Backup restoration completed`,
        details: { backupId }
      });

      return true;

    } catch (error) {
      await this.logSecurity({
        level: 'error',
        category: 'backup',
        message: `Backup restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { backupId, error: error instanceof Error ? error.message : 'Unknown error' }
      });

      throw error;
    }
  }

  // Отримання списку резервних копій
  static async listBackups(): Promise<BackupInfo[]> {
    try {
      // В реальному проекті це буде зберігатися в базі даних або об'єктному сховищі
      return [];
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  // Видалення старих резервних копій
  static async cleanupOldBackups(retentionDays = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const backups = await this.listBackups();
      const oldBackups = backups.filter(backup =>
        new Date(backup.timestamp) < cutoffDate
      );

      let deletedCount = 0;
      for (const backup of oldBackups) {
        try {
          await this.deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${backup.id}:`, error);
        }
      }

      await this.logSecurity({
        level: 'info',
        category: 'backup',
        message: `Cleanup completed: deleted ${deletedCount} old backups`,
        details: { deletedCount, retentionDays }
      });

      return deletedCount;

    } catch (error) {
      await this.logSecurity({
        level: 'error',
        category: 'backup',
        message: `Backup cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      throw error;
    }
  }

  // Приватні методи
  private static generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async generateChecksum(data: any): Promise<string> {
    const content = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async storeBackup(backupId: string, data: any): Promise<string> {
    // В реальному проекті тут буде збереження в AWS S3, Google Cloud Storage тощо
    const location = `backups/${backupId}.json`;
    console.log(`Storing backup to: ${location}`);
    return location;
  }

  private static async loadBackup(location: string): Promise<any> {
    // В реальному проекті тут буде завантаження з об'єктного сховища
    console.log(`Loading backup from: ${location}`);
    return {};
  }

  private static async saveBackupInfo(backupInfo: BackupInfo): Promise<void> {
    // В реальному проекті тут буде збереження в таблицю backup_logs
    console.log(`Saving backup info: ${backupInfo.id}`);
  }

  private static async getBackupInfo(backupId: string): Promise<BackupInfo | null> {
    // В реальному проекті тут буде запит до таблиці backup_logs
    console.log(`Getting backup info: ${backupId}`);
    return null;
  }

  private static async deleteBackup(backupId: string): Promise<void> {
    console.log(`Deleting backup: ${backupId}`);
  }

  private static async notifyBackupSuccess(backupInfo: BackupInfo): Promise<void> {
    try {
      await EmailService.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@fusaf.org.ua',
        type: EmailType.NEWSLETTER, // Використовуємо як системне повідомлення
        data: {
          title: '✅ Резервне копіювання успішно завершено',
          content: `
            <h3>Резервна копія створена успішно</h3>
            <ul>
              <li><strong>ID:</strong> ${backupInfo.id}</li>
              <li><strong>Час:</strong> ${new Date(backupInfo.timestamp).toLocaleString('uk-UA')}</li>
              <li><strong>Розмір:</strong> ${Math.round(backupInfo.size / 1024)} KB</li>
              <li><strong>Тип:</strong> ${backupInfo.type}</li>
              <li><strong>Таблиці:</strong> ${backupInfo.tables.join(', ')}</li>
            </ul>
          `,
          textContent: `Резервна копія ${backupInfo.id} створена успішно`,
          readMoreUrl: `${process.env.APP_URL}/admin/backups`,
          unsubscribeUrl: `${process.env.APP_URL}/admin/settings`
        }
      });
    } catch (error) {
      console.error('Failed to send backup success notification:', error);
    }
  }

  private static async notifyBackupFailure(backupId: string, errorMessage: string): Promise<void> {
    try {
      await EmailService.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@fusaf.org.ua',
        type: EmailType.NEWSLETTER,
        data: {
          title: '❌ Помилка резервного копіювання',
          content: `
            <h3>Резервне копіювання не вдалося</h3>
            <p><strong>ID:</strong> ${backupId}</p>
            <p><strong>Помилка:</strong> ${errorMessage}</p>
            <p><strong>Час:</strong> ${new Date().toLocaleString('uk-UA')}</p>
          `,
          textContent: `Резервне копіювання ${backupId} не вдалося: ${errorMessage}`,
          readMoreUrl: `${process.env.APP_URL}/admin/backups`,
          unsubscribeUrl: `${process.env.APP_URL}/admin/settings`
        }
      });
    } catch (error) {
      console.error('Failed to send backup failure notification:', error);
    }
  }

  // Логування подій безпеки
  static async logSecurity(log: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityLog: SecurityLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...log
      };

      // В реальному проекті тут буде збереження в таблицю security_logs
      console.log('Security log:', securityLog);

      // Якщо це критична помилка, відправляємо сповіщення
      if (log.level === 'critical') {
        await this.notifyCriticalEvent(securityLog);
      }

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private static async notifyCriticalEvent(log: SecurityLog): Promise<void> {
    try {
      await EmailService.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@fusaf.org.ua',
        type: EmailType.NEWSLETTER,
        data: {
          title: '🚨 Критична подія безпеки',
          content: `
            <h3>Виявлена критична подія безпеки</h3>
            <p><strong>Категорія:</strong> ${log.category}</p>
            <p><strong>Повідомлення:</strong> ${log.message}</p>
            <p><strong>Час:</strong> ${new Date(log.timestamp).toLocaleString('uk-UA')}</p>
            ${log.userId ? `<p><strong>Користувач:</strong> ${log.userId}</p>` : ''}
            ${log.ipAddress ? `<p><strong>IP адреса:</strong> ${log.ipAddress}</p>` : ''}
          `,
          textContent: `Критична подія: ${log.message}`,
          readMoreUrl: `${process.env.APP_URL}/admin/security`,
          unsubscribeUrl: `${process.env.APP_URL}/admin/settings`
        }
      });
    } catch (error) {
      console.error('Failed to send critical event notification:', error);
    }
  }
}

// Клас для моніторингу безпеки
export class SecurityService {

  // Перевірка підозрілої активності
  static async detectSuspiciousActivity(userId: string, ipAddress: string): Promise<boolean> {
    try {
      // TODO: Реалізувати логіку детекції підозрілої активності
      // - Багато невдалих спроб входу
      // - Незвичайна географічна активність
      // - Швидка зміна паролів
      // - Багато запитів за короткий час

      return false;

    } catch (error) {
      await BackupService.logSecurity({
        level: 'error',
        category: 'auth',
        message: `Failed to detect suspicious activity`,
        userId,
        ipAddress,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return false;
    }
  }

  // Перевірка сили паролю
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    // Мінімальна довжина
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push('Пароль має містити щонайменше 8 символів');
    }

    // Великі літери
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Додайте великі літери');
    }

    // Малі літери
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Додайте малі літери');
    }

    // Цифри
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Додайте цифри');
    }

    // Спеціальні символи
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Додайте спеціальні символи (!@#$%^&*)');
    }

    return {
      isValid: score >= 4,
      score,
      suggestions
    };
  }

  // Перевірка rate limiting
  static async checkRateLimit(
    identifier: string,
    action: string,
    maxRequests = 10,
    windowMs = 60000
  ): Promise<boolean> {
    try {
      // TODO: Реалізувати rate limiting з Redis або in-memory cache
      const key = `rate_limit:${action}:${identifier}`;

      // В реальному проекті тут буде перевірка кількості запитів
      return true;

    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  // Аудит дозволів користувача
  static async auditUserPermissions(userId: string): Promise<void> {
    try {
      await BackupService.logSecurity({
        level: 'info',
        category: 'auth',
        message: 'User permissions audit completed',
        userId,
        details: { auditType: 'permissions' }
      });

    } catch (error) {
      console.error('User permissions audit failed:', error);
    }
  }
}

// Автоматичні завдання
export class AutomatedTasks {

  // Планувальник резервного копіювання
  static async scheduleBackups(config: BackupConfig): Promise<void> {
    try {
      // TODO: Реалізувати cron jobs для автоматичного резервного копіювання
      console.log('Scheduling backups with config:', config);

      // В реальному проекті тут буде налаштування cron jobs
      // Наприклад, через node-cron або зовнішній планувальник

    } catch (error) {
      console.error('Failed to schedule backups:', error);
    }
  }

  // Щоденна очистка
  static async dailyCleanup(): Promise<void> {
    try {
      // Очищуємо старі резервні копії
      const deletedBackups = await BackupService.cleanupOldBackups(30);

      // Очищуємо старі логи безпеки (старше 90 днів)
      // TODO: Реалізувати очистку логів

      // Очищуємо тимчасові файли
      // TODO: Реалізувати очистку тимчасових файлів

      await BackupService.logSecurity({
        level: 'info',
        category: 'system',
        message: `Daily cleanup completed`,
        details: { deletedBackups }
      });

    } catch (error) {
      await BackupService.logSecurity({
        level: 'error',
        category: 'system',
        message: `Daily cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  // Тижневий звіт безпеки
  static async weeklySecurityReport(): Promise<void> {
    try {
      // TODO: Генерувати тижневий звіт безпеки
      // - Кількість спроб входу
      // - Нові користувачі
      // - Підозріла активність
      // - Статус резервних копій

      console.log('Generating weekly security report');

    } catch (error) {
      console.error('Failed to generate weekly security report:', error);
    }
  }
}

export default BackupService;
