// 🏆 СИСТЕМА ЧЛЕНСТВА ФУСАФ - Розширена інформація про спортсменів
// На основі FIG (International Gymnastics Federation) профілів + додаткові медіа функції

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  title?: string;
  description?: string;
  uploadDate: string;
  isProfileImage?: boolean;
  competitionId?: string; // Прив'язка до конкретного змагання
  tags?: string[];
}

interface CompetitionResult {
  id: string;
  competitionName: string;
  competitionType: 'World Championships' | 'Continental Championships' | 'National Championships' | 'Regional Championships' | 'Club Championships' | 'Other';
  date: string;
  location: string;
  venue?: string; // Назва залу/арени
  category: string; // Women Individual, Men Team, etc.
  discipline: string; // Спортивна аеробіка, Фітнес аеробіка, тощо

  // Детальні результати
  rank?: number;
  totalScore?: number;
  technicScore?: number; // Технічна оцінка
  artisticScore?: number; // Артистична оцінка
  executionScore?: number; // Виконання
  difficultyScore?: number; // Складність

  // Додаткова інформація
  participantsCount?: number; // Кількість учасників
  isPersonalBest?: boolean;
  notes?: string;

  // Медіа
  photos?: string[]; // URL фото з змагання
  videoUrl?: string; // Посилання на відео виступу

  // Система оцінювання
  judgesCount?: number;
  deductions?: number; // Зниження балів
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'medal' | 'certificate' | 'record' | 'nomination' | 'other';
  level: 'international' | 'national' | 'regional' | 'club';
  competitionResult?: string; // ID результату змагання
  photoUrl?: string;
}

interface PersonalBests {
  totalScore?: {
    score: number;
    competition: string;
    date: string;
  };
  technicScore?: {
    score: number;
    competition: string;
    date: string;
  };
  artisticScore?: {
    score: number;
    competition: string;
    date: string;
  };
}

interface AthleteStats {
  totalCompetitions: number;
  wins: number; // 1 місце
  podiums: number; // Топ-3
  averageScore: number;
  bestScore: number;
  competitionsByYear: Record<string, number>;
  medalsByType: {
    gold: number;
    silver: number;
    bronze: number;
  };
  disciplineStats: Record<string, {
    competitions: number;
    bestRank: number;
    averageScore: number;
  }>;
}

interface Athlete {
  id: string;
  // Основна інформація
  license?: string;
  title?: string; // Ms, Mr, Dr
  lastName: string;
  firstName: string;
  email: string;
  gender: 'male' | 'female';
  country: string;
  placeOfBirth?: string;
  yearOfBirth?: number;
  dateOfBirth?: string; // YYYY-MM-DD
  height?: number; // в см
  weight?: number; // в кг

  // Спортивна інформація
  disciplines: string[]; // ['Aerobic Gymnastics', 'Rhythmic Gymnastics', etc.]
  club?: string;
  coach?: string;
  coachContact?: string;
  trainingSite?: string;

  // Ліцензії та кваліфікації
  licenseLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'master';
  licenseExpiry?: string;
  qualifications?: string[];

  // Медіа та фото
  profileImage?: string;
  media: MediaItem[]; // Всі фото та відео

  // Результати змагань (розширено)
  results: CompetitionResult[];
  achievements: Achievement[];
  personalBests: PersonalBests;

  // Статистика (обчислюється автоматично)
  stats?: AthleteStats;

