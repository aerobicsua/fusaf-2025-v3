"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileJson,
  Printer,
  Share,
  CheckCircle
} from 'lucide-react';
import type { Athlete } from '@/lib/athletes-storage';

interface ExportDataProps {
  athletes: Athlete[];
  selectedAthletes?: Athlete[];
  title?: string;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'image';
  fields: string[];
  includePhotos: boolean;
  includeResults: boolean;
  includeStats: boolean;
}

const initialOptions: ExportOptions = {
  format: 'pdf',
  fields: ['name', 'email', 'discipline', 'club', 'country'],
  includePhotos: false,
  includeResults: false,
  includeStats: false
};

const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Ім\'я та прізвище', required: true },
  { id: 'email', label: 'Email' },
  { id: 'license', label: 'Номер ліцензії' },
  { id: 'discipline', label: 'Дисципліни' },
  { id: 'club', label: 'Клуб/Підрозділ' },
  { id: 'country', label: 'Країна' },
  { id: 'coach', label: 'Тренер' },
  { id: 'age', label: 'Вік' },
  { id: 'status', label: 'Статус' },
  { id: 'achievements', label: 'Досягнення' },
  { id: 'biography', label: 'Біографія' },
  { id: 'contact', label: 'Контактні дані' }
];

export function ExportData({ athletes, selectedAthletes, title = "Список спортсменів" }: ExportDataProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>(initialOptions);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const dataToExport = selectedAthletes || athletes;

  // Симуляція експорту (оскільки ми не маємо реальних бібліотек)
  const simulateExport = async (format: string) => {
    setIsExporting(true);

    // Симуляція затримки
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Створення симуляції даних для експорту
    const exportData = dataToExport.map(athlete => {
      const data: any = {};

      if (options.fields.includes('name')) {
        data['Ім\'я'] = `${athlete.firstName} ${athlete.lastName}`;
      }
      if (options.fields.includes('email')) {
        data['Email'] = athlete.email;
      }
      if (options.fields.includes('license')) {
        data['Ліцензія'] = athlete.license || '';
      }
      if (options.fields.includes('discipline')) {
        data['Дисципліни'] = athlete.disciplines.join(', ');
      }
      if (options.fields.includes('club')) {
        data['Клуб'] = athlete.club || '';
      }
      if (options.fields.includes('country')) {
        data['Країна'] = athlete.country;
      }
      if (options.fields.includes('coach')) {
        data['Тренер'] = athlete.coach || '';
      }
      if (options.fields.includes('age')) {
        data['Вік'] = athlete.yearOfBirth ? new Date().getFullYear() - athlete.yearOfBirth : '';
      }
      if (options.fields.includes('status')) {
        data['Статус'] = athlete.status;
      }

      return data;
    });

    // Симуляція різних форматів експорту
    switch (format) {
      case 'pdf':
        console.log('📄 PDF експорт:', { title, athletes: exportData.length, options });
        break;
      case 'excel':
        console.log('📊 Excel експорт:', { title, athletes: exportData.length, options });
        break;
      case 'csv':
        const csvContent = generateCSV(exportData);
        console.log('📋 CSV експорт:', csvContent.substring(0, 200) + '...');
        break;
      case 'json':
        console.log('📝 JSON експорт:', JSON.stringify(exportData, null, 2).substring(0, 200) + '...');
        break;
    }

    setIsExporting(false);
    setExportSuccess(true);

    // Скинути успіх через 3 секунди
    setTimeout(() => {
      setExportSuccess(false);
      setIsOpen(false);
    }, 3000);
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          return value.toString().includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (field?.required) return; // Не можна видалити обов'язкові поля

    setOptions(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />;
      case 'json': return <FileJson className="h-4 w-4" />;
      case 'image': return <FileImage className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'pdf': return 'Професійний документ для друку та презентацій';
      case 'excel': return 'Таблиця Excel для аналізу та обробки даних';
      case 'csv': return 'Простий формат для імпорту в інші системи';
      case 'json': return 'Структуровані дані для розробників';
      case 'image': return 'Зображення списку для швидкого перегляду';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Експорт</span>
          {selectedAthletes && (
            <Badge variant="secondary">{selectedAthletes.length}</Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Експорт даних спортсменів</span>
          </DialogTitle>
          <DialogDescription>
            Експортуйте дані {dataToExport.length} спортсменів у зручному форматі
          </DialogDescription>
        </DialogHeader>

        {!exportSuccess ? (
          <div className="space-y-6">
            {/* Вибір формату */}
            <div>
              <label className="text-sm font-medium mb-2 block">Формат експорту</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'pdf', label: 'PDF документ' },
                  { value: 'excel', label: 'Excel таблиця' },
                  { value: 'csv', label: 'CSV файл' },
                  { value: 'json', label: 'JSON дані' }
                ].map(format => (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      options.format === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        {getFormatIcon(format.value)}
                        <span className="font-medium text-sm">{format.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {getFormatDescription(format.value)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Вибір полів */}
            <div>
              <label className="text-sm font-medium mb-2 block">Дані для експорту</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {AVAILABLE_FIELDS.map(field => (
                  <label
                    key={field.id}
                    className={`flex items-center space-x-2 text-sm cursor-pointer p-1 rounded ${
                      field.required ? 'text-gray-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={options.fields.includes(field.id)}
                      onChange={() => handleFieldToggle(field.id)}
                      disabled={field.required}
                      className="rounded"
                    />
                    <span>{field.label}</span>
                    {field.required && (
                      <Badge variant="outline" className="text-xs">обов'язково</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Додаткові опції */}
            <div>
              <label className="text-sm font-medium mb-2 block">Додаткові дані</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeResults}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeResults: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Включити результати змагань</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeStats}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Включити статистику</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includePhotos}
                    onChange={(e) => setOptions(prev => ({ ...prev, includePhotos: e.target.checked }))}
                    className="rounded"
                    disabled={options.format === 'csv' || options.format === 'json'}
                  />
                  <span>Включити фотографії (тільки PDF/Excel)</span>
                </label>
              </div>
            </div>

            {/* Попередній перегляд */}
            <div>
              <label className="text-sm font-medium mb-2 block">Попередній перегляд</label>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>📄 Формат: <span className="font-medium">{options.format.toUpperCase()}</span></div>
                    <div>👥 Спортсменів: <span className="font-medium">{dataToExport.length}</span></div>
                    <div>📋 Полів: <span className="font-medium">{options.fields.length}</span></div>
                    <div>📊 Розмір: <span className="font-medium">~{Math.round(dataToExport.length * options.fields.length * 0.1)}KB</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Експорт завершено успішно!
            </h3>
            <p className="text-green-700">
              Дані {dataToExport.length} спортсменів експортовано у форматі {options.format.toUpperCase()}
            </p>
          </div>
        )}

        <DialogFooter>
          {!exportSuccess && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Скасувати
              </Button>
              <Button
                onClick={() => simulateExport(options.format)}
                disabled={isExporting || options.fields.length === 0}
                className="flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Експорт...</span>
                  </>
                ) : (
                  <>
                    {getFormatIcon(options.format)}
                    <span>Експортувати {options.format.toUpperCase()}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
