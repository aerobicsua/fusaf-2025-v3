// 🔥 PERSISTENT STORAGE - Рішення проблеми Netlify Function Isolation
// Використовує LocalStorage браузера + API синхронізацію між сесіями

interface RoleRequest {
  id: string;
  userEmail: string;
  userName: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComment?: string;
}

const STORAGE_KEY = 'fusaf_role_requests';
const SYNC_ENDPOINT = '/api/sync-requests';

// Початкові дані
const INITIAL_DATA: RoleRequest[] = [
  {
    id: '1',
    userEmail: 'john.doe@example.com',
    userName: 'Іван Петренко',
    currentRole: 'athlete',
    requestedRole: 'club_owner',
    reason: 'Хочу відкрити власний клуб спортивної аеробіки в Києві. Маю досвід тренування та бажання розвивати цей спорт серед молоді.',
    status: 'pending',
    requestDate: '2025-01-07T10:30:00.000Z'
  },
  {
    id: '2',
    userEmail: 'coach.maria@example.com',
    userName: 'Марія Коваленко',
    currentRole: 'athlete',
    requestedRole: 'coach_judge',
    reason: 'Маю досвід тренерської роботи 5 років та хочу стати сертифікованим суддею для проведення змагань.',
    status: 'approved',
    requestDate: '2025-01-05T14:20:00.000Z',
    reviewedBy: 'andfedos@gmail.com',
    reviewDate: '2025-01-06T09:15:00.000Z',
    reviewComment: 'Схвалено. Досвід підтверджено документами.'
  },
  {
    id: '3',
    userEmail: 'trainer.alex@example.com',
    userName: 'Олександр Шевченко',
    currentRole: 'athlete',
    requestedRole: 'coach_judge',
    reason: 'Закінчив спортивний університет, маю кваліфікацію тренера з гімнастики. Хочу розширити свої можливості в аеробіці.',
    status: 'rejected',
    requestDate: '2025-01-04T16:45:00.000Z',
    reviewedBy: 'andfedos@gmail.com',
    reviewDate: '2025-01-05T11:30:00.000Z',
    reviewComment: 'Потрібні додаткові документи про кваліфікацію в аеробіці.'
  },
  {
    id: '1751971234567',
    userEmail: 'aerobicsua@gmail.com',
    userName: 'Andrii Fedosenko',
    currentRole: 'athlete',
    requestedRole: 'club_owner',
    reason: 'Хочу створити власний клуб спортивної аеробіки для розвитку цього виду спорту в Україні. Маю досвід організації спортивних заходів та роботи з молоддю.',
    status: 'pending',
    requestDate: '2025-07-08T10:45:00.000Z'
  }
];