  // Додаткова інформація
  biography?: string;
  interests?: string[];
  languages?: string[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Системна інформація
  registrationDate: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'suspended' | 'retired';
  visibility: 'public' | 'private' | 'members-only';
}

// Дисципліни спортивної аеробіки та фітнесу
export const DISCIPLINES = [
  'Спортивна аеробіка',
  'Фітнес аеробіка',
  'Степ аеробіка',
  'Хіп-хоп аеробіка',
  'Танцювальна аеробіка'
] as const;

// Країни
export const COUNTRIES = [
  'Україна',
  'Польща',
  'Румунія',
  'Чехія',
  'Словаччина',
  'Угорщина',
  'Болгарія',
  'Інші'
] as const;

// Типи змагань
export const COMPETITION_TYPES = [
  'World Championships',
  'Continental Championships',
  'National Championships',
  'Regional Championships',
  'Club Championships',
  'Other'
] as const;

// Рівні досягнень
export const ACHIEVEMENT_LEVELS = [
  'international',
  'national',
  'regional',
  'club'
] as const;

// Глобальне сховище для спортсменів (тимчасове рішення до реальної БД)
declare global {
  var __FUSAF_ATHLETES_STORAGE__: {
    athletes: Athlete[];
    lastUpdate: string;
    instanceId: string;
  } | undefined;
}

// Демонстраційні дані спортсменів (поки не отримали реальних)
const DEMO_ATHLETES: Athlete[] = [
  {
    id: 'admin-1',
    license: 'FUSAF-ADM-001',
    title: 'Mr',
    lastName: 'Fedosenko',
    firstName: 'Andrii',
    email: 'andfedos@gmail.com',
    gender: 'male',
    country: 'Україна',
    placeOfBirth: 'Київ',
    yearOfBirth: 1985,
    height: 180,
    weight: 75,
    disciplines: ['Спортивна аеробіка'],
    club: 'ФУСАФ Адміністрація',
    coach: 'Самостійні тренування',
    licenseLevel: 'master',
    media: [
      {
        id: 'photo-admin-1',
        type: 'photo',
        url: '/images/athletes/admin-profile.jpg',
        title: 'Офіційне фото',
        uploadDate: '2020-01-01T00:00:00.000Z',
        isProfileImage: true
      }
    ],
    results: [
      {
        id: 'result-admin-1',
        competitionName: 'Чемпіонат організаторів ФУСАФ 2023',
        competitionType: 'Other',
        date: '2023-12-01',
        location: 'Київ',
        venue: 'Палац спорту',
        category: 'Адміністратори',
        discipline: 'Спортивна аеробіка',
        rank: 1,
        totalScore: 95.5,
        technicScore: 48.0,
        artisticScore: 47.5,
        participantsCount: 5,
        isPersonalBest: true,
        notes: 'Виступ присвячений розвитку федерації'
      }
    ],
    achievements: [
      {
        id: 'ach-admin-1',
        title: 'Засновник ФУСАФ',
        description: 'Створення та розвиток Федерації України зі Спортивної Аеробіки і Фітнесу',
        date: '2020-01-01',
        type: 'other',
        level: 'national'
      },
      {
        id: 'ach-admin-2',
        title: 'Організатор понад 50 змагань',
        description: 'Успішна організація національних та регіональних змагань',
        date: '2023-12-31',
        type: 'certificate',
        level: 'national'
      }
    ],
    personalBests: {
      totalScore: {
        score: 95.5,
        competition: 'Чемпіонат організаторів ФУСАФ 2023',
        date: '2023-12-01'
      }
    },
    biography: 'Адміністратор ФУСАФ, організатор змагань та розвитку спортивної аеробіки в Україні. Створив сучасну систему управління федерацією та впровадив цифрові технології в спорт.',
    interests: ['Спортивні технології', 'Організація змагань', 'Розвиток спорту'],
    languages: ['Українська', 'Англійська', 'Російська'],
    socialMedia: {
      instagram: '@fusaf_ukraine',
      facebook: 'FUSAF.Ukraine'
    },
    registrationDate: '2020-01-01T00:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    status: 'active',
    visibility: 'public'
  }
];

function initializeAthletesStorage(): void {
  if (!global.__FUSAF_ATHLETES_STORAGE__) {
    global.__FUSAF_ATHLETES_STORAGE__ = {
      athletes: [...DEMO_ATHLETES],
      lastUpdate: new Date().toISOString(),
      instanceId: `athletes-${Date.now()}`
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('🏆 Athletes Storage ініціалізовано:', {
        athletes: global.__FUSAF_ATHLETES_STORAGE__.athletes.length,
        instanceId: global.__FUSAF_ATHLETES_STORAGE__.instanceId
      });
    }
  }
}

// Допоміжні функції для обчислення статистики
function calculateAthleteStats(athlete: Athlete): AthleteStats {
  const results = athlete.results;

  const stats: AthleteStats = {
    totalCompetitions: results.length,
    wins: results.filter(r => r.rank === 1).length,
    podiums: results.filter(r => r.rank && r.rank <= 3).length,
    averageScore: 0,
    bestScore: 0,
    competitionsByYear: {},
    medalsByType: { gold: 0, silver: 0, bronze: 0 },
    disciplineStats: {}
  };

  // Середній та найкращий бал
  const scoresWithValues = results.filter(r => r.totalScore);
  if (scoresWithValues.length > 0) {
    stats.averageScore = scoresWithValues.reduce((sum, r) => sum + (r.totalScore || 0), 0) / scoresWithValues.length;
    stats.bestScore = Math.max(...scoresWithValues.map(r => r.totalScore || 0));
  }

  // Медалі
  results.forEach(result => {
    if (result.rank === 1) stats.medalsByType.gold++;
    else if (result.rank === 2) stats.medalsByType.silver++;
    else if (result.rank === 3) stats.medalsByType.bronze++;

    // По рокам
    const year = new Date(result.date).getFullYear().toString();
    stats.competitionsByYear[year] = (stats.competitionsByYear[year] || 0) + 1;

    // По дисциплінах
    const discipline = result.discipline;
    if (!stats.disciplineStats[discipline]) {
      stats.disciplineStats[discipline] = {
        competitions: 0,
        bestRank: Number.POSITIVE_INFINITY,
        averageScore: 0
      };
    }

    stats.disciplineStats[discipline].competitions++;
    if (result.rank && result.rank < stats.disciplineStats[discipline].bestRank) {
      stats.disciplineStats[discipline].bestRank = result.rank;
    }
  });

  // Середній бал по дисциплінах
  Object.keys(stats.disciplineStats).forEach(discipline => {
    const disciplineResults = results.filter(r => r.discipline === discipline && r.totalScore);
    if (disciplineResults.length > 0) {
      stats.disciplineStats[discipline].averageScore =
        disciplineResults.reduce((sum, r) => sum + (r.totalScore || 0), 0) / disciplineResults.length;
    }
  });

  return stats;
}

export const AthletesStorage = {
  // Отримати всіх спортсменів
  getAll(): Athlete[] {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    if (process.env.NODE_ENV !== 'production') {
      console.log('🏆 AthletesStorage.getAll():', {
        count: storage.athletes.length,
        lastUpdate: storage.lastUpdate,
        instanceId: storage.instanceId
      });
    }

    return [...storage.athletes];
  },

  // Знайти спортсмена за ID
  findById(id: string): Athlete | null {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;
    const athlete = storage.athletes.find(athlete => athlete.id === id);

    if (athlete) {
      // Обчислюємо статистику при кожному запиті
      athlete.stats = calculateAthleteStats(athlete);
    }

    return athlete || null;
  },

  // Знайти спортсмена за email
  findByEmail(email: string): Athlete | null {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;
    return storage.athletes.find(athlete => athlete.email === email) || null;
  },

  // Додати нового спортсмена
  add(athlete: Athlete): void {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    // Перевіряємо чи спортсмен вже існує
    const exists = storage.athletes.find(a => a.id === athlete.id || a.email === athlete.email);
    if (!exists) {
      // Додаємо значення за замовчуванням
      const newAthlete: Athlete = {
        ...athlete,
        media: athlete.media || [],
        results: athlete.results || [],
        achievements: athlete.achievements || [],
        personalBests: athlete.personalBests || {},
        registrationDate: athlete.registrationDate || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: athlete.status || 'active',
        visibility: athlete.visibility || 'public'
      };

      // Обчислюємо статистику
      newAthlete.stats = calculateAthleteStats(newAthlete);

      storage.athletes.push(newAthlete);
      storage.lastUpdate = new Date().toISOString();

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ AthletesStorage.add() додав спортсмена:', {
          id: athlete.id,
          name: `${athlete.firstName} ${athlete.lastName}`,
          total: storage.athletes.length
        });
      }
    }
  },

  // Оновити інформацію про спортсмена
  update(id: string, updates: Partial<Athlete>): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const index = storage.athletes.findIndex(a => a.id === id);
    if (index === -1) return false;

    storage.athletes[index] = {
      ...storage.athletes[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // Перераховуємо статистику після оновлення
    storage.athletes[index].stats = calculateAthleteStats(storage.athletes[index]);

    storage.lastUpdate = new Date().toISOString();

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ AthletesStorage.update() оновив спортсмена:', {
        id,
        name: `${storage.athletes[index].firstName} ${storage.athletes[index].lastName}`
      });
    }

    return true;
  },

  // Додати медіа до спортсмена
  addMedia(athleteId: string, media: MediaItem): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const index = storage.athletes.findIndex(a => a.id === athleteId);
    if (index === -1) return false;

    if (!storage.athletes[index].media) {
      storage.athletes[index].media = [];
    }

    storage.athletes[index].media.push(media);
    storage.athletes[index].lastUpdated = new Date().toISOString();
    storage.lastUpdate = new Date().toISOString();

    console.log('📸 Додано медіа:', { athleteId, mediaId: media.id, type: media.type });
    return true;
  },

  // Додати результат змагання
  addResult(athleteId: string, result: CompetitionResult): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const index = storage.athletes.findIndex(a => a.id === athleteId);
    if (index === -1) return false;

    storage.athletes[index].results.push(result);

    // Оновлюємо персональні рекорди
    const athlete = storage.athletes[index];
    if (result.totalScore) {
      if (!athlete.personalBests.totalScore || result.totalScore > athlete.personalBests.totalScore.score) {
        athlete.personalBests.totalScore = {
          score: result.totalScore,
          competition: result.competitionName,
          date: result.date
        };
        result.isPersonalBest = true;
      }
    }

    // Перераховуємо статистику
    athlete.stats = calculateAthleteStats(athlete);
    athlete.lastUpdated = new Date().toISOString();
    storage.lastUpdate = new Date().toISOString();

    console.log('🏅 Додано результат:', { athleteId, resultId: result.id, competition: result.competitionName });
    return true;
  },

  // Оновити результат змагання
  updateResult(athleteId: string, resultId: string, updates: Partial<CompetitionResult>): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const athleteIndex = storage.athletes.findIndex(a => a.id === athleteId);
    if (athleteIndex === -1) return false;

    const resultIndex = storage.athletes[athleteIndex].results.findIndex(r => r.id === resultId);
    if (resultIndex === -1) return false;

    storage.athletes[athleteIndex].results[resultIndex] = {
      ...storage.athletes[athleteIndex].results[resultIndex],
      ...updates
    };

    // Перераховуємо статистику та рекорди
    const athlete = storage.athletes[athleteIndex];
    athlete.stats = calculateAthleteStats(athlete);
    athlete.lastUpdated = new Date().toISOString();
    storage.lastUpdate = new Date().toISOString();

    console.log('✏️ Оновлено результат:', { athleteId, resultId });
    return true;
  },

  // Видалити результат змагання
  deleteResult(athleteId: string, resultId: string): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const athleteIndex = storage.athletes.findIndex(a => a.id === athleteId);
    if (athleteIndex === -1) return false;

    const resultIndex = storage.athletes[athleteIndex].results.findIndex(r => r.id === resultId);
    if (resultIndex === -1) return false;

    storage.athletes[athleteIndex].results.splice(resultIndex, 1);

    // Перераховуємо статистику
    const athlete = storage.athletes[athleteIndex];
    athlete.stats = calculateAthleteStats(athlete);
    athlete.lastUpdated = new Date().toISOString();
    storage.lastUpdate = new Date().toISOString();

    console.log('🗑️ Видалено результат:', { athleteId, resultId });
    return true;
  },

  // Видалити спортсмена
  remove(id: string): boolean {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    const index = storage.athletes.findIndex(a => a.id === id);
    if (index === -1) return false;

    const removed = storage.athletes.splice(index, 1)[0];
    storage.lastUpdate = new Date().toISOString();

    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️ AthletesStorage.remove() видалив спортсмена:', {
        id,
        name: `${removed.firstName} ${removed.lastName}`
      });
    }

    return true;
  },

  // Фільтрувати спортсменів
  filter(filters: {
    discipline?: string;
    country?: string;
    license?: string;
    surname?: string;
    status?: string;
  }): Athlete[] {
    const athletes = this.getAll();

    return athletes.filter(athlete => {
      if (filters.discipline && filters.discipline !== 'all') {
        if (!athlete.disciplines.includes(filters.discipline)) return false;
      }

      if (filters.country && filters.country !== 'all') {
        if (athlete.country !== filters.country) return false;
      }

      if (filters.license) {
        if (!athlete.license?.toLowerCase().includes(filters.license.toLowerCase())) return false;
      }

      if (filters.surname) {
        if (!athlete.lastName.toLowerCase().includes(filters.surname.toLowerCase())) return false;
      }

      if (filters.status && filters.status !== 'all') {
        if (athlete.status !== filters.status) return false;
      }

      return true;
    });
  },

  // Очистити всіх спортсменів (крім адміна)
  clearExceptAdmin(): void {
    initializeAthletesStorage();
    const storage = global.__FUSAF_ATHLETES_STORAGE__!;

    // Залишаємо тільки адміна
    const adminAthlete = storage.athletes.find(a => a.email === 'andfedos@gmail.com');
    storage.athletes = adminAthlete ? [adminAthlete] : [];
    storage.lastUpdate = new Date().toISOString();

    console.log('🧹 AthletesStorage.clearExceptAdmin() видалив всіх крім адміна');
  },

  // Статистика
  getStats() {
    const athletes = this.getAll();
    return {
      total: athletes.length,
      active: athletes.filter(a => a.status === 'active').length,
      inactive: athletes.filter(a => a.status === 'inactive').length,
      suspended: athletes.filter(a => a.status === 'suspended').length,
      retired: athletes.filter(a => a.status === 'retired').length,
      byDiscipline: DISCIPLINES.reduce((acc, discipline) => {
        acc[discipline] = athletes.filter(a => a.disciplines.includes(discipline)).length;
        return acc;
      }, {} as Record<string, number>),
      byCountry: COUNTRIES.reduce((acc, country) => {
        acc[country] = athletes.filter(a => a.country === country).length;
        return acc;
      }, {} as Record<string, number>),
      totalCompetitions: athletes.reduce((sum, a) => sum + a.results.length, 0),
      totalMedia: athletes.reduce((sum, a) => sum + a.media.length, 0),
      storageType: 'ATHLETES_STORAGE_EXTENDED',
      lastUpdate: global.__FUSAF_ATHLETES_STORAGE__?.lastUpdate || new Date().toISOString(),
      instanceId: global.__FUSAF_ATHLETES_STORAGE__?.instanceId || 'not-initialized'
    };
  }
};

export type { Athlete, CompetitionResult, MediaItem, Achievement, PersonalBests, AthleteStats };
