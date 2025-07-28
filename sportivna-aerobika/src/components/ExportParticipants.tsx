"use client";

import { useState } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Filter,
  Calendar,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';

interface ExportParticipantsProps {
  competitionId: string;
  competitionTitle: string;
}

interface ExportSettings {
  format: 'excel' | 'pdf';
  includeFields: {
    personalInfo: boolean;
    contactInfo: boolean;
    clubInfo: boolean;
    programInfo: boolean;
    paymentInfo: boolean;
    medicalInfo: boolean;
  };
  filterBy: {
    program: string;
    category: string;
    registrationType: string;
  };
}

export function ExportParticipants({ competitionId, competitionTitle }: ExportParticipantsProps) {
  const { user } = useSimpleAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [settings, setSettings] = useState<ExportSettings>({
    format: 'excel',
    includeFields: {
      personalInfo: true,
      contactInfo: true,
      clubInfo: true,
      programInfo: true,
      paymentInfo: false,
      medicalInfo: false
    },
    filterBy: {
      program: 'all',
      category: 'all',
      registrationType: 'all'
    }
  });

  // Перевірка прав доступу
  const canExport = user?.roles?.some(role =>
    ['admin', 'club_owner', 'coach_judge'].includes(role)
  );

  if (!canExport) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="text-center py-8">
          <Download className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Експорт недоступний</h3>
          <p className="text-gray-600">
            Тільки організатори та адміністратори можуть експортувати списки учасників
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleExport = async () => {
    setIsExporting(true);
    setMessage('');

    try {
      const response = await fetch('/api/competitions/export-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId,
          settings
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка при експорті даних');
      }

      // Отримуємо файл як blob
      const blob = await response.blob();
      const filename = `Учасники_${competitionTitle}_${new Date().toISOString().split('T')[0]}.${settings.format === 'excel' ? 'xlsx' : 'pdf'}`;

      // Створюємо посилання для завантаження
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      // Очищуємо URL
      window.URL.revokeObjectURL(url);

      setMessage(`✅ Файл "${filename}" успішно завантажено!`);
      setMessageType('success');

    } catch (error) {
      setMessage('Помилка при експорті даних учасників');
      setMessageType('error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const programs = [
    { value: 'all', label: 'Всі програми' },
    { value: 'iw', label: 'Individual Women (IW)' },
    { value: 'im', label: 'Individual Men (IM)' },
    { value: 'mp', label: 'Mixed Pairs (MP)' },
    { value: 'tr', label: 'Trio (TR)' },
    { value: 'gr', label: 'Group (GR)' },
    { value: 'ad', label: 'Aerobic Dance (AD)' },
    { value: 'as', label: 'Aerobic Step (AS)' }
  ];

  const categories = [
    { value: 'all', label: 'Всі категорії' },
    { value: 'youth', label: 'YOUTH / 12-14 YEARS' },
    { value: 'juniors', label: 'JUNIORS / 15-17 YEARS' },
    { value: 'seniors', label: 'SENIORS 18+ YEARS' },
    { value: 'nd', label: 'ND' },
    { value: 'ndmini', label: 'NDmini' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2 text-blue-600" />
          Експорт учасників
          <Badge variant="outline" className="ml-2">
            Організатори
          </Badge>
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

        {/* Формат експорту */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Формат файлу</Label>
          <div className="flex space-x-4">
            <Button
              variant={settings.format === 'excel' ? 'default' : 'outline'}
              onClick={() => setSettings(prev => ({ ...prev, format: 'excel' }))}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Excel (.xlsx)</span>
            </Button>
            <Button
              variant={settings.format === 'pdf' ? 'default' : 'outline'}
              onClick={() => setSettings(prev => ({ ...prev, format: 'pdf' }))}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Фільтри */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Фільтри
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="program-filter">Програма</Label>
              <Select
                value={settings.filterBy.program}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  filterBy: { ...prev.filterBy, program: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category-filter">Категорія</Label>
              <Select
                value={settings.filterBy.category}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  filterBy: { ...prev.filterBy, category: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="registration-type-filter">Тип реєстрації</Label>
              <Select
                value={settings.filterBy.registrationType}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  filterBy: { ...prev.filterBy, registrationType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі типи</SelectItem>
                  <SelectItem value="preliminary">Попередня</SelectItem>
                  <SelectItem value="individual">Іменна</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Поля для включення */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Включити поля</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personalInfo"
                checked={settings.includeFields.personalInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, personalInfo: !!checked }
                }))}
              />
              <Label htmlFor="personalInfo" className="cursor-pointer">
                👤 Особисті дані (ім'я, вік, стать)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contactInfo"
                checked={settings.includeFields.contactInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, contactInfo: !!checked }
                }))}
              />
              <Label htmlFor="contactInfo" className="cursor-pointer">
                📞 Контактна інформація
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clubInfo"
                checked={settings.includeFields.clubInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, clubInfo: !!checked }
                }))}
              />
              <Label htmlFor="clubInfo" className="cursor-pointer">
                🏛️ Інформація про клуб
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="programInfo"
                checked={settings.includeFields.programInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, programInfo: !!checked }
                }))}
              />
              <Label htmlFor="programInfo" className="cursor-pointer">
                🏆 Програма та категорія
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentInfo"
                checked={settings.includeFields.paymentInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, paymentInfo: !!checked }
                }))}
              />
              <Label htmlFor="paymentInfo" className="cursor-pointer">
                💳 Платіжна інформація
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicalInfo"
                checked={settings.includeFields.medicalInfo}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  includeFields: { ...prev.includeFields, medicalInfo: !!checked }
                }))}
              />
              <Label htmlFor="medicalInfo" className="cursor-pointer">
                🏥 Медична інформація
              </Label>
            </div>
          </div>
        </div>

        {/* Кнопка експорту */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Users className="h-4 w-4 inline mr-1" />
              Буде експортовано дані учасників згідно обраних фільтрів
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Експорт...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Експортувати
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Примітка:</strong> Експорт доступний тільки організаторам змагання.
            Персональні дані учасників захищені згідно з GDPR та українським законодавством.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
