// SimpleAuth з підтримкою MySQL API
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;

  // Розширена інформація профілю
  profile?: {
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;

    // Адреса
    country: string;
    region: string;
    city: string;
    address: string;
    zipCode: string;

    // Спортивна інформація
    club: string;
    coach: string;
    sportCategory: string;
    experience: string;
    specialization: string;

    // Особиста інформація
    bio: string;
    website: string;
    socialMedia: {
      instagram: string;
      facebook: string;
      telegram: string;
    };

    // Досягнення
    achievements: string;
    competitions: Array<{
      name: string;
      date: string;
      place: string;
      category: string;
    }>;

    // Налаштування
    isPublicProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
    emailNotifications: boolean;

    // Файли
    avatar: string;
    documents: Array<{
      name: string;
      type: string;
      url: string;
    }>;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  role?: string;
}

// Валідація email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валідація пароля
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Пароль повинен містити мінімум 6 символів");
  }

  return { valid: errors.length === 0, errors };
}

// Логін через API
export async function mysqlLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔐 mysqlLogin: Логін для', email);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ mysqlLogin: Помилка відповіді API:', data.error);
      return { success: false, error: data.error || 'Помилка входу' };
    }

    if (data.success && data.user) {
      console.log('✅ mysqlLogin: Успішний логін для', email);

      // Зберігаємо користувача в localStorage для поточної сесії
      localStorage.setItem('simple-auth-user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } else {
      console.log('❌ mysqlLogin: Невдала спроба логіну');
      return { success: false, error: data.error || 'Невідома помилка' };
    }

  } catch (error) {
    console.error('❌ mysqlLogin: Помилка запиту:', error);
    return { success: false, error: 'Помилка з\'єднання з сервером' };
  }
}

// Реєстрація через API
export async function mysqlRegister(data: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    console.log('📝 mysqlRegister: Реєстрація для', data.email);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('❌ mysqlRegister: Помилка відповіді API:', result.error);
      return { success: false, error: result.error || 'Помилка реєстрації' };
    }

    if (result.success && result.user) {
      console.log('✅ mysqlRegister: Успішна реєстрація для', data.email);

      // Автоматично авторизуємо користувача після реєстрації
      localStorage.setItem('simple-auth-user', JSON.stringify(result.user));

      return { success: true, user: result.user };
    } else {
      console.log('❌ mysqlRegister: Невдала реєстрація');
      return { success: false, error: result.error || 'Невідома помилка' };
    }

  } catch (error) {
    console.error('❌ mysqlRegister: Помилка запиту:', error);
    return { success: false, error: 'Помилка з\'єднання з сервером' };
  }
}

// Оновлення профілю через API
export async function mysqlUpdateUser(updates: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Користувач не авторизований' };
    }

    console.log('💾 mysqlUpdateUser: Оновлення профілю для', currentUser.email);
    console.log('💾 mysqlUpdateUser: Дані для оновлення:', {
      hasProfile: !!updates.profile,
      profileAvatar: updates.profile?.avatar ? 'має аватар' : 'немає аватара'
    });

    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.id,
        name: updates.name,
        profile: updates.profile
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log('❌ mysqlUpdateUser: Помилка відповіді API:', result.error);
      return { success: false, error: result.error || 'Помилка оновлення профілю' };
    }

    if (result.success && result.user) {
      console.log('✅ mysqlUpdateUser: Профіль оновлено успішно');

      // Оновлюємо користувача в localStorage
      localStorage.setItem('simple-auth-user', JSON.stringify(result.user));

      return { success: true, user: result.user };
    } else {
      console.log('❌ mysqlUpdateUser: Невдале оновлення');
      return { success: false, error: result.error || 'Невідома помилка' };
    }

  } catch (error) {
    console.error('❌ mysqlUpdateUser: Помилка запиту:', error);
    return { success: false, error: 'Помилка з\'єднання з сервером' };
  }
}

// Отримати поточного користувача (з localStorage)
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem('simple-auth-user');
    if (!userData) {
      console.log('🔍 getCurrentUser: localStorage порожній');
      return null;
    }

    const user = JSON.parse(userData) as User;
    console.log('🔍 getCurrentUser: Завантажено користувача', user.email, 'avatar:', user.profile?.avatar ? 'є' : 'немає');
    return user;
  } catch (error) {
    console.error('❌ getCurrentUser: Помилка отримання користувача:', error);
    return null;
  }
}

// Скидання пароля (заглушка)
export function resetPassword(email: string): { success: boolean; message: string } {
  if (!isValidEmail(email)) {
    return { success: false, message: "Некоректний email адрес" };
  }

  // TODO: Реалізувати через API
  return {
    success: true,
    message: `Інструкції для скидання пароля надіслано на ${email}. Перевірте поштову скриньку.`
  };
}

// Зміна пароля (заглушка)
export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: "Користувач не авторизований" };
  }

  const passwordCheck = isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.errors.join(", ") };
  }

  // TODO: Реалізувати через API
  return { success: true };
}

// Вийти
export function mysqlLogout(): void {
  console.log('🚪 mysqlLogout: Виходимо з системи');

  // Очищаємо localStorage
  localStorage.removeItem('simple-auth-user');

  // TODO: Інвалідувати JWT токен на сервері

  window.location.href = '/';
}

// Перевірка ролей
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.roles.includes(role) || false;
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}

// Отримати всіх користувачів (тільки для адміністраторів)
export async function getAllUsers(): Promise<User[]> {
  const currentUser = getCurrentUser();
  if (!currentUser?.roles.includes('admin')) {
    console.warn('Доступ заборонено: тільки для адміністраторів');
    return [];
  }

  // TODO: Реалізувати через API
  return [];
}

// Видалення користувача (тільки для адміністраторів)
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser?.roles.includes('admin')) {
    return { success: false, error: "Доступ заборонено" };
  }

  if (userId === currentUser.id) {
    return { success: false, error: "Неможна видалити власний акаунт" };
  }

  // TODO: Реалізувати через API
  return { success: true };
}

// Функції для зворотної сумісності (використовують MySQL API)
export const simpleLogin = mysqlLogin;
export const simpleRegister = mysqlRegister;
export const updateUser = mysqlUpdateUser;
export const simpleLogout = mysqlLogout;
