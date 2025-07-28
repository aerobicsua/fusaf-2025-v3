// Розширена система авторизації без NextAuth
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
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  role?: string;
}

// Демо користувачі (очищено - тільки суперадмін ФУСАФ)
export const demoUsers: User[] = [
  {
    id: "2",
    email: "afedos@ukr.net",
    name: "Федосенко Марія",
    roles: ["athlete", "user"],
    createdAt: "2024-01-01",
    lastLogin: new Date().toISOString(),
    emailVerified: true,
    profile: {
      firstName: "Марія",
      lastName: "Федосенко",
      middleName: "Андріївна",
      dateOfBirth: "2011-10-19",
      gender: "female",
      phone: "+380671234567",

      // Адреса
      country: "Україна",
      region: "м. Київ",
      city: "Київ",
      address: "вул. Спортивна, 10",
      zipCode: "03150",

      // Спортивна інформація
      club: "",
      coach: "",
      sportCategory: "юний спортсмен",
      experience: "2 роки",
      specialization: "individual",

      // Особиста інформація
      bio: "Займаюся спортивною аеробікою з 2022 року. Люблю вивчати нові елементи та брати участь у змаганнях.",
      website: "",
      socialMedia: {
        instagram: "",
        facebook: "",
        telegram: ""
      },

      // Досягнення
      achievements: "",
      competitions: [],

      // Налаштування
      isPublicProfile: true,
      showEmail: false,
      showPhone: false,
      emailNotifications: true,

      // Файли
      avatar: ""
    }
  }
];

// Демо паролі (всі однакові)
export const DEMO_PASSWORD = "password123";

// Валідація email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валідація пароля (спрощена)
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Пароль повинен містити мінімум 6 символів");
  }

  return { valid: errors.length === 0, errors };
}

// Простий логін
export function simpleLogin(email: string, password: string): User | null {
  if (password !== DEMO_PASSWORD) {
    return null;
  }

  console.log('🔐 simpleLogin: Логін для', email);

  // Спочатку перевіряємо чи є збережений користувач в localStorage
  const existingUserData = localStorage.getItem('simple-auth-user');
  if (existingUserData) {
    try {
      const existingUser = JSON.parse(existingUserData) as User;
      if (existingUser.email === email) {
        console.log('🔐 simpleLogin: Знайшли збереженого користувача в localStorage');
        console.log('🔐 simpleLogin: Аватар в localStorage:', existingUser.profile?.avatar ? 'є' : 'немає');

        // Оновлюємо час останнього входу
        existingUser.lastLogin = new Date().toISOString();

        // Зберігаємо оновлені дані
        localStorage.setItem('simple-auth-user', JSON.stringify(existingUser));

        return existingUser;
      }
    } catch (error) {
      console.warn('⚠️ simpleLogin: Помилка парсингу localStorage:', error);
    }
  }

  // Якщо немає в localStorage, перевіряємо постійне сховище оновлених користувачів
  const updatedUsersKey = 'fusaf-updated-users';
  try {
    const updatedUsersData = localStorage.getItem(updatedUsersKey);
    if (updatedUsersData) {
      const updatedUsers = JSON.parse(updatedUsersData) as { [email: string]: User };
      const updatedUser = updatedUsers[email];

      if (updatedUser) {
        console.log('🔐 simpleLogin: Знайшли оновленого користувача в постійному сховищі!');
        console.log('🔐 simpleLogin: Аватар в постійному сховищі:', updatedUser.profile?.avatar ? 'є' : 'немає');

        // Оновлюємо час останнього входу
        updatedUser.lastLogin = new Date().toISOString();

        // Зберігаємо в активну сесію
        localStorage.setItem('simple-auth-user', JSON.stringify(updatedUser));

        return updatedUser;
      }
    }
  } catch (error) {
    console.warn('⚠️ simpleLogin: Помилка читання постійного сховища:', error);
  }

  // Якщо немає в постійному сховищі, берем з початкового demoUsers
  const user = demoUsers.find(u => u.email === email);
  if (!user) {
    console.log('❌ simpleLogin: Користувача не знайдено в demoUsers');
    return null;
  }

  console.log('🔐 simpleLogin: Використовуємо початкового користувача з demoUsers (без аватара)');

  // Оновлюємо час останнього входу
  user.lastLogin = new Date().toISOString();

  // Зберігаємо в localStorage
  localStorage.setItem('simple-auth-user', JSON.stringify(user));

  return user;
}

// Реєстрація нового користувача
export async function simpleRegister(data: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> {
  // Валідації
  if (!isValidEmail(data.email)) {
    return { success: false, error: "Некоректний email адрес" };
  }

  if (data.password !== data.confirmPassword) {
    return { success: false, error: "Паролі не співпадають" };
  }

  const passwordCheck = isValidPassword(data.password);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.errors.join(", ") };
  }

  if (!data.name.trim()) {
    return { success: false, error: "Ім'я обов'язкове" };
  }

  // Перевірка чи користувач вже існує
  const existingUser = demoUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existingUser) {
    return { success: false, error: "Користувач з таким email вже існує" };
  }

  // Створення нового користувача
  const newUser: User = {
    id: (demoUsers.length + 1).toString(),
    email: data.email.toLowerCase(),
    name: data.name.trim(),
    roles: [data.role || "athlete", "user"],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    emailVerified: false
  };

  // Додаємо до демо користувачів
  demoUsers.push(newUser);

  // Автоматично авторизуємо користувача після реєстрації
  localStorage.setItem('simple-auth-user', JSON.stringify(newUser));

  // Надсилаємо email підтвердження реєстрації
  try {
    const { sendRegistrationEmail } = await import('@/lib/email-service');
    const emailResult = await sendRegistrationEmail({
      name: newUser.name,
      email: newUser.email,
      role: newUser.roles[0] || 'athlete'
    });

    console.log('📧 Email статус:', emailResult);
  } catch (error) {
    console.warn('⚠️ Помилка надсилання email:', error);
    // Не блокуємо реєстрацію через помилку email
  }

  return { success: true, user: newUser };
}

