"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  Database,
  Mail,
  Shield,
  Globe,
  Clock,
  FileText,
  Users,
  Trophy,
  Building,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Key,
  Server,
  Zap,
  BarChart3,
  Lock
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    address: string;
    timezone: string;
    language: string;
    currency: string;
  };
  features: {
    userRegistration: boolean;
    publicProfiles: boolean;
    emailNotifications: boolean;
    competitionRegistration: boolean;
    newsComments: boolean;
    dataExport: boolean;
    apiAccess: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
    ipWhitelist: string;
    adminNotifications: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
  };
  database: {
    backupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
    compressionEnabled: boolean;
  };
  analytics: {
    trackingEnabled: boolean;
    googleAnalyticsId: string;
    facebookPixelId: string;
    dataRetentionMonths: number;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    siteName: 'ФУСАФ - Федерація України зі Спортивної Аеробіки і Фітнесу',
    siteDescription: 'Офіційний сайт Федерації України зі Спортивної Аеробіки і Фітнесу',
    contactEmail: 'info@fusaf.org.ua',
    supportPhone: '+380 44 123 45 67',
    address: 'м. Київ, Україна',
    timezone: 'Europe/Kiev',
    language: 'uk',
    currency: 'UAH'
  },
  features: {
    userRegistration: true,
    publicProfiles: true,
    emailNotifications: true,
    competitionRegistration: true,
    newsComments: false,
    dataExport: true,
    apiAccess: false
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: '',
    adminNotifications: true
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromName: 'ФУСАФ',
    fromEmail: 'noreply@fusaf.org.ua',
    replyToEmail: 'info@fusaf.org.ua'
  },
  database: {
    backupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    compressionEnabled: true
  },
  analytics: {
    trackingEnabled: false,
    googleAnalyticsId: '',
    facebookPixelId: '',
    dataRetentionMonths: 12
  }
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    dbSize: '12.5 MB',
    uptime: '5 днів',
    activeUsers: 12,
    totalStorage: '156 MB'
  });

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // TODO: Завантажити налаштування з API
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      // setSettings(data.settings);

      // Поки що використовуємо локальні налаштування
      const savedSettings = localStorage.getItem('fusaf_admin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Помилка завантаження налаштувань:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      // TODO: Завантажити системну інформацію з API
      // const response = await fetch('/api/admin/system-info');
      // const data = await response.json();
      // setSystemInfo(data);
    } catch (error) {
      console.error('Помилка завантаження системної інформації:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // TODO: Відправити налаштування на API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ settings })
      // });

      // Поки що зберігаємо локально
      localStorage.setItem('fusaf_admin_settings', JSON.stringify(settings));

      alert('Налаштування збережено успішно!');

      // Логуємо дію адміністратора
      await logAdminAction('UPDATE_SYSTEM_SETTINGS', 'system', 'settings', settings);

    } catch (error) {
      console.error('Помилка збереження налаштувань:', error);
      alert('Помилка збереження налаштувань');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      const testEmail = {
        to: settings.general.contactEmail,
        subject: 'Тест налаштувань email',
        message: 'Це тестове повідомлення для перевірки налаштувань email.'
      };

      // TODO: Відправити тестовий email
      // const response = await fetch('/api/admin/test-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(testEmail)
      // });

      alert('Тестовий email відправлено!');
      setTestEmailDialogOpen(false);

    } catch (error) {
      console.error('Помилка відправки тестового email:', error);
      alert('Помилка відправки тестового email');
    }
  };

  const createBackup = async () => {
    try {
      // TODO: Створити резервну копію
      // const response = await fetch('/api/admin/backup', {
      //   method: 'POST'
      // });

      alert('Резервну копію створено успішно!');
      setBackupDialogOpen(false);

      await logAdminAction('CREATE_BACKUP', 'system', 'backup', {});

    } catch (error) {
      console.error('Помилка створення резервної копії:', error);
      alert('Помилка створення резервної копії');
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'current_admin_id',
          adminEmail: 'admin@fusaf.org.ua',
          action,
          targetType,
          targetId,
          details
        })
      });
    } catch (error) {
      console.error('Помилка логування:', error);
    }
  };

  const updateGeneralSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updateFeatureSettings = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
  };

  const updateSecuritySettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const updateEmailSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }));
  };

  const updateDatabaseSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      database: { ...prev.database, [field]: value }
    }));
  };

  const updateAnalyticsSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      analytics: { ...prev.analytics, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Налаштування системи</h1>
          <p className="text-gray-600 mt-1">
            Конфігурація параметрів системи, безпеки та функціональності
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={loadSettings} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Оновити
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </div>

      {/* Системна інформація */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{systemInfo.version}</div>
            <p className="text-xs text-gray-500">Версія системи</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{systemInfo.dbSize}</div>
            <p className="text-xs text-gray-500">Розмір БД</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{systemInfo.uptime}</div>
            <p className="text-xs text-gray-500">Час роботи</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{systemInfo.activeUsers}</div>
            <p className="text-xs text-gray-500">Активних користувачів</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{systemInfo.totalStorage}</div>
            <p className="text-xs text-gray-500">Використано місця</p>
          </CardContent>
        </Card>
      </div>

      {/* Таби налаштувань */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Загальні</TabsTrigger>
          <TabsTrigger value="features">Функції</TabsTrigger>
          <TabsTrigger value="security">Безпека</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="database">База даних</TabsTrigger>
          <TabsTrigger value="analytics">Аналітика</TabsTrigger>
        </TabsList>

        {/* Загальні налаштування */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Загальні налаштування сайту
              </CardTitle>
              <CardDescription>
                Основна інформація про сайт та контактні дані
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Назва сайту</Label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => updateGeneralSettings('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Мова</Label>
                  <Select value={settings.general.language} onValueChange={(value) => updateGeneralSettings('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">Українська</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Опис сайту</Label>
                <Textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateGeneralSettings('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email для зв'язку</Label>
                  <Input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateGeneralSettings('contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Телефон підтримки</Label>
                  <Input
                    value={settings.general.supportPhone}
                    onChange={(e) => updateGeneralSettings('supportPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Адреса</Label>
                  <Input
                    value={settings.general.address}
                    onChange={(e) => updateGeneralSettings('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Часовий пояс</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateGeneralSettings('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Kiev">Київ (GMT+2/+3)</SelectItem>
                      <SelectItem value="Europe/London">Лондон (GMT+0/+1)</SelectItem>
                      <SelectItem value="America/New_York">Нью-Йорк (GMT-5/-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Валюта</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateGeneralSettings('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UAH">UAH (гривня)</SelectItem>
                      <SelectItem value="USD">USD (долар)</SelectItem>
                      <SelectItem value="EUR">EUR (євро)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Функції */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Функції системи
              </CardTitle>
              <CardDescription>
                Увімкніть або вимкніть функції системи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.userRegistration}
                      onCheckedChange={(checked) => updateFeatureSettings('userRegistration', checked as boolean)}
                    />
                    <div>
                      <Label>Реєстрація користувачів</Label>
                      <p className="text-sm text-gray-500">Дозволити новим користувачам реєструватися</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.publicProfiles}
                      onCheckedChange={(checked) => updateFeatureSettings('publicProfiles', checked as boolean)}
                    />
                    <div>
                      <Label>Публічні профілі</Label>
                      <p className="text-sm text-gray-500">Дозволити переглядати профілі спортсменів</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.emailNotifications}
                      onCheckedChange={(checked) => updateFeatureSettings('emailNotifications', checked as boolean)}
                    />
                    <div>
                      <Label>Email сповіщення</Label>
                      <p className="text-sm text-gray-500">Надсилати email повідомлення</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.competitionRegistration}
                      onCheckedChange={(checked) => updateFeatureSettings('competitionRegistration', checked as boolean)}
                    />
                    <div>
                      <Label>Реєстрація на змагання</Label>
                      <p className="text-sm text-gray-500">Дозволити реєстрацію на змагання</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.newsComments}
                      onCheckedChange={(checked) => updateFeatureSettings('newsComments', checked as boolean)}
                    />
                    <div>
                      <Label>Коментарі до новин</Label>
                      <p className="text-sm text-gray-500">Дозволити коментувати новини</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.dataExport}
                      onCheckedChange={(checked) => updateFeatureSettings('dataExport', checked as boolean)}
                    />
                    <div>
                      <Label>Експорт даних</Label>
                      <p className="text-sm text-gray-500">Дозволити експорт даних адміністраторам</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.features.apiAccess}
                      onCheckedChange={(checked) => updateFeatureSettings('apiAccess', checked as boolean)}
                    />
                    <div>
                      <Label>API доступ</Label>
                      <p className="text-sm text-gray-500">Дозволити доступ через API</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Безпека */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Налаштування безпеки
              </CardTitle>
              <CardDescription>
                Параметри безпеки та аутентифікації
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Мінімальна довжина пароля</Label>
                  <Input
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSecuritySettings('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Час сесії (години)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Макс. спроб входу</Label>
                  <Input
                    type="number"
                    min="3"
                    max="20"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSecuritySettings('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSecuritySettings('twoFactorAuth', checked as boolean)}
                  />
                  <div>
                    <Label>Двофакторна автентифікація</Label>
                    <p className="text-sm text-gray-500">Вимагати 2FA для адміністраторів</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.security.adminNotifications}
                    onCheckedChange={(checked) => updateSecuritySettings('adminNotifications', checked as boolean)}
                  />
                  <div>
                    <Label>Сповіщення адміністраторів</Label>
                    <p className="text-sm text-gray-500">Сповіщати про підозрілу активність</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>IP адреси для адміністраторів (білий список)</Label>
                <Textarea
                  value={settings.security.ipWhitelist}
                  onChange={(e) => updateSecuritySettings('ipWhitelist', e.target.value)}
                  rows={3}
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;або залишити порожнім для всіх IP"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Налаштування Email
              </CardTitle>
              <CardDescription>
                Конфігурація SMTP сервера для відправки email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP хост</Label>
                  <Input
                    value={settings.email.smtpHost}
                    onChange={(e) => updateEmailSettings('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label>SMTP порт</Label>
                  <Input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateEmailSettings('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP користувач</Label>
                  <Input
                    value={settings.email.smtpUsername}
                    onChange={(e) => updateEmailSettings('smtpUsername', e.target.value)}
                  />
                </div>
                <div>
                  <Label>SMTP пароль</Label>
                  <Input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateEmailSettings('smtpPassword', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ім'я відправника</Label>
                  <Input
                    value={settings.email.fromName}
                    onChange={(e) => updateEmailSettings('fromName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email відправника</Label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateEmailSettings('fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Reply-To email</Label>
                  <Input
                    type="email"
                    value={settings.email.replyToEmail}
                    onChange={(e) => updateEmailSettings('replyToEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => setTestEmailDialogOpen(true)} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Тестувати налаштування
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* База даних */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Налаштування бази даних
              </CardTitle>
              <CardDescription>
                Резервне копіювання та обслуговування БД
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.database.backupEnabled}
                  onCheckedChange={(checked) => updateDatabaseSettings('backupEnabled', checked as boolean)}
                />
                <div>
                  <Label>Автоматичне резервне копіювання</Label>
                  <p className="text-sm text-gray-500">Створювати резервні копії автоматично</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Частота резервного копіювання</Label>
                  <Select value={settings.database.backupFrequency} onValueChange={(value) => updateDatabaseSettings('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Щогодини</SelectItem>
                      <SelectItem value="daily">Щодня</SelectItem>
                      <SelectItem value="weekly">Щотижня</SelectItem>
                      <SelectItem value="monthly">Щомісяця</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Зберігати копії (днів)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.database.retentionDays}
                    onChange={(e) => updateDatabaseSettings('retentionDays', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    checked={settings.database.compressionEnabled}
                    onCheckedChange={(checked) => updateDatabaseSettings('compressionEnabled', checked as boolean)}
                  />
                  <Label>Стиснення архівів</Label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => setBackupDialogOpen(true)} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Створити резервну копію
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Відновити з копії
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Аналітика */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Налаштування аналітики
              </CardTitle>
              <CardDescription>
                Відстеження користувачів та аналітика використання
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.analytics.trackingEnabled}
                  onCheckedChange={(checked) => updateAnalyticsSettings('trackingEnabled', checked as boolean)}
                />
                <div>
                  <Label>Відстеження користувачів</Label>
                  <p className="text-sm text-gray-500">Збирати аналітику використання сайту</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={settings.analytics.googleAnalyticsId}
                    onChange={(e) => updateAnalyticsSettings('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={settings.analytics.facebookPixelId}
                    onChange={(e) => updateAnalyticsSettings('facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>
              </div>

              <div>
                <Label>Зберігати дані (місяців)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.analytics.dataRetentionMonths}
                  onChange={(e) => updateAnalyticsSettings('dataRetentionMonths', parseInt(e.target.value))}
                  className="w-32"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Час зберігання аналітичних даних (GDPR compliance)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Діалог тестування email */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Тестування email налаштувань</DialogTitle>
            <DialogDescription>
              Відправити тестове повідомлення для перевірки налаштувань SMTP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Тестове повідомлення буде відправлено на адресу: <strong>{settings.general.contactEmail}</strong>
            </p>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  Переконайтеся, що налаштування SMTP заповнені правильно перед тестуванням.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEmailDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={testEmailSettings}>
              Відправити тест
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалог резервного копіювання */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Створення резервної копії</DialogTitle>
            <DialogDescription>
              Створити повну резервну копію бази даних та файлів
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Резервна копія включатиме всі дані користувачів, змагання, новини та налаштування системи.
            </p>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  Процес може зайняти кілька хвилин в залежності від розміру даних.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={createBackup}>
              Створити копію
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
