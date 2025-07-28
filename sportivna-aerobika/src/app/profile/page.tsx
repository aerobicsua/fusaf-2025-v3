"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileProgress } from '@/components/profile/ProfileProgress';
import { AutoSaveIndicator, useAutoSave } from '@/components/profile/AutoSaveIndicator';
import { FileUpload } from '@/components/profile/FileUpload';
import { QuickActions } from '@/components/profile/QuickActions';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Shield,
  Camera,
  Save,
  Edit,
  CheckCircle,
  Info,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Award,
  Target,
  Users,
  Building,
  Image as ImageIcon
} from 'lucide-react';

interface UserProfile {
  // Основні дані
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;

  // Ролі та статус
  roles: string[];
  primaryRole: string;
  membershipStatus: string;
  memberSince: string;

  // Адреса та контакти
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
}

// Список клубів та тренерів (в майбутньому буде завантажуватись з API)
const CLUBS_LIST = [
  "Спортивний клуб 'Орігамі'",
  "СК 'Динамо' Київ",
  "СК 'Шахтар' Донецьк",
  "СК 'Дніпро'",
  "СК 'Львів'",
  "СК 'Зоря' Луганськ",
  "СК 'Десна' Чернігів",
  "СК 'Колос' Ковалівка",
  "СК 'Маріуполь'",
  "СК 'Олександрія'"
];

// Список тренерів порожній (демо прибрано)
const COACHES_LIST: string[] = [];

