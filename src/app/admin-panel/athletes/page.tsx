"use client";

import { useState, useEffect } from 'react';

export default function AdminAthletesPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      // Початок з нуля - без демо спортсменів
      const data = { athletes: [] };
      setAthletes(data.athletes || []);
    } catch (error) {
      console.error('Помилка завантаження спортсменів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAthlete = async (athleteId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього спортсмена?')) return;

    try {
      await fetch(`/api/athletes/${athleteId}`, { method: 'DELETE' });
      setAthletes(athletes.filter((a: any) => a.id !== athleteId));
      alert('Спортсмена видалено успішно');
    } catch (error) {
      alert('Помилка видалення спортсмена');
    }
  };

  const handleBlockAthlete = async (athleteId: string, block: boolean) => {
    try {
      await fetch(`/api/athletes/${athleteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: block })
      });
      loadAthletes();
      alert(`Спортсмена ${block ? 'заблоковано' : 'розблоковано'} успішно`);
    } catch (error) {
      alert('Помилка зміни статусу спортсмена');
    }
  };

  const handleExport = () => {
    const data = athletes.map((athlete: any) => ({
      'ПІБ': athlete.name,
      'Email': athlete.email,
      'Дата народження': athlete.dateOfBirth,
      'Стать': athlete.gender,
      'Клуб': athlete.club,
      'Тренер': athlete.coach,
      'Область': athlete.region,
      'Місто': athlete.city,
      'Статус': athlete.blocked ? 'Заблокований' : 'Активний',
      'Дата реєстрації': new Date(athlete.registeredAt).toLocaleDateString('uk-UA')
    }));

    // Симуляція експорту
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athletes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredAthletes = athletes.filter((athlete: any) => {
    const matchesSearch = athlete.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.club?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && !athlete.blocked) ||
                         (filterStatus === 'blocked' && athlete.blocked);

    const matchesRegion = filterRegion === 'all' || athlete.region === filterRegion;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  const regions = ['Київська', 'Львівська', 'Харківська', 'Одеська', 'Дніпропетровська', 'Запорізька'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏃‍♂️ Управління спортсменами</h1>
              <p className="text-gray-600 text-sm">Перегляд, редагування та експорт даних спортсменів</p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">

            {/* Search */}
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Пошук по імені, email або клубу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Всі статуси</option>
                <option value="active">Активні</option>
                <option value="blocked">Заблоковані</option>
              </select>

              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Всі області</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                📊 Експорт XLS
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Знайдено: {filteredAthletes.length} спортсменів</span>
            {selectedAthletes.length > 0 && (
              <span>Вибрано: {selectedAthletes.length}</span>
            )}
          </div>
        </div>

        {/* Athletes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAthletes(filteredAthletes.map((a: any) => a.id));
                        } else {
                          setSelectedAthletes([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Спортсмен
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клуб
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Область
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата реєстрації
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Завантаження...</p>
                    </td>
                  </tr>
                ) : filteredAthletes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Спортсменів не знайдено
                    </td>
                  </tr>
                ) : (
                  filteredAthletes.map((athlete: any) => (
                    <tr key={athlete.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAthletes.includes(athlete.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAthletes([...selectedAthletes, athlete.id]);
                            } else {
                              setSelectedAthletes(selectedAthletes.filter(id => id !== athlete.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {athlete.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{athlete.name}</div>
                            <div className="text-sm text-gray-500">{athlete.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {athlete.club || 'Не вказано'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {athlete.region || 'Не вказано'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          athlete.blocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {athlete.blocked ? 'Заблокований' : 'Активний'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(athlete.registeredAt).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <a
                          href={`/admin-panel/athletes/${athlete.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✏️ Редагувати
                        </a>
                        <button
                          onClick={() => handleBlockAthlete(athlete.id, !athlete.blocked)}
                          className={`${
                            athlete.blocked
                              ? 'text-green-600 hover:text-green-900'
                              : 'text-orange-600 hover:text-orange-900'
                          }`}
                        >
                          {athlete.blocked ? '✅ Розблокувати' : '🚫 Блокувати'}
                        </button>
                        <button
                          onClick={() => handleDeleteAthlete(athlete.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Видалити
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAthletes.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Вибрано {selectedAthletes.length} спортсменів
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    if (confirm(`Заблокувати ${selectedAthletes.length} спортсменів?`)) {
                      // Bulk block logic here
                      alert('Функція в розробці');
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Заблокувати вибраних
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Видалити ${selectedAthletes.length} спортсменів?`)) {
                      // Bulk delete logic here
                      alert('Функція в розробці');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Видалити вибраних
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
