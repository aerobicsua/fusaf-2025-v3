"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Share2,
  QrCode,
  FileText,
  Trophy,
  Calendar,
  Users,
  Settings,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    isPublicProfile: boolean;
    club?: string;
  };
  onAction: (action: string) => void;
}

export function QuickActions({ userProfile, onAction }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/public/${userProfile.email}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Помилка копіювання:', error);
    }
  };

  const quickActions = [
    {
      id: 'export-pdf',
      title: 'Експорт профілю',
      description: 'Завантажити профіль в PDF',
      icon: <Download className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      onClick: () => onAction('export-pdf')
    },
    {
      id: 'generate-qr',
      title: 'QR-код профілю',
      description: 'Створити QR-код для швидкого доступу',
      icon: <QrCode className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      onClick: () => onAction('generate-qr')
    },
    {
      id: 'share-profile',
      title: 'Поділитися профілем',
      description: 'Надіслати посилання на профіль',
      icon: <Share2 className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      onClick: handleCopyProfile,
      disabled: !userProfile.isPublicProfile
    }
  ];

  // Додаткові дії залежно від ролі
  const getRoleSpecificActions = () => {
    const actions = [];

    if (userProfile.roles.includes('coach_judge')) {
      actions.push({
        id: 'my-athletes',
        title: 'Мої спортсмени',
        description: 'Управління учнями',
        icon: <Users className="h-5 w-5" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 hover:bg-teal-100',
        onClick: () => onAction('my-athletes')
      });
    }

    if (userProfile.roles.includes('club_owner') && userProfile.club) {
      actions.push({
        id: 'club-management',
        title: 'Управління клубом',
        description: 'Налаштування клубу',
        icon: <Settings className="h-5 w-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        onClick: () => router.push(`/club/${encodeURIComponent(userProfile.club)}`)
      });
    }

    return actions;
  };

  const allActions = [...quickActions, ...getRoleSpecificActions()];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>⚡ Швидкі дії</span>
          {copied && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Скопійовано!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`h-auto p-4 justify-start ${action.bgColor} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`${action.color} flex-shrink-0 mt-0.5`}>
                  {action.icon}
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-medium text-sm text-gray-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
                {action.id === 'share-profile' && !userProfile.isPublicProfile && (
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      Приватний
                    </Badge>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Додаткова інформація */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium">💡 Поради:</p>
              <ul className="text-blue-800 mt-1 space-y-1 text-xs">
                <li>• Експортуйте профіль в PDF для подання документів</li>
                <li>• Використовуйте QR-код для швидкого обміну контактами</li>
                <li>• Зробіть профіль публічним для можливості поділитися</li>
                {userProfile.roles.includes('club_owner') && (
                  <li>• Управляйте своїм клубом через відповідну кнопку</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
