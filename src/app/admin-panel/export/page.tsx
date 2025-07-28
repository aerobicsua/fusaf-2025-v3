"use client";

import { useState } from 'react';

export default function AdminExportPage() {
  const [loading, setLoading] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState('athletes');
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    category: 'all'
  });

  const dataTypes = [
    {
      id: 'athletes',
      name: 'Спортсмени',
      description: 'Повна база даних зареєстрованих спортсменів',
      icon: '🏃‍♂️',
      fields: ['ПІБ', 'Email', 'Дата народження', 'Стать', 'Клуб', 'Тренер', 'Область', 'Місто', 'Статус', 'Дата реєстрації']
    },
    {
      id: 'coaches',
      name: 'Тренери та судді',
      description: 'База тренерів та суддів з їх кваліфікаціями',
      icon: '👨‍🏫',
      fields: ['ПІБ', 'Email', 'Ролі', 'Ліцензія', 'Спеціалізація', 'Досвід', 'Клуб', 'Область', 'Статус']
    },
    {
      id: 'clubs',
      name: 'Клуби та підрозділи',
      description: 'Інформація про спортивні клуби та підрозділи',
      icon: '🏢',
      fields: ['Назва', 'Тип', 'Керівник', 'Email', 'Телефон', 'Адреса', 'Область', 'Кількість спортсменів']
    },
    {
      id: 'competitions',
      name: 'Змагання',
      description: 'Дані про проведені та заплановані змагання',
      icon: '🏆',
      fields: ['Назва', 'Рівень', 'Дата', 'Місце', 'Організатор', 'Учасники', 'Статус', 'Внесок']
    },
    {
      id: 'courses',
      name: 'Курси підвищення кваліфікації',
      description: 'Інформація про курси для тренерів та суддів',
      icon: '🎓',
      fields: ['Назва', 'Тип', 'Рівень', 'Дата', 'Викладач', 'Слухачі', 'Вартість', 'Статус']
    },
    {
      id: 'registrations',
      name: 'Реєстрації на змагання',
      description: 'Заявки спортсменів на участь у змаганнях',
      icon: '📋',
      fields: ['Спортсмен', 'Змагання', 'Дисципліна', 'Вікова група', 'Статус заявки', 'Дата подачі']
    },
    {
      id: 'news',
      name: 'Новини',
      description: 'Архів новин та публікацій',
      icon: '📰',
      fields: ['Заголовок', 'Автор', 'Категорія', 'Дата публікації', 'Статус', 'Перегляди']
    }
  ];

  const regions = [
    'Київська', 'Львівська', 'Харківська', 'Одеська', 'Дніпропетровська',
    'Запорізька', 'Полтавська', 'Івано-Франківська', 'Тернопільська', 'Чернівецька'
  ];

  const handleExport = async () => {
    if (!selectedDataType) {
      alert('Виберіть тип даних для експорту');
      return;
    }

    setLoading(true);

    try {
      // Симуляція експорту даних
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedData = dataTypes.find(type => type.id === selectedDataType);
      const filename = `${selectedData?.name}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

      // Тут би був реальний API запит
      console.log('Експорт даних:', {
        dataType: selectedDataType,
        format: exportFormat,
        dateRange,
        filters,
        filename
      });

      // Симуляція завантаження файлу
      const mockData = generateMockData(selectedDataType);
      downloadFile(mockData, filename, exportFormat);

      alert(`Файл ${filename} успішно експортовано!`);
    } catch (error) {
      alert('Помилка експорту: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (dataType: string) => {
    // Генерація демо-даних для експорту
    const data = [];
    const selectedType = dataTypes.find(type => type.id === dataType);

    for (let i = 1; i <= 10; i++) {
      const row: Record<string, any> = {};
      selectedType?.fields.forEach(field => {
        switch (field) {
          case 'ПІБ':
            row[field] = `Тестовий Користувач ${i}`;
            break;
          case 'Email':
            row[field] = `user${i}@example.com`;
            break;
          case 'Дата народження':
          case 'Дата реєстрації':
          case 'Дата':
            row[field] = new Date(2000 + Math.random() * 24, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('uk-UA');
            break;
          case 'Статус':
            row[field] = Math.random() > 0.5 ? 'Активний' : 'Неактивний';
            break;
          default:
            row[field] = `Значення ${i}`;
        }
      });
      data.push(row);
    }

    return data;
  };

  const downloadFile = (data: any[], filename: string, format: string) => {
    let content = '';
    let mimeType = '';

    if (format === 'csv') {
      // CSV формат
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      content = headers + '\n' + rows;
      mimeType = 'text/csv';
    } else {
      // Для XLS використовуємо CSV з табуляцією
      const headers = Object.keys(data[0]).join('\t');
      const rows = data.map(row => Object.values(row).join('\t')).join('\n');
      content = headers + '\n' + rows;
      mimeType = 'application/vnd.ms-excel';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedType = dataTypes.find(type => type.id === selectedDataType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Експорт даних</h1>
              <p className="text-gray-600 text-sm">Завантаження даних у форматах XLS та CSV</p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dataTypes.map(type => (
            <div
              key={type.id}
              onClick={() => setSelectedDataType(type.id)}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                selectedDataType === type.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{type.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{type.description}</p>
              <div className="text-xs text-gray-500">
                Поля: {type.fields.slice(0, 3).join(', ')}
                {type.fields.length > 3 && ` +${type.fields.length - 3} ще`}
              </div>
            </div>
          ))}
        </div>

        {/* Export Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Налаштування експорту</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Selected Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип даних
              </label>
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {dataTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Формат файлу
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="xlsx">📊 Excel (XLSX)</option>
                <option value="csv">📄 CSV</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Період від
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Період до
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional Filters */}
            {selectedDataType === 'athletes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Всі статуси</option>
                    <option value="active">Активні</option>
                    <option value="blocked">Заблоковані</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Область
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Всі області</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Data Preview */}
        {selectedType && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Попередній перегляд: {selectedType.name}
            </h2>

            <div className="mb-4">
              <p className="text-gray-600">{selectedType.description}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Поля для експорту:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedType.fields.map((field, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              💡 Файл буде містити всі записи, що відповідають заданим фільтрам
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Готові до експорту?</h3>
              <p className="text-gray-600 text-sm">
                Файл буде завантажено у форматі {exportFormat.toUpperCase()}
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={loading || !selectedDataType}
              className={`px-8 py-3 rounded-lg font-medium flex items-center ${
                loading || !selectedDataType
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Експортуємо...
                </>
              ) : (
                <>
                  📥 Експортувати дані
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Довідка</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>XLS формат:</strong> Підходить для роботи в Excel з можливістю форматування</p>
            <p>• <strong>CSV формат:</strong> Універсальний формат для імпорту в різні системи</p>
            <p>• <strong>Фільтри:</strong> Дозволяють експортувати тільки потрібні дані</p>
            <p>• <strong>Діапазон дат:</strong> Обмежує експорт записами в заданому періоді</p>
          </div>
        </div>
      </div>
    </div>
  );
}