// Скидання пароля (заглушка)
export function resetPassword(email: string): { success: boolean; message: string } {
  if (!isValidEmail(email)) {
    return { success: false, message: "Некоректний email адрес" };
  }

  const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { success: false, message: "Користувача з таким email не знайдено" };
  }

  return {
    success: true,
    message: `Інструкції для скидання пароля надіслано на ${email}. Перевірте поштову скриньку.`
  };
}

// Зміна пароля
export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: "Користувач не авторизований" };
  }

  if (currentPassword !== DEMO_PASSWORD) {
    return { success: false, error: "Невірний поточний пароль" };
  }

  const passwordCheck = isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.errors.join(", ") };
  }

  return { success: true };
}

// Отримати поточного користувача
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

// Оновити дані користувача
export function updateUser(updates: Partial<User>): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: "Користувач не авторизований" };
  }

  try {
    const updatedUser = { ...user, ...updates };
    console.log('💾 updateUser: Оновлюємо користувача:', {
      userId: user.id,
      email: user.email,
      hasProfile: !!updates.profile,
      profileAvatar: updates.profile?.avatar ? 'має аватар' : 'немає аватара'
    });

    // Зберігаємо в localStorage (поточна сесія)
    localStorage.setItem('simple-auth-user', JSON.stringify(updatedUser));
    console.log('💾 updateUser: Збережено в localStorage');

    // Зберігаємо в ПОСТІЙНЕ сховище оновлених користувачів
    const updatedUsersKey = 'fusaf-updated-users';
    try {
      let updatedUsers: { [email: string]: User } = {};

      const existing = localStorage.getItem(updatedUsersKey);
      if (existing) {
        updatedUsers = JSON.parse(existing);
      }

      updatedUsers[updatedUser.email] = updatedUser;
      localStorage.setItem(updatedUsersKey, JSON.stringify(updatedUsers));

      console.log('💾 updateUser: Збережено в ПОСТІЙНЕ сховище');
      console.log('💾 updateUser: Аватар в постійному сховищі:', updatedUsers[updatedUser.email].profile?.avatar ? 'є' : 'немає');
    } catch (error) {
      console.warn('⚠️ updateUser: Помилка збереження в постійне сховище:', error);
    }

    // Оновлюємо в демо списку (для поточної сесії)
    const userIndex = demoUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      demoUsers[userIndex] = updatedUser;
      console.log('💾 updateUser: Оновлено в demoUsers[' + userIndex + ']');
      console.log('💾 updateUser: Аватар в demoUsers:', demoUsers[userIndex].profile?.avatar ? 'є' : 'немає');
    } else {
      console.warn('⚠️ updateUser: Користувача не знайдено в demoUsers!', user.id);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ updateUser: Помилка оновлення користувача:', error);
    return { success: false, error: "Помилка оновлення даних" };
  }
}

// Вийти
export function simpleLogout(): void {
  console.log('🚪 simpleLogout: Виходимо з системи');

  // Перед виходом переконаємося, що всі зміни збережені ПОСТІЙНО
  const currentUser = getCurrentUser();
  if (currentUser) {
    console.log('🚪 simpleLogout: Зберігаємо останні зміни користувача ПОСТІЙНО');
    console.log('🚪 simpleLogout: Аватар користувача:', currentUser.profile?.avatar ? 'є' : 'немає');

    // Зберігаємо в постійне сховище оновлених користувачів
    const updatedUsersKey = 'fusaf-updated-users';
    let updatedUsers: { [email: string]: User } = {};

    try {
      const existing = localStorage.getItem(updatedUsersKey);
      if (existing) {
        updatedUsers = JSON.parse(existing);
      }
    } catch (error) {
      console.warn('⚠️ Помилка завантаження оновлених користувачів:', error);
    }

    // Зберігаємо оновленого користувача
    updatedUsers[currentUser.email] = currentUser;
    localStorage.setItem(updatedUsersKey, JSON.stringify(updatedUsers));

    console.log('🚪 simpleLogout: Користувача збережено в постійне сховище');
    console.log('🚪 simpleLogout: Аватар в постійному сховищі:', updatedUsers[currentUser.email].profile?.avatar ? 'є' : 'немає');
  }

  // Очищаємо тільки поточну сесію, але НЕ постійні дані
  localStorage.removeItem('simple-auth-user');
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
export function getAllUsers(): User[] {
  const currentUser = getCurrentUser();
  if (!currentUser?.roles.includes('admin')) {
    console.warn('Доступ заборонено: тільки для адміністраторів');
    return [];
  }

  return demoUsers;
}

// Видалення користувача (тільки для адміністраторів)
export function deleteUser(userId: string): { success: boolean; error?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser?.roles.includes('admin')) {
    return { success: false, error: "Доступ заборонено" };
  }

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return { success: false, error: "Користувача не знайдено" };
  }

  if (demoUsers[userIndex].id === currentUser.id) {
    return { success: false, error: "Неможна видалити власний акаунт" };
  }

  demoUsers.splice(userIndex, 1);

  return { success: true };
}
