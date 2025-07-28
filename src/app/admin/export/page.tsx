"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileText,
  Database,
  Users,
  Building,
  Trophy,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedSize: string;
  recordCount?: number;
}

const exportOptions: ExportOption[] = [
  {
    id: 'users',
    name: 'Всі користувачі',
    description: 'Повний список користувачів з усіма даними',
    icon: <Users className="h-5 w-5" />,
    estimatedSize: '~2MB'
  },
  {
    id: 'athletes',
    name: 'Спортсмени',
    description: 'Список спортсменів з спортивною інформацією',
    icon: <Users className="h-5 w-5" />,
    estimatedSize: '~1MB'
  },
  {
    id: 'clubs',
    name: 'Клуби',
    description: 'Реєстр спортивних клубів та організацій',
    icon: <Building className="h-5 w-5" />,
    estimatedSize: '~500KB'
  },
  {
    id: 'competitions',
    name: 'Змагання',
    description: 'Список змагань з деталями та статистикою',
    icon: <Trophy className="h-5 w-5" />,
    estimatedSize: '~1.5MB'
  },
  {
    id: 'registrations',
    name: 'Реєстрації',
    description: 'Реєстрації на змагання та заявки',
    icon: <FileText className="h-5 w-5" />,
    estimatedSize: '~3MB'
  }
];

const formatOptions = [
  { value: 'csv', label: 'CSV (Excel)', description: 'Для роботи з Excel та Google Sheets' },
  { value: 'json', label: 'JSON', description: 'Для розробників та інтеграції' }
];

export default function AdminExportPage() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResults, setExportResults] = useState<any[]>([]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === exportOptions.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(exportOptions.map(option => option.id));
    }
  };

  const handleSingleExport = async (type: string) => {
    try {
      setExporting(true);
      setExportProgress(30);

      const response = await fetch(`/api/admin/export?type=${type}&format=${format}`);

      setExportProgress(70);

      if (response.ok) {
        if (format === 'csv') {
          // Для CSV створюємо blob та завантажуємо файл
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FUSAF_${type}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Для JSON відкриваємо в новій вкладці
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FUSAF_${type}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        setExportProgress(100);

        setExportResults(prev => [...prev, {
          type,
          status: 'success',
          timestamp: new Date().toISOString(),
          message: 'Експорт завершено успішно'
        }]);

      } else {
        throw new Error('Помилка експорту');
      }

    } catch (error) {
      console.error('Помилка експорту:', error);

      setExportResults(prev => [...prev, {
        type,
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Помилка експорту'
      }]);

    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleBulkExport = async () => {
    if (selectedOptions.length === 0) return;

    try {
      setExporting(true);
      setExportProgress(0);
      setExportResults([]);

      const progressStep = 100 / selectedOptions.length;

      for (let i = 0; i < selectedOptions.length; i++) {
        const type = selectedOptions[i];
        setExportProgress((i + 0.5) * progressStep);

        try {
          const response = await fetch(`/api/admin/export?type=${type}&format=${format}`);

          if (response.ok) {
            if (format === 'csv') {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `FUSAF_${type}_${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } else {
              const data = await response.json();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `FUSAF_${type}_${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }

            setExportResults(prev => [...prev, {
              type,
              status: 'success',
              timestamp: new Date().toISOString(),
              message: 'Експорт завершено успішно'
            }]);

          } else {
            throw new Error('Помилка експорту');
          }

        } catch (error) {
          console.error(`Помилка експорту ${type}:`, error);

          setExportResults(prev => [...prev, {
            type,
            status: 'error',
            timestamp: new Date().toISOString(),
            message: 'Помилка експорту'
          }]);
        }

        setExportProgress((i + 1) * progressStep);

        // Невелика затримка між експортами
        if (i < selectedOptions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Експорт даних</h1>
          <p className="text-gray-600 mt-1">
            Завантаження даних системи у форматі Excel (CSV) або JSON
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">MySQL Database</span>
        </div>
      </div>

      {/* Налаштування експорту */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Вибір даних для експорту */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Оберіть дані для експорту
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedOptions.length === exportOptions.length ? 'Скасувати все' : 'Обрати все'}
                </Button>
              </div>
              <CardDescription>
                Виберіть типи даних, які потрібно експортувати
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleOptionToggle(option.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {option.icon}
                        <h3 className="font-medium">{option.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {option.estimatedSize}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSingleExport(option.id)}
                        disabled={exporting}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Швидкий експорт
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Налаштування та дії */}
        <div className="space-y-6">
          {/* Формат файлу */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Формат експорту</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Дії */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дії експорту</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleBulkExport}
                disabled={selectedOptions.length === 0 || exporting}
                className="w-full"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Експорт...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Експортувати обране ({selectedOptions.length})
                  </>
                )}
              </Button>

              {exporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогрес експорту</span>
                    <span>{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Файли автоматично завантажуються у папку Downloads</p>
                <p>• CSV файли відкриваються в Excel</p>
                <p>• JSON файли для розробників та API</p>
              </div>
            </CardContent>
          </Card>

          {/* Статистика останніх експортів */}
          {exportResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Останні експорти</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exportResults.slice(-5).map((result, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="flex-1">{exportOptions.find(o => o.id === result.type)?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString('uk-UA')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Інформаційні карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">CSV (Excel)</div>
                <div className="text-sm text-gray-600">Ідеально для аналітики</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Реальні дані</div>
                <div className="text-sm text-gray-600">З MySQL бази даних</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Актуальність</div>
                <div className="text-sm text-gray-600">Дані в реальному часі</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