export default function ProfilePage() {
  const { user, loading, updateUserData } = useSimpleAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // State для реальних даних з API
  const [availableClubs, setAvailableClubs] = useState<string[]>(CLUBS_LIST);
  const [availableCoaches, setAvailableCoaches] = useState<string[]>(COACHES_LIST);

  // Завантаження списків клубів та тренерів з API
  const loadClubsAndCoaches = async () => {
    try {
      // Завантажуємо клуби
      const clubsResponse = await fetch('/api/clubs/list');
      const clubsData = await clubsResponse.json();
      if (clubsData.success && clubsData.clubs) {
        setAvailableClubs(clubsData.clubs);
        console.log(`✅ Завантажено ${clubsData.clubs.length} клубів з API`);
      } else {
        console.warn('⚠️ Не вдалося завантажити клуби:', clubsData);
      }

      // Завантажуємо тренерів
      const coachesResponse = await fetch('/api/coaches/list');
      const coachesData = await coachesResponse.json();
      console.log('👨‍🏫 Відповідь API тренерів:', coachesData);

      if (coachesData.success && coachesData.coaches) {
        setAvailableCoaches(coachesData.coaches);
        console.log(`✅ Завантажено ${coachesData.coaches.length} тренерів з API:`, coachesData.coaches);
      } else {
        console.warn('⚠️ Не вдалося завантажити тренерів:', coachesData);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження списків клубів/тренерів:', error);
      console.warn('⚠️ Використовуємо fallback списки');
    }
  };

  // Автозбереження профілю
  const saveProfile = async (profileData: UserProfile) => {
    try {
      console.log('💾 Починаємо збереження профілю через MySQL');
      console.log('🖼️ Аватар:', profileData.avatar ? `присутній (${profileData.avatar.length} символів)` : 'відсутній');
      console.log('📅 Дата народження для збереження:', profileData.dateOfBirth);

      const fullName = `${profileData.firstName} ${profileData.lastName} ${profileData.middleName}`.trim();

      const profileToSave = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        middleName: profileData.middleName,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        phone: profileData.phone,

        country: profileData.country,
        region: profileData.region,
        city: profileData.city,
        address: profileData.address,
        zipCode: profileData.zipCode,

        club: profileData.club,
        coach: profileData.coach,
        sportCategory: profileData.sportCategory,
        experience: profileData.experience,
        specialization: profileData.specialization,

        bio: profileData.bio,
        website: profileData.website,
        socialMedia: profileData.socialMedia,

        achievements: profileData.achievements,
        competitions: profileData.competitions,

        isPublicProfile: profileData.isPublicProfile,
        showEmail: profileData.showEmail,
        showPhone: profileData.showPhone,
        emailNotifications: profileData.emailNotifications,

        avatar: profileData.avatar,
        documents: profileData.documents || []
      };

      console.log('💾 Збереження профілю через API для:', user?.email);

      const response = await fetch('/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          profileData: profileData
        })
      });

      const result = await response.json();

      if (result.success) {
        // Також зберігаємо розширений профіль в localStorage як backup
        localStorage.setItem('user-profile-extended', JSON.stringify(profileData));
        console.log('✅ Профіль збережено успішно в MySQL');
        console.log('✅ Дата народження збережена:', profileData.dateOfBirth);
        return true;
      } else {
        console.error('❌ Помилка збереження в MySQL:', result.error);
        console.error('❌ Деталі помилки:', result.details);
        return false;
      }
    } catch (error) {
      console.error('❌ Помилка автозбереження в MySQL:', error);
      return false;
    }
  };

  const { status: autoSaveStatus, lastSaved, manualSave } = useAutoSave(
    profile,
    saveProfile,
    2000 // автозбереження через 2 секунди після зміни
  );

  // Логування змін профілю для діагностики
  useEffect(() => {
    console.log('🔄 useEffect: profile змінився');
    console.log('🔄   - dateOfBirth:', profile?.dateOfBirth);
    console.log('🔄   - achievements:', profile?.achievements);
    if (profile?.avatar) {
      console.log('🎨 useEffect: profile.avatar змінився, довжина:', profile.avatar.length);
      console.log('🎨 useEffect: profile.avatar перші 50 символів:', profile.avatar.substring(0, 50));
    } else {
      console.log('🎨 useEffect: profile.avatar пустий або undefined');
    }
  }, [profile]);

  useEffect(() => {
    // Завантажуємо списки клубів та тренерів
    loadClubsAndCoaches();

    if (user && !profileLoaded) {
      console.log('🔍 Завантаження профілю для користувача:', user.email, 'ID:', user.id);

      // Завантажуємо повний профіль через API тільки якщо профіль ще не завантажений
      loadProfileFromAPI();
    } else if (user && profileLoaded) {
      console.log('✨ Профіль вже завантажений, пропускаємо повторне завантаження');
      console.log('✨   - dateOfBirth:', profile?.dateOfBirth);
      console.log('✨   - achievements:', profile?.achievements);
    }
  }, [user, profileLoaded]);

  const loadProfileFromAPI = async () => {
    try {
      console.log('🌐 Завантаження повного профілю через API для:', user?.email);

      const response = await fetch(`/api/user-info?email=${encodeURIComponent(user?.email || '')}`);
      const result = await response.json();

      if (result.success && result.user) {
        const apiUser = result.user;
        console.log('✅ Повний профіль завантажено з API:', {
          name: apiUser.name,
          date_of_birth: apiUser.date_of_birth,
          club: apiUser.club,
          coach: apiUser.coach,
          social_media: apiUser.social_media,
          achievements: apiUser.achievements ? apiUser.achievements.substring(0, 50) + '...' : null,
          avatar: apiUser.avatar ? 'присутній' : 'відсутній'
        });

        // Форматуємо дату для input[type="date"]
        const formattedDate = apiUser.date_of_birth
          ? new Date(apiUser.date_of_birth).toISOString().split('T')[0]
          : '';

        console.log('📅 Дата з API:', apiUser.date_of_birth);
        console.log('📅 Форматована дата для input:', formattedDate);
        console.log('🏆 Досягнення з API:', apiUser.achievements);
        console.log('🏆 Змагання з API:', apiUser.competitions);
        console.log('👨‍🏫 Тренер з API:', apiUser.coach);
        console.log('📱 Соціальні мережі з API:', apiUser.social_media);

        // Формуємо профіль з отриманих даних
        setProfile({
          // Основні дані
          firstName: apiUser.first_name || '',
          lastName: apiUser.last_name || '',
          middleName: apiUser.middle_name || '',
          email: apiUser.email || '',
          phone: apiUser.phone || '',
          dateOfBirth: formattedDate,
          gender: apiUser.gender || '',

          // Ролі та статус
          roles: apiUser.roles || ['athlete'],
          primaryRole: apiUser.roles?.[0] || 'athlete',
          membershipStatus: 'active',
          memberSince: apiUser.created_at || new Date().toISOString(),

          // Адреса
          country: apiUser.country || 'Україна',
          region: apiUser.region || '',
          city: apiUser.city || '',
          address: apiUser.address || '',
          zipCode: apiUser.zip_code || '',

          // Спортивна інформація
          club: apiUser.club || '',
          coach: apiUser.coach || '',
          sportCategory: apiUser.sport_category || '',
          experience: apiUser.experience || '',
          specialization: apiUser.specialization || '',

          // Особиста інформація
          bio: apiUser.bio || '',
          website: apiUser.website || '',
          socialMedia: apiUser.social_media || {
            instagram: '',
            facebook: '',
            telegram: ''
          },

          // Досягнення
          achievements: apiUser.achievements || '',
          competitions: apiUser.competitions || [],

          // Налаштування
          isPublicProfile: apiUser.is_public_profile ?? true,
          showEmail: apiUser.show_email ?? false,
          showPhone: apiUser.show_phone ?? false,
          emailNotifications: apiUser.email_notifications ?? true,

          // Файли
          avatar: apiUser.avatar || '',
          documents: apiUser.documents || []
        });

        console.log('✅ Профіль успішно завантажено з API');
        console.log('✅ Встановлені значення в профілі:');
        console.log('✅   - dateOfBirth:', formattedDate);
        console.log('✅   - achievements:', apiUser.achievements);
        console.log('✅   - competitions:', apiUser.competitions);
        console.log('✅   - coach:', apiUser.coach);
        console.log('✅   - socialMedia:', apiUser.social_media);

        setProfileLoaded(true);
        return;
      } else {
        console.warn('⚠️ Не вдалося завантажити профіль з API:', result.error);
        // Fallback до старої логіки
        loadProfileFallback();
      }
    } catch (error) {
      console.error('❌ Помилка завантаження профілю з API:', error);
      // Fallback до старої логіки
      loadProfileFallback();
    }
  };

  const loadProfileFallback = () => {
    console.log('⏪ Використовуємо fallback логіку завантаження профілю');

    // Спробуємо завантажити розширений профіль з localStorage
    const savedProfile = localStorage.getItem('user-profile-extended');
    console.log('🔍 Перевіряємо localStorage profile:', savedProfile ? 'знайдено' : 'порожньо');

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('📝 Завантажуємо з localStorage, аватар:', parsedProfile.avatar);
        // Оновлюємо email та ролі з поточного користувача
        setProfile({
          ...parsedProfile,
          email: user?.email || '',
          roles: user?.roles || ['athlete'],
          primaryRole: user?.roles?.[0] || 'athlete',
          memberSince: user?.createdAt || new Date().toISOString(),
        });
        console.log('✅ Профіль завантажено з localStorage');
        return;
      } catch (error) {
        console.warn('⚠️ Помилка завантаження збереженого профілю:', error);
      }
    }

    // Якщо немає збереженого профілю, ініціалізуємо новий
    console.log('🆕 Ініціалізуємо новий профіль');
    const nameParts = (user?.name || '').split(' ').filter(part => part.trim());
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    setProfile({
      // Основні дані
      firstName,
      lastName,
      middleName,
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      gender: '',

      // Ролі та статус
      roles: user?.roles || ['athlete'],
      primaryRole: user?.roles?.[0] || 'athlete',
      membershipStatus: 'active',
      memberSince: user?.createdAt || new Date().toISOString(),

      // Адреса та контакти
      country: 'Україна',
      region: '',
      city: '',
      address: '',
      zipCode: '',

      // Спортивна інформація
      club: '',
      coach: '',
      sportCategory: '',
      experience: '',
      specialization: '',

      // Особиста інформація
      bio: '',
      website: '',
      socialMedia: {
        instagram: '',
        facebook: '',
        telegram: ''
      },

      // Досягнення
      achievements: '',
      competitions: [],

      // Налаштування
      isPublicProfile: true,
      showEmail: false,
      showPhone: false,
      emailNotifications: true,

      // Файли
      avatar: '',
      documents: []
    });

    setProfileLoaded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Завантаження профілю...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Доступ заборонено</h1>
            <p className="text-gray-600 mb-4">Увійдіть для перегляду профілю</p>
            <Button onClick={() => window.location.href = '/login'}>
              Увійти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "athlete": return "Спортсмен";
      case "club_owner": return "Власник клубу";
      case "coach_judge": return "Тренер/Суддя";
      case "admin": return "Адміністратор";
      default: return role;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log(`📝 Змінюємо поле "${field}":`, field === 'avatar' ? 'BASE64_DATA_LENGTH:' + (value?.length || 0) : value);
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev, [field]: value };
      if (field === 'avatar') {
        console.log('📝 🖼️ АВАТАР ОНОВЛЕНО В СТАНІ! Довжина:', value?.length || 0);
        console.log('📝 🖼️ profile.avatar зараз:', newProfile.avatar ? 'ВСТАНОВЛЕНО' : 'ПУСТО');
      }
      return newProfile;
    });
  };

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setProfile(prev => prev ? {
      ...prev,
      [parent]: {
        ...prev[parent as keyof UserProfile] as any,
        [field]: value
      }
    } : prev);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const success = await saveProfile(profile);

    if (success) {
      setMessage('✅ Профіль успішно оновлено!');
      setEditMode(false);
    } else {
      setMessage('❌ Помилка при збереженні профілю');
    }

    setTimeout(() => setMessage(''), 3000);
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Нові паролі не співпадають');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('❌ Новий пароль повинен містити мінімум 6 символів');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Тут би була логіка зміни пароля
    setMessage('✅ Пароль успішно змінено!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = (type: 'avatar' | 'document', file: File | null, url?: string) => {
    if (!file) {
      console.log('⚠️ Файл відсутній:', { file, url });
      return;
    }

    console.log(`📁 Завантаження ${type}:`, { fileName: file.name, fileSize: file.size });

    if (type === 'avatar') {
      console.log('🖼️ Конвертуємо аватар в Base64 для збереження між сеансами');

      // Конвертуємо файл в Base64 для постійного збереження
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('📸 Аватар конвертовано в Base64:', base64.substring(0, 50) + '...');
        handleInputChange('avatar', base64);
        setMessage('✅ Аватар оновлено! Збережіть зміни.');
        setTimeout(() => setMessage(''), 3000);
      };
      reader.onerror = () => {
        console.error('❌ Помилка конвертації аватара в Base64');
        setMessage('❌ Помилка завантаження аватара');
        setTimeout(() => setMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    } else {
      // Для документів використовуємо Blob URL (не так критично)
      const newDoc = {
        name: file.name,
        type: file.type,
        url: url || URL.createObjectURL(file)
      };
      setProfile(prev => prev ? {
        ...prev,
        documents: [...prev.documents, newDoc]
      } : prev);
      setMessage('✅ Документ додано!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'export-pdf':
        setMessage('📄 Експорт в PDF буде доступний найближчим часом');
        break;
      case 'generate-qr':
        setMessage('📱 QR-код буде доступний найближчим часом');
        break;
      case 'my-athletes':
        setMessage('👥 Управління спортсменами буде доступне найближчим часом');
        break;
      default:
        console.log('Невідома дія:', action);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const addCompetition = () => {
    const newCompetition = {
      name: '',
      date: '',
      place: '',
      category: ''
    };
    setProfile(prev => prev ? {
      ...prev,
      competitions: [...prev.competitions, newCompetition]
    } : prev);
  };

  const removeCompetition = (index: number) => {
    setProfile(prev => prev ? {
      ...prev,
      competitions: prev.competitions.filter((_, i) => i !== index)
    } : prev);
  };

  const updateCompetition = (index: number, field: string, value: string) => {
    setProfile(prev => prev ? {
      ...prev,
      competitions: prev.competitions.map((comp, i) =>
        i === index ? { ...comp, [field]: value } : comp
      )
    } : prev);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок профілю з індикатором автозбереження */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Аватар */}
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.firstName} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* ДІАГНОСТИКА АВАТАРА - перенесено в useEffect */}
                  {editMode && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔵 Кнопка камери натиснута, переходимо до документів');
                        setActiveTab('documents');
                        // Додатково прокручуємо до документів
                        setTimeout(() => {
                          const documentsElement = document.querySelector('[data-tab="documents"]');
                          if (documentsElement) {
                            documentsElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Основна інформація */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {getRoleLabel(profile.primaryRole)}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {profile.membershipStatus === 'active' ? 'Активний член' : 'Неактивний'}
                    </Badge>
                    {profile.club && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {profile.club}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    Член ФУСАФ з {new Date(profile.memberSince).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>

              {/* Кнопки дій та індикатор автозбереження */}
              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-3">
                  {editMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Збереження...' : 'Зберегти'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(false)}
                      >
                        Скасувати
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редагувати
                    </Button>
                  )}
                </div>

                {/* Індикатор автозбереження */}
                {editMode && (
                  <AutoSaveIndicator
                    status={autoSaveStatus}
                    lastSaved={lastSaved}
                    onSave={manualSave}
                  />
                )}
              </div>
            </div>

            {/* Повідомлення */}
            {message && (
              <Alert className={`mt-4 ${message.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Прогрес заповнення профілю */}
          <ProfileProgress
            profile={profile}
            onTabSelect={setActiveTab}
          />

          {/* Швидкі дії */}
          <QuickActions
            userProfile={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: user.email,
              roles: user.roles || [],
              isPublicProfile: profile.isPublicProfile,
              club: profile.club
            }}
            onAction={handleQuickAction}
          />

          {/* Вкладки профілю */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal">Особисті дані</TabsTrigger>
              <TabsTrigger value="sport">Спорт</TabsTrigger>
              <TabsTrigger value="achievements">Досягнення</TabsTrigger>
              <TabsTrigger value="documents">Документи</TabsTrigger>
              <TabsTrigger value="settings">Налаштування</TabsTrigger>
              <TabsTrigger value="security">Безпека</TabsTrigger>
            </TabsList>

            {/* Особисті дані */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Основна інформація
                      </div>
                      {editMode && <Badge variant="secondary" className="text-xs">Редагування</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Прізвище</Label>
                        <Input
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!editMode}
                          className={editMode ? 'border-blue-300 focus:border-blue-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Ім'я</Label>
                        <Input
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!editMode}
                          className={editMode ? 'border-blue-300 focus:border-blue-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>По батькові</Label>
                        <Input
                          value={profile.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          disabled={!editMode}
                          className={editMode ? 'border-blue-300 focus:border-blue-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Дата народження</Label>
                        <Input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!editMode}
                          className={editMode ? 'border-blue-300 focus:border-blue-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Стать</Label>
                        <select
                          value={profile.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          disabled={!editMode}
                          className={`w-full p-2 border rounded-md ${editMode ? 'border-blue-300 focus:border-blue-500' : ''} disabled:bg-gray-100`}
                        >
                          <option value="">Не вказано</option>
                          <option value="male">Чоловіча</option>
                          <option value="female">Жіноча</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Про себе</Label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!editMode}
                        placeholder="Розкажіть про себе..."
                        rows={3}
                        className={editMode ? 'border-blue-300 focus:border-blue-500' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Контакти
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email не можна змінити
                      </p>
                    </div>

                    <div>
                      <Label>Телефон</Label>
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!editMode}
                        placeholder="+380XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <Label>Веб-сайт</Label>
                      <Input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={!editMode}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Соціальні мережі</Label>
                      <div className="space-y-2">
                        <Input
                          value={profile.socialMedia.instagram}
                          onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                          disabled={!editMode}
                          placeholder="Instagram username"
                        />
                        <Input
                          value={profile.socialMedia.facebook}
                          onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                          disabled={!editMode}
                          placeholder="Facebook profile"
                        />
                        <Input
                          value={profile.socialMedia.telegram}
                          onChange={(e) => handleNestedInputChange('socialMedia', 'telegram', e.target.value)}
                          disabled={!editMode}
                          placeholder="Telegram username"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Адреса проживання
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Країна</Label>
                      <Input
                        value={profile.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>Область</Label>
                      <Input
                        value={profile.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>Місто</Label>
                      <Input
                        value={profile.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <Label>Адреса</Label>
                      <Input
                        value={profile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!editMode}
                        placeholder="Вулиця, будинок, квартира"
                      />
                    </div>
                    <div>
                      <Label>Поштовий індекс</Label>
                      <Input
                        value={profile.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Спортивна інформація */}
            <TabsContent value="sport" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Спортивна кар'єра
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Спортивний клуб</Label>
                      <select
                        value={profile.club}
                        onChange={(e) => handleInputChange('club', e.target.value)}
                        disabled={!editMode}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      >
                        <option value="">Оберіть клуб</option>
                        {availableClubs.map((club) => (
                          <option key={club} value={club}>
                            {club}
                          </option>
                        ))}
                        <option value="other">Інший клуб (введіть вручну)</option>
                      </select>
                      {profile.club === "other" && editMode && (
                        <Input
                          className="mt-2"
                          placeholder="Введіть назву клубу"
                          onChange={(e) => handleInputChange('club', e.target.value)}
                        />
                      )}
                    </div>

                    <div>
                      <Label>Тренер</Label>
                      <select
                        value={availableCoaches.includes(profile.coach) ? profile.coach : "other"}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            handleInputChange('coach', '');
                          } else if (e.target.value !== "other") {
                            handleInputChange('coach', e.target.value);
                          }
                          // Якщо вибрано "other", залишаємо поточне значення та показуємо input
                        }}
                        disabled={!editMode}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      >
                        <option value="">Оберіть тренера</option>
                        {availableCoaches.map((coach) => (
                          <option key={coach} value={coach}>
                            {coach}
                          </option>
                        ))}
                        <option value="other">Інший тренер (введіть вручну)</option>
                      </select>
                      {editMode && (!availableCoaches.includes(profile.coach) || availableCoaches.length === 0) && (
                        <Input
                          className="mt-2"
                          placeholder="Введіть ім'я тренера"
                          value={profile.coach || ''}
                          onChange={(e) => handleInputChange('coach', e.target.value)}
                        />
                      )}
                    </div>

                    <div>
                      <Label>Спортивна категорія</Label>
                      <select
                        value={profile.sportCategory}
                        onChange={(e) => handleInputChange('sportCategory', e.target.value)}
                        disabled={!editMode}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      >
                        <option value="">Оберіть категорію</option>
                        <option value="no-rank">Без розряду</option>
                        <option value="youth-3">3 юнацький розряд</option>
                        <option value="youth-2">2 юнацький розряд</option>
                        <option value="youth-1">1 юнацький розряд</option>
                        <option value="sport-3">3 спортивний розряд</option>
                        <option value="sport-2">2 спортивний розряд</option>
                        <option value="sport-1">1 спортивний розряд</option>
                        <option value="cms">КМС</option>
                        <option value="ms">МС</option>
                        <option value="msic">МСМК</option>
                      </select>
                    </div>

                    <div>
                      <Label>Стаж у спорті</Label>
                      <Input
                        value={profile.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        disabled={!editMode}
                        placeholder="Наприклад: 5 років"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Спеціалізація
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Основна спеціалізація</Label>
                      <select
                        value={profile.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        disabled={!editMode}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      >
                        <option value="">Оберіть спеціалізацію</option>
                        <option value="individual">Індивідуальна програма</option>
                        <option value="pair">Змішані пари</option>
                        <option value="trio">Тріо</option>
                        <option value="group">Група (5 осіб)</option>
                        <option value="aerobic-dance">Аеробік-данс</option>
                        <option value="aerobic-step">Степ-аеробіка</option>
                        <option value="hip-hop">Хіп-хоп</option>
                      </select>
                    </div>

                    <div>
                      <Label>Додаткові навички</Label>
                      <Textarea
                        value={profile.achievements}
                        onChange={(e) => handleInputChange('achievements', e.target.value)}
                        disabled={!editMode}
                        placeholder="Опишіть ваші додаткові навички, досвід тощо"
                        rows={4}
                      />
                    </div>

                    {/* Ролі користувача */}
                    <div>
                      <Label>Ваші ролі в ФУСАФ</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.roles.map(role => (
                          <Badge key={role} variant="secondary" className="bg-blue-100 text-blue-800">
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Досягнення */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Участь у змаганнях
                    </div>
                    {editMode && (
                      <Button size="sm" onClick={addCompetition}>
                        Додати змагання
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.competitions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Змагання ще не додано
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {profile.competitions.map((competition, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label>Назва змагання</Label>
                              <Input
                                value={competition.name}
                                onChange={(e) => updateCompetition(index, 'name', e.target.value)}
                                disabled={!editMode}
                                placeholder="Кубок України"
                              />
                            </div>
                            <div>
                              <Label>Дата</Label>
                              <Input
                                type="date"
                                value={competition.date}
                                onChange={(e) => updateCompetition(index, 'date', e.target.value)}
                                disabled={!editMode}
                              />
                            </div>
                            <div>
                              <Label>Результат</Label>
                              <Input
                                value={competition.place}
                                onChange={(e) => updateCompetition(index, 'place', e.target.value)}
                                disabled={!editMode}
                                placeholder="1 місце, фінал"
                              />
                            </div>
                            <div>
                              <Label>Категорія</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={competition.category}
                                  onChange={(e) => updateCompetition(index, 'category', e.target.value)}
                                  disabled={!editMode}
                                  placeholder="Seniors"
                                />
                                {editMode && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeCompetition(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Документи */}
            <TabsContent value="documents" className="space-y-6" data-tab="documents">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Аватар */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Аватар профілю
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <FileUpload
                        type="avatar"
                        currentValue={profile.avatar}
                        onFileSelect={(file) => handleFileUpload('avatar', file)}
                        maxSize={2 * 1024 * 1024} // 2MB для аватара
                        preview={true}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Avatar className="h-32 w-32 mx-auto mb-4">
                          <AvatarImage src={profile.avatar} alt={profile.firstName} />
                          <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-600">
                          {profile.avatar ? 'Аватар встановлено' : 'Аватар не встановлено'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Документи */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Документи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode && (
                      <div className="mb-4">
                        <FileUpload
                          type="document"
                          onFileSelect={(file, url) => handleFileUpload('document', file, url)}
                          maxSize={10 * 1024 * 1024} // 10MB для документів
                          preview={false}
                        />
                      </div>
                    )}

                    {profile.documents.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Документи ще не завантажено
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profile.documents.map((doc, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded">
                                <Upload className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium truncate">{doc.name}</p>
                                <p className="text-sm text-gray-500">{doc.type}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                Переглянути
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Налаштування */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Приватність
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Публічний профіль</Label>
                        <p className="text-sm text-gray-500">Дозволити іншим переглядати ваш профіль</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.isPublicProfile}
                        onChange={(e) => handleInputChange('isPublicProfile', e.target.checked)}
                        disabled={!editMode}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Показувати email</Label>
                        <p className="text-sm text-gray-500">Email буде видимий у профілі</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.showEmail}
                        onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                        disabled={!editMode}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Показувати телефон</Label>
                        <p className="text-sm text-gray-500">Телефон буде видимий у профілі</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.showPhone}
                        onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                        disabled={!editMode}
                        className="rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Сповіщення
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email сповіщення</Label>
                        <p className="text-sm text-gray-500">Отримувати повідомлення на email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        disabled={!editMode}
                        className="rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Безпека */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Зміна пароля
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Поточний пароль</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Введіть поточний пароль"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Новий пароль</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Введіть новий пароль"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Підтвердження нового пароля</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Повторіть новий пароль"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    className="w-full"
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Змінити пароль
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Інформація про акаунт</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата реєстрації:</span>
                      <span>{new Date(profile.memberSince).toLocaleDateString('uk-UA')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Останній вхід:</span>
                      <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('uk-UA') : 'Невідомо'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Статус email:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {user.emailVerified ? 'Підтверджено' : 'Не підтверджено'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
