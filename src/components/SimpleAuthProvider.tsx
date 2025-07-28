"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    country?: string;
    region?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    club?: string;
    coach?: string;
    sportCategory?: string;
    experience?: string;
    specialization?: string;
    bio?: string;
    website?: string;
    socialMedia?: any;
    achievements?: string;
    competitions?: any[];
    isPublicProfile?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    emailNotifications?: boolean;
    avatar?: string;
    documents?: any[];
  };
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  updateUserData: (data: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Перевірка збереженого користувача в localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Помилка парсингу користувача з localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Перевіряємо суперадміна
      if (email === 'aerobicsua@gmail.com' && password === 'fusaf2025') {
        const superAdmin: User = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'aerobicsua@gmail.com',
          name: 'Суперадміністратор ФУСАФ',
          roles: ['admin', 'superadmin'],
          createdAt: new Date().toISOString(),
          emailVerified: true
        };

        setUser(superAdmin);
        localStorage.setItem('currentUser', JSON.stringify(superAdmin));
        console.log('✅ Суперадміністратор увійшов в систему');
        return true;
      }

      // Для інших користувачів робимо API запит до MySQL
      console.log('🔐 Спроба авторизації через API для:', email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.user) {
        const authUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          roles: data.user.roles || [],
          profile: data.user.profile ? {
            firstName: data.user.profile.firstName || '',
            lastName: data.user.profile.lastName || '',
            middleName: data.user.profile.middleName || '',
            phone: data.user.profile.phone || '',
            dateOfBirth: data.user.profile.dateOfBirth || '',
            gender: data.user.profile.gender || '',
            country: data.user.profile.country || 'Україна',
            region: data.user.profile.region || '',
            city: data.user.profile.city || '',
            address: data.user.profile.address || '',
            zipCode: data.user.profile.zipCode || '',
            club: data.user.profile.club || '',
            coach: data.user.profile.coach || '',
            sportCategory: data.user.profile.sportCategory || '',
            experience: data.user.profile.experience || '',
            specialization: data.user.profile.specialization || '',
            bio: data.user.profile.bio || '',
            website: data.user.profile.website || '',
            socialMedia: data.user.profile.socialMedia || { instagram: '', facebook: '', telegram: '' },
            achievements: data.user.profile.achievements || '',
            competitions: data.user.profile.competitions || [],
            isPublicProfile: data.user.profile.isPublicProfile ?? true,
            showEmail: data.user.profile.showEmail ?? false,
            showPhone: data.user.profile.showPhone ?? false,
            emailNotifications: data.user.profile.emailNotifications ?? true,
            avatar: data.user.profile.avatar || '',
            documents: data.user.profile.documents || []
          } : undefined,
          createdAt: data.user.createdAt,
          emailVerified: true
        };

        setUser(authUser);
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        console.log('✅ Користувач успішно авторизований:', authUser.name);
        return true;
      } else {
        console.log('❌ Невірні дані для входу:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Помилка входу:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    console.log('✅ Користувач вийшов з системи');
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      // В production тут буде API запит до MySQL для створення користувача
      console.log('📝 Реєстрація нового користувача:', data.email);
      return true;
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      return false;
    }
  };

  const updateUserData = async (data: any): Promise<boolean> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('✅ Дані користувача оновлено');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Помилка оновлення користувача:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}
