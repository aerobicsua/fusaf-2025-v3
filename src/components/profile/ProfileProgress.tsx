"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  User,
  Trophy,
  Award,
  Upload,
  Settings,
  Shield
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  region: string;
  city: string;
  address: string;
  zipCode: string;
  club: string;
  coach: string;
  sportCategory: string;
  experience: string;
  specialization: string;
  bio: string;
  website: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    telegram: string;
  };
  achievements: string;
  competitions: Array<{
    name: string;
    date: string;
    place: string;
    category: string;
  }>;
  isPublicProfile: boolean;
  showEmail: boolean;
  showPhone: boolean;
  emailNotifications: boolean;
  avatar: string;
  documents: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface ProfileProgressProps {
  profile: UserProfile | null;
  onTabSelect: (tab: string) => void;
}

export function ProfileProgress({ profile, onTabSelect }: ProfileProgressProps) {
  if (!profile) return null;

  // Функція для перевірки заповненості секції
  const checkPersonalData = () => {
    const required = [profile.firstName, profile.lastName, profile.email];
    const optional = [profile.middleName, profile.phone, profile.dateOfBirth, profile.gender, profile.bio];
    const filled = required.filter(Boolean).length + optional.filter(Boolean).length;
    const total = required.length + optional.length;
    return { filled, total, completion: Math.round((filled / total) * 100) };
  };

  const checkAddress = () => {
    const fields = [profile.country, profile.region, profile.city, profile.address, profile.zipCode];
    const filled = fields.filter(Boolean).length;
    return { filled, total: fields.length, completion: Math.round((filled / fields.length) * 100) };
  };

  const checkSportData = () => {
    const fields = [profile.club, profile.coach, profile.sportCategory, profile.experience, profile.specialization];
    const filled = fields.filter(Boolean).length;
    return { filled, total: fields.length, completion: Math.round((filled / fields.length) * 100) };
  };

  const checkSocialMedia = () => {
    const fields = [profile.website, profile.socialMedia.instagram, profile.socialMedia.facebook, profile.socialMedia.telegram];
    const filled = fields.filter(Boolean).length;
    return { filled, total: fields.length, completion: Math.round((filled / fields.length) * 100) };
  };

  const checkAchievements = () => {
    const hasAchievements = Boolean(profile.achievements);
    const hasCompetitions = profile.competitions.length > 0;
    const filled = (hasAchievements ? 1 : 0) + (hasCompetitions ? 1 : 0);
    return { filled, total: 2, completion: Math.round((filled / 2) * 100) };
  };

  const checkDocuments = () => {
    const hasAvatar = Boolean(profile.avatar);
    const hasDocuments = profile.documents.length > 0;
    const filled = (hasAvatar ? 1 : 0) + (hasDocuments ? 1 : 0);
    return { filled, total: 2, completion: Math.round((filled / 2) * 100) };
  };

  // Розрахунок загального прогресу
  const sections = [
    { name: 'personal', ...checkPersonalData() },
    { name: 'address', ...checkAddress() },
    { name: 'sport', ...checkSportData() },
    { name: 'social', ...checkSocialMedia() },
    { name: 'achievements', ...checkAchievements() },
    { name: 'documents', ...checkDocuments() }
  ];

  const totalFilled = sections.reduce((acc, section) => acc + section.filled, 0);
  const totalFields = sections.reduce((acc, section) => acc + section.total, 0);
  const overallProgress = Math.round((totalFilled / totalFields) * 100);

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-600';
    if (completion >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionIcon = (completion: number) => {
    if (completion >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (completion >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <Circle className="h-4 w-4 text-red-600" />;
  };

  const getCompletionLabel = (completion: number) => {
    if (completion >= 80) return 'Завершено';
    if (completion >= 50) return 'Частково';
    return 'Потрібні дані';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            📊 Прогрес заповнення профілю
          </span>
          <Badge variant={overallProgress >= 80 ? "default" : overallProgress >= 50 ? "secondary" : "destructive"}>
            {overallProgress}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Загальний прогрес */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Загальна заповненість</span>
              <span className={`text-sm font-bold ${getCompletionColor(overallProgress)}`}>
                {totalFilled} з {totalFields} полів
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Детальний прогрес по секціях */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('personal')}
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Особисті дані</p>
                  <p className={`text-xs ${getCompletionColor(checkPersonalData().completion)}`}>
                    {getCompletionLabel(checkPersonalData().completion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{checkPersonalData().completion}%</span>
                {getCompletionIcon(checkPersonalData().completion)}
              </div>
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('sport')}
            >
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Спорт</p>
                  <p className={`text-xs ${getCompletionColor(checkSportData().completion)}`}>
                    {getCompletionLabel(checkSportData().completion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{checkSportData().completion}%</span>
                {getCompletionIcon(checkSportData().completion)}
              </div>
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('achievements')}
            >
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Досягнення</p>
                  <p className={`text-xs ${getCompletionColor(checkAchievements().completion)}`}>
                    {getCompletionLabel(checkAchievements().completion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{checkAchievements().completion}%</span>
                {getCompletionIcon(checkAchievements().completion)}
              </div>
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('documents')}
            >
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Документи</p>
                  <p className={`text-xs ${getCompletionColor(checkDocuments().completion)}`}>
                    {getCompletionLabel(checkDocuments().completion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{checkDocuments().completion}%</span>
                {getCompletionIcon(checkDocuments().completion)}
              </div>
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('settings')}
            >
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Налаштування</p>
                  <p className="text-xs text-green-600">Налаштовано</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTabSelect('security')}
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Безпека</p>
                  <p className="text-xs text-green-600">Захищено</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Поради для покращення */}
          {overallProgress < 80 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Поради для покращення профілю:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {checkPersonalData().completion < 80 && (
                  <li>• Заповніть додаткову особисту інформацію для кращого представлення</li>
                )}
                {checkSportData().completion < 80 && (
                  <li>• Додайте інформацію про ваш спортивний клуб та досвід</li>
                )}
                {checkAchievements().completion < 50 && (
                  <li>• Поділіться вашими спортивними досягненнями та участю у змаганнях</li>
                )}
                {checkDocuments().completion < 50 && (
                  <li>• Завантажте аватар та необхідні документи</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