export class PersistentStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Ініціалізація - завантажує дані з LocalStorage або створює початкові
  static initialize(): RoleRequest[] {
    if (!this.isClient()) {
      console.log('🔴 Server side - повертаємо початкові дані');
      return [...INITIAL_DATA];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('✅ Завантажено з LocalStorage:', data.length, 'запитів');
        return data;
      } else {
        console.log('🆕 Ініціалізація LocalStorage з початковими даними');
        this.save(INITIAL_DATA);
        return [...INITIAL_DATA];
      }
    } catch (error) {
      console.error('❌ Помилка ініціалізації LocalStorage:', error);
      return [...INITIAL_DATA];
    }
  }

  // Збереження в LocalStorage
  static save(requests: RoleRequest[]): void {
    if (!this.isClient()) {
      console.log('🔴 Server side - не можемо зберегти в LocalStorage');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, new Date().toISOString());
      console.log('💾 Збережено в LocalStorage:', requests.length, 'запитів');
    } catch (error) {
      console.error('❌ Помилка збереження в LocalStorage:', error);
    }
  }

  // Отримати всі запити
  static getAll(): RoleRequest[] {
    return this.initialize();
  }

  // Додати новий запит
  static add(request: RoleRequest): void {
    const requests = this.getAll();

    // Перевіряємо чи запит вже існує
    const exists = requests.find(r => r.id === request.id);
    if (!exists) {
      requests.push(request);
      this.save(requests);
      console.log('✅ Додано новий запит:', request.id);

      // Синхронізуємо з сервером
      this.syncToServer(requests);
    }
  }

  // Оновити запит
  static update(requestId: string, updates: Partial<RoleRequest>): boolean {
    const requests = this.getAll();
    const index = requests.findIndex(r => r.id === requestId);

    if (index === -1) {
      console.log('❌ Запит не знайдено:', requestId);
      return false;
    }

    // Оновлюємо запит
    requests[index] = {
      ...requests[index],
      ...updates
    };

    this.save(requests);
    console.log('✅ Оновлено запит:', requestId, 'статус:', updates.status);

    // Синхронізуємо з сервером
    this.syncToServer(requests);

    return true;
  }

  // Знайти запит за email та статусом
  static findByEmailAndStatus(email: string, status: 'pending' | 'approved' | 'rejected'): RoleRequest | null {
    const requests = this.getAll();
    const found = requests.find(r => r.userEmail === email && r.status === status);
    console.log('🔍 Пошук запиту:', email, status, '- знайдено:', !!found);
    return found || null;
  }

  // Отримати статистику
  static getStats() {
    const requests = this.getAll();
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      storageType: 'PERSISTENT_LOCALSTORAGE',
      lastUpdate: this.isClient() ? localStorage.getItem(`${STORAGE_KEY}_timestamp`) : null
    };

    console.log('📊 Статистика:', stats);
    return stats;
  }

  // Синхронізація з сервером (для інших адмінів)
  static async syncToServer(requests: RoleRequest[]): Promise<void> {
    if (!this.isClient()) return;

    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests,
          timestamp: new Date().toISOString(),
          source: 'persistent_storage'
        })
      });

      if (response.ok) {
        console.log('✅ Синхронізовано з сервером');
      } else {
        console.log('⚠️ Не вдалося синхронізувати з сервером');
      }
    } catch (error) {
      console.log('⚠️ Помилка синхронізації:', error);
      // Не критично - LocalStorage залишається основним джерелом
    }
  }

  // Синхронізація з сервера (отримання даних від інших адмінів)
  static async syncFromServer(): Promise<void> {
    if (!this.isClient()) return;

    try {
      const response = await fetch(SYNC_ENDPOINT);
      if (response.ok) {
        const data = await response.json();
        if (data.requests && Array.isArray(data.requests)) {
          this.save(data.requests);
          console.log('✅ Синхронізовано з сервера:', data.requests.length, 'запитів');
        }
      }
    } catch (error) {
      console.log('⚠️ Не вдалося синхронізувати з сервера:', error);
      // Не критично - LocalStorage залишається
    }
  }

  // Очистити дані (для тестування)
  static clear(): void {
    if (!this.isClient()) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
    console.log('🧹 LocalStorage очищено');
  }

  // Debug інформація
  static getDebugInfo() {
    const requests = this.getAll();
    const stats = this.getStats();

    return {
      message: '🔥 PERSISTENT Storage (LocalStorage + API Sync)',
      storageType: 'PERSISTENT_LOCALSTORAGE',
      compatible: 'Браузер LocalStorage + серверна синхронізація',
      explanation: {
        problem: 'Netlify serverless функції ізольовані',
        solution: 'LocalStorage як primary + API синхронізація між адмінами',
        improvement: 'Дані зберігаються в браузері адміністратора'
      },
      storage: {
        totalRequests: requests.length,
        isClient: this.isClient(),
        hasLocalStorage: this.isClient() && !!localStorage.getItem(STORAGE_KEY),
        lastUpdate: stats.lastUpdate
      },
      requests: requests.map(req => ({
        id: req.id,
        userEmail: req.userEmail,
        userName: req.userName,
        requestedRole: req.requestedRole,
        status: req.status,
        requestDate: req.requestDate,
        reason: req.reason.substring(0, 50) + '...'
      }))
    };
  }
}

export type { RoleRequest };
