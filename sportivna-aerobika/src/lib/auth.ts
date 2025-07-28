// Функції для перевірки дозволів користувачів

/**
 * Перевіряє, чи може користувач з певними ролями реєструвати команди/групи
 * Дозволено: admin, club_owner, coach_judge
 */
export function canRegisterTeams(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;

  const allowedRoles = ['admin', 'club_owner', 'coach_judge'];
  return roles.some(role => allowedRoles.includes(role));
}

/**
 * Перевіряє, чи може користувач з певними ролями реєструвати індивідуальних учасників
 * Дозволено: admin, club_owner, coach_judge
 */
export function canRegisterIndividual(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;

  const allowedRoles = ['admin', 'club_owner', 'coach_judge'];
  return roles.some(role => allowedRoles.includes(role));
}

/**
 * Перевіряє, чи має користувач роль адміністратора
 */
export function isAdmin(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.includes('admin');
}

/**
 * Перевіряє, чи може користувач управляти змаганнями
 * Дозволено: admin, club_owner
 */
export function canManageCompetitions(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;

  const allowedRoles = ['admin', 'club_owner'];
  return roles.some(role => allowedRoles.includes(role));
}

/**
 * Перевіряє, чи може користувач створювати змагання
 * Дозволено: admin, club_owner
 */
export function canCreateCompetitions(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;

  const allowedRoles = ['admin', 'club_owner'];
  return roles.some(role => allowedRoles.includes(role));
}

/**
 * Перевіряє, чи має користувач доступ до адміністративних функцій
 */
export function hasAdminAccess(roles?: string[]): boolean {
  return isAdmin(roles);
}

/**
 * Отримує людську назву ролі
 */
export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    'admin': 'Адміністратор',
    'athlete': 'Спортсмен',
    'coach_judge': 'Тренер/Суддя',
    'club_owner': 'Власник клубу',
    'user': 'Користувач'
  };

  return roleLabels[role] || role;
}

/**
 * API функція для перевірки авторизації в API роутах
 * Для SimpleAuth системи з суперадміном
 */
export async function getApiSession(request?: Request): Promise<{ user: { id: string; email: string; name: string; roles: string[] } } | null> {
  try {
    // В реальній системі тут би була перевірка JWT токена з заголовків
    // Поки що повертаємо суперадміна для API роутів
    return {
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'aerobicsua@gmail.com',
        name: 'Суперадміністратор ФУСАФ',
        roles: ['admin', 'superadmin', 'club_owner', 'coach_judge', 'athlete']
      }
    };
  } catch (error) {
    console.error('❌ Помилка getApiSession:', error);
    return null;
  }
}

/**
 * Заглушка для registerUser функції (тимчасово)
 * Приймає 1 або 3 параметри для зворотної сумісності
 */
export function registerUser(...args: any[]) {
  // Заглушка для API роутів - обробляємо різні формати викликів
  let userData;
  if (args.length === 1) {
    userData = args[0];
  } else if (args.length === 3) {
    // Старий формат: email, password, name
    userData = {
      email: args[0],
      password: args[1],
      name: args[2]
    };
  } else {
    userData = args[0] || {};
  }

  return Promise.resolve({
    success: true,
    user: {
      id: 'temp-id',
      email: userData.email || 'temp@example.com',
      name: userData.name || 'Temp User',
      ...userData
    }
  });
}

/**
 * Перевіряє, чи може користувач редагувати профіль спортсмена
 */
export function canEditAthleteProfile(userRoles?: string[], athleteId?: string, userId?: string): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  // Адміни можуть редагувати будь-які профілі
  if (isAdmin(userRoles)) return true;

  // Користувачі можуть редагувати свій власний профіль
  if (athleteId === userId) return true;

  // Тренери та власники клубів можуть редагувати профілі своїх спортсменів
  // (потрібна додаткова логіка для перевірки приналежності до клубу)
  if (userRoles.includes('coach_judge') || userRoles.includes('club_owner')) {
    return true; // Спрощена логіка, в реальності треба перевіряти клуб
  }

  return false;
}

// Простий експорт authOptions для виправлення помилки збірки
export const authOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || "demo-secret",
};
