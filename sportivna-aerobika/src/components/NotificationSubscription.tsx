"use client";

import { useState } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bell,
  Mail,
  Trophy,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface NotificationSettings {
  newCompetitions: boolean;
  registrationReminders: boolean;
  competitionUpdates: boolean;
  results: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
}

export function NotificationSubscription() {
  const { user } = useSimpleAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [settings, setSettings] = useState<NotificationSettings>({
    newCompetitions: true,
    registrationReminders: true,
    competitionUpdates: false,
    results: false,
    emailFrequency: 'immediate'
  });

  const handleSubscribe = async () => {
    if (!user?.email) {
      setMessage('Увійдіть в систему для підписки на сповіщення');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          settings: settings
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setMessage('✅ Ви успішно підписались на сповіщення!');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Помилка при підписці');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Помилка при підписці на сповіщення');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubscribed(false);
        setMessage('Ви відписались від сповіщень');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Помилка при відписці');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Помилка при відписці від сповіщень');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.email) {
    return (
      <Card className="border-dashed border-2 border-blue-200">
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Сповіщення про змагання</h3>
          <p className="text-gray-600 mb-4">
            Увійдіть в систему, щоб підписатись на сповіщення про нові змагання
          </p>
          <Button variant="outline">
            Увійти в систему
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          Email-сповіщення
          {isSubscribed && (
            <Badge className="ml-2 bg-green-500">
              Активні
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert className={messageType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Налаштування сповіщень</h4>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newCompetitions"
                checked={settings.newCompetitions}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, newCompetitions: !!checked }))}
              />
              <Label htmlFor="newCompetitions" className="flex items-center cursor-pointer">
                <Trophy className="h-4 w-4 mr-2 text-blue-600" />
                Нові змагання
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="registrationReminders"
                checked={settings.registrationReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registrationReminders: !!checked }))}
              />
              <Label htmlFor="registrationReminders" className="flex items-center cursor-pointer">
                <Users className="h-4 w-4 mr-2 text-green-600" />
                Нагадування про реєстрацію
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitionUpdates"
                checked={settings.competitionUpdates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, competitionUpdates: !!checked }))}
              />
              <Label htmlFor="competitionUpdates" className="flex items-center cursor-pointer">
                <Settings className="h-4 w-4 mr-2 text-purple-600" />
                Оновлення змагань
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="results"
                checked={settings.results}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, results: !!checked }))}
              />
              <Label htmlFor="results" className="flex items-center cursor-pointer">
                <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                Результати змагань
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Частота сповіщень</Label>
            <div className="flex space-x-2">
              {[
                { value: 'immediate', label: 'Миттєво' },
                { value: 'daily', label: 'Щодня' },
                { value: 'weekly', label: 'Щотижня' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={settings.emailFrequency === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, emailFrequency: option.value as any }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>

            {isSubscribed ? (
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Відписатись
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Підписка...' : 'Підписатись'}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Підказка:</strong> Ви будете отримувати сповіщення тільки про ті типи подій,
            які ви обрали вище. Ви можете змінити налаштування в будь-який час.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
