import { supabase } from './supabase';

// Типи для звітів
export interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
}

export interface UserStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByRole: {
    athletes: number;
    coaches: number;
    judges: number;
    clubOwners: number;
  };
  userGrowth: Array<{
    date: string;
    count: number;
    role: string;
  }>;
}

export interface CompetitionStats {
  totalCompetitions: number;
  activeCompetitions: number;
  completedCompetitions: number;
  totalRegistrations: number;
  averageParticipants: number;
  competitionsByMonth: Array<{
    month: string;
    count: number;
  }>;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  averageRegistrationFee: number;
  paymentSuccess: number;
  paymentPending: number;
  paymentFailed: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface ClubStats {
  totalClubs: number;
  activeClubs: number;
  clubsByCity: Array<{
    city: string;
    count: number;
  }>;
  averageClubSize: number;
}

export interface SystemHealth {
  databaseStatus: 'healthy' | 'warning' | 'error';
  emailService: 'healthy' | 'warning' | 'error';
  authService: 'healthy' | 'warning' | 'error';
  uptime: string;
  responseTime: number;
}

// Клас для аналітики
export class AnalyticsService {

  // Отримання статистики користувачів
  static async getUserStats(period: AnalyticsData): Promise<UserStats> {
    try {
      // Загальна кількість користувачів
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, role, created_at');

      if (usersError) throw usersError;

      // Нові користувачі за період
      const { data: newUsers, error: newUsersError } = await supabase
        .from('users')
        .select('id, role, created_at')
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);

      if (newUsersError) throw newUsersError;

      // Активні користувачі (входили за останні 30 днів)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsers, error: activeError } = await supabase
        .from('users')
        .select('id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeError) throw activeError;

      // Підрахунок за ролями
      const usersByRole = {
        athletes: allUsers?.filter(u => u.role === 'athlete').length || 0,
        coaches: allUsers?.filter(u => u.role === 'coach').length || 0,
        judges: allUsers?.filter(u => u.role === 'judge').length || 0,
        clubOwners: allUsers?.filter(u => u.role === 'club_owner').length || 0,
      };

      // Ріст користувачів по днях
      const userGrowth = this.calculateUserGrowth(allUsers || []);

      return {
        totalUsers: allUsers?.length || 0,
        newUsers: newUsers?.length || 0,
        activeUsers: activeUsers?.length || 0,
        usersByRole,
        userGrowth
      };

    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Статистика змагань
  static async getCompetitionStats(period: AnalyticsData): Promise<CompetitionStats> {
    try {
      // Всі змагання
      const { data: competitions, error: competitionsError } = await supabase
        .from('competitions')
        .select('*');

      if (competitionsError) throw competitionsError;

      // Реєстрації
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select('competition_id, created_at, category');

      if (registrationsError) throw registrationsError;

      const totalCompetitions = competitions?.length || 0;
      const activeCompetitions = competitions?.filter(c =>
        c.status === 'registration_open' || c.status === 'published'
      ).length || 0;
      const completedCompetitions = competitions?.filter(c =>
        c.status === 'completed'
      ).length || 0;

      // Змагання по місяцях
      const competitionsByMonth = this.groupByMonth(competitions || [], 'created_at');

      // Популярні категорії
      const popularCategories = this.getPopularCategories(registrations || []);

      return {
        totalCompetitions,
        activeCompetitions,
        completedCompetitions,
        totalRegistrations: registrations?.length || 0,
        averageParticipants: totalCompetitions > 0 ? Math.round((registrations?.length || 0) / totalCompetitions) : 0,
        competitionsByMonth,
        popularCategories
      };

    } catch (error) {
      console.error('Error getting competition stats:', error);
      throw error;
    }
  }

  // Фінансова статистика
  static async getFinancialStats(period: AnalyticsData): Promise<FinancialStats> {
    try {
      // Всі реєстрації з платежами
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          competition:competitions(registration_fee, entry_fee)
        `)
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);

      if (error) throw error;

      // Підрахунок доходів
      let totalRevenue = 0;
      let paymentSuccess = 0;
      let paymentPending = 0;
      let paymentFailed = 0;

      registrations?.forEach(reg => {
        const fee = reg.competition?.registration_fee || 0;

        if (reg.payment_status === 'paid') {
          totalRevenue += fee;
          paymentSuccess++;
        } else if (reg.payment_status === 'pending') {
          paymentPending++;
        } else if (reg.payment_status === 'failed') {
          paymentFailed++;
        }
      });

      // Дохід по місяцях
      const revenueByMonth = this.calculateRevenueByMonth(registrations || []);

      // Поточний місяць
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = revenueByMonth.find(r =>
        new Date(r.month).getMonth() === currentMonth
      )?.revenue || 0;

      return {
        totalRevenue,
        monthlyRevenue,
        averageRegistrationFee: paymentSuccess > 0 ? Math.round(totalRevenue / paymentSuccess) : 0,
        paymentSuccess,
        paymentPending,
        paymentFailed,
        revenueByMonth
      };

    } catch (error) {
      console.error('Error getting financial stats:', error);
      throw error;
    }
  }

  // Статистика клубів
  static async getClubStats(): Promise<ClubStats> {
    try {
      const { data: clubs, error: clubsError } = await supabase
        .from('clubs')
        .select('*');

      if (clubsError) throw clubsError;

      // Кількість спортсменів в клубах
      const { data: athletes, error: athletesError } = await supabase
        .from('athlete_profiles')
        .select('club_id');

      if (athletesError) throw athletesError;

      // Клуби по містах
      const clubsByCity = this.groupByCity(clubs || []);

      // Середній розмір клубу
      const clubSizes = clubs?.map(club =>
        athletes?.filter(a => a.club_id === club.id).length || 0
      ) || [];
      const averageClubSize = clubSizes.length > 0
        ? Math.round(clubSizes.reduce((a, b) => a + b, 0) / clubSizes.length)
        : 0;

      return {
        totalClubs: clubs?.length || 0,
        activeClubs: clubs?.filter(c => c.created_at).length || 0, // TODO: додати логіку активності
        clubsByCity,
        averageClubSize
      };

    } catch (error) {
      console.error('Error getting club stats:', error);
      throw error;
    }
  }

  // Перевірка здоров'я системи
  static async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();

    try {
      // Тест бази даних
      const { error: dbError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const databaseStatus: SystemHealth['databaseStatus'] = dbError ? 'error' : 'healthy';

      // TODO: Додати тести для email service та auth service
      const emailService: SystemHealth['emailService'] = 'healthy';
      const authService: SystemHealth['authService'] = 'healthy';

      const responseTime = Date.now() - startTime;

      return {
        databaseStatus,
        emailService,
        authService,
        uptime: process.uptime().toString(),
        responseTime
      };

    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        databaseStatus: 'error',
        emailService: 'error',
        authService: 'error',
        uptime: '0',
        responseTime: Date.now() - startTime
      };
    }
  }

  // Генерація повного звіту
  static async generateFullReport(period: AnalyticsData) {
    try {
      const [userStats, competitionStats, financialStats, clubStats, systemHealth] =
        await Promise.all([
          this.getUserStats(period),
          this.getCompetitionStats(period),
          this.getFinancialStats(period),
          this.getClubStats(),
          this.getSystemHealth()
        ]);

      return {
        reportDate: new Date().toISOString(),
        period,
        userStats,
        competitionStats,
        financialStats,
        clubStats,
        systemHealth,
        summary: {
          totalUsers: userStats.totalUsers,
          newUsers: userStats.newUsers,
          totalCompetitions: competitionStats.totalCompetitions,
          totalRevenue: financialStats.totalRevenue,
          totalClubs: clubStats.totalClubs
        }
      };

    } catch (error) {
      console.error('Error generating full report:', error);
      throw error;
    }
  }

  // Допоміжні методи
  private static calculateUserGrowth(users: any[]) {
    const growth = new Map();

    users.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      const key = `${date}-${user.role}`;
      growth.set(key, (growth.get(key) || 0) + 1);
    });

    return Array.from(growth.entries()).map(([key, count]) => {
      const [date, role] = key.split('-');
      return { date, count, role };
    });
  }

  private static groupByMonth(items: any[], dateField: string) {
    const groups = new Map();

    items.forEach(item => {
      const date = new Date(item[dateField]);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      groups.set(month, (groups.get(month) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([month, count]) => ({ month, count }));
  }

  private static getPopularCategories(registrations: any[]) {
    const categories = new Map();

    registrations.forEach(reg => {
      if (reg.category) {
        categories.set(reg.category, (categories.get(reg.category) || 0) + 1);
      }
    });

    return Array.from(categories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static groupByCity(clubs: any[]) {
    const cities = new Map();

    clubs.forEach(club => {
      if (club.city) {
        cities.set(club.city, (cities.get(club.city) || 0) + 1);
      }
    });

    return Array.from(cities.entries()).map(([city, count]) => ({ city, count }));
  }

  private static calculateRevenueByMonth(registrations: any[]) {
    const revenue = new Map();

    registrations.forEach(reg => {
      if (reg.payment_status === 'paid' && reg.competition?.registration_fee) {
        const date = new Date(reg.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenue.set(month, (revenue.get(month) || 0) + reg.competition.registration_fee);
      }
    });

    return Array.from(revenue.entries()).map(([month, revenue]) => ({ month, revenue }));
  }
}

// Експорт звітних функцій
export const ReportService = {
  // Щоденний звіт
  generateDailyReport: async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return AnalyticsService.generateFullReport({
      period: 'week',
      startDate: yesterday.toISOString(),
      endDate: today.toISOString()
    });
  },

  // Тижневий звіт
  generateWeeklyReport: async () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return AnalyticsService.generateFullReport({
      period: 'week',
      startDate: weekAgo.toISOString(),
      endDate: today.toISOString()
    });
  },

  // Місячний звіт
  generateMonthlyReport: async () => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return AnalyticsService.generateFullReport({
      period: 'month',
      startDate: monthAgo.toISOString(),
      endDate: today.toISOString()
    });
  },

  // Експорт звіту в різних форматах
  exportReport: async (report: any, format: 'json' | 'csv' | 'pdf') => {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);

      case 'csv':
        return ReportService.convertToCSV(report);

      case 'pdf':
        // TODO: Реалізувати PDF генерацію
        return 'PDF export not implemented yet';

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  },

  // Конвертація в CSV
  convertToCSV: (report: any) => {
    const lines = [];
    lines.push('FUSAF Analytics Report');
    lines.push(`Generated: ${report.reportDate}`);
    lines.push('');

    // Додаємо статистику користувачів
    lines.push('User Statistics');
    lines.push(`Total Users,${report.userStats.totalUsers}`);
    lines.push(`New Users,${report.userStats.newUsers}`);
    lines.push(`Active Users,${report.userStats.activeUsers}`);
    lines.push('');

    // Додаємо статистику змагань
    lines.push('Competition Statistics');
    lines.push(`Total Competitions,${report.competitionStats.totalCompetitions}`);
    lines.push(`Active Competitions,${report.competitionStats.activeCompetitions}`);
    lines.push(`Total Registrations,${report.competitionStats.totalRegistrations}`);
    lines.push('');

    // Додаємо фінансову статистику
    lines.push('Financial Statistics');
    lines.push(`Total Revenue,${report.financialStats.totalRevenue} грн`);
    lines.push(`Monthly Revenue,${report.financialStats.monthlyRevenue} грн`);
    lines.push(`Successful Payments,${report.financialStats.paymentSuccess}`);

    return lines.join('\n');
  }
};

export default AnalyticsService;
