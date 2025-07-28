"use client";

import { useState, useEffect } from 'react';

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      // Початок з нуля - без демо змагань
      const mockCompetitions: any[] = [];
      setCompetitions(mockCompetitions);
    } catch (error) {
      console.error('Помилка завантаження змагань:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (competitionId: string, newStatus: string) => {
    try {
      setCompetitions(competitions.map((comp: any) =>
        comp.id === competitionId ? { ...comp, status: newStatus, updatedAt: new Date().toISOString() } : comp
      ));
      alert(`Статус змагання змінено на "${newStatus}"`);
    } catch (error) {
      alert('Помилка зміни статусу');
    }
  };

  const handleDelete = async (competitionId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це змагання?')) return;

    try {
      setCompetitions(competitions.filter((comp: any) => comp.id !== competitionId));
      alert('Змагання видалено успішно');
    } catch (error) {
      alert('Помилка видалення змагання');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      registration: 'bg-green-100 text-green-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels: Record<string, string> = {
      upcoming: 'Очікується',
      registration: 'Реєстрація',
      ongoing: 'Проводиться',
      completed: 'Завершено',
      cancelled: 'Скасовано'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.upcoming}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      local: 'bg-green-100 text-green-800',
      regional: 'bg-blue-100 text-blue-800',
      national: 'bg-purple-100 text-purple-800',
      international: 'bg-red-100 text-red-800'
    };

    const labels: Record<string, string> = {
      local: 'Місцевий',
      regional: 'Регіональний',
      national: 'Національний',
      international: 'Міжнародний'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[level] || styles.local}`}>
        {labels[level] || level}
      </span>
    );
  };

  const isRegistrationOpen = (competition: any) => {
    const today = new Date();
    const deadline = new Date(competition.registrationDeadline);
    return today <= deadline && competition.status === 'registration';
  };

  const filteredCompetitions = competitions.filter((comp: any) => {
    const matchesSearch = comp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.organizer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || comp.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || comp.level === filterLevel;

    let matchesDate = true;
    if (filterDate !== 'all') {
      const today = new Date();
      const compDate = new Date(comp.startDate);

      if (filterDate === 'thisMonth') {
        matchesDate = compDate.getMonth() === today.getMonth() && compDate.getFullYear() === today.getFullYear();
      } else if (filterDate === 'thisYear') {
        matchesDate = compDate.getFullYear() === today.getFullYear();
      } else if (filterDate === 'past') {
        matchesDate = compDate < today;
      } else if (filterDate === 'future') {
        matchesDate = compDate > today;
      }
    }

    return matchesSearch && matchesStatus && matchesLevel && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏆 Управління змаганнями</h1>
              <p className="text-gray-600 text-sm">Створення, редагування та управління змаганнями</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin-panel/competitions/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                ➕ Створити змагання
              </a>
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{competitions.length}</div>
            <div className="text-sm text-gray-600">Всього змагань</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {competitions.filter((c: any) => c.status === 'registration' || c.status === 'upcoming').length}
            </div>
            <div className="text-sm text-gray-600">Активні змагання</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {competitions.reduce((sum: number, c: any) => sum + c.registeredParticipants, 0)}
            </div>
            <div className="text-sm text-gray-600">Всього учасників</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {competitions.filter((c: any) => c.level === 'international').length}
            </div>
            <div className="text-sm text-gray-600">Міжнародні змагання</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Пошук змагань..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі статуси</option>
              <option value="upcoming">Очікується</option>
              <option value="registration">Реєстрація</option>
              <option value="ongoing">Проводиться</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Скасовано</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі рівні</option>
              <option value="local">Місцевий</option>
              <option value="regional">Регіональний</option>
              <option value="national">Національний</option>
              <option value="international">Міжнародний</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі дати</option>
              <option value="thisMonth">Цей місяць</option>
              <option value="thisYear">Цей рік</option>
              <option value="future">Майбутні</option>
              <option value="past">Минулі</option>
            </select>

            <button
              onClick={() => alert('Експорт в розробці')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Експорт
            </button>
          </div>
        </div>

        {/* Competitions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Завантаження...</p>
            </div>
          ) : filteredCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Змагань не знайдено</div>
              <a
                href="/admin-panel/competitions/create"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Створити перше змагання
              </a>
            </div>
          ) : (
            filteredCompetitions.map((competition: any) => (
              <div key={competition.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(competition.status)}
                        {getLevelBadge(competition.level)}
                        {isRegistrationOpen(competition) && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded animate-pulse">
                            🔥 Реєстрація відкрита
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{competition.title}</h3>
                      <p className="text-gray-600 mt-1">{competition.description}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">📅 Дати проведення</span>
                      <div className="font-medium">
                        {new Date(competition.startDate).toLocaleDateString('uk-UA')} - {new Date(competition.endDate).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">📍 Місце проведення</span>
                      <div className="font-medium">{competition.location}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">👥 Учасники</span>
                      <div className="font-medium">
                        {competition.registeredParticipants} / {competition.maxParticipants}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(competition.registeredParticipants / competition.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">💰 Внесок</span>
                      <div className="font-medium">{competition.entryFee} грн</div>
                    </div>
                  </div>

                  {/* Categories and Disciplines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">🎯 Вікові групи</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competition.ageGroups.map((age: string, index: number) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {age}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">🏃‍♀️ Дисципліни</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competition.disciplines.map((discipline: string, index: number) => (
                          <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {discipline}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">⏰ Дедлайн реєстрації:</span>
                        <div className={`font-medium ${new Date(competition.registrationDeadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(competition.registrationDeadline).toLocaleDateString('uk-UA')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">🏢 Організатор:</span>
                        <div className="font-medium">{competition.organizer}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">🏆 Нагороди:</span>
                        <div className="font-medium">{competition.prizes.join(', ')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <select
                        value={competition.status}
                        onChange={(e) => handleStatusChange(competition.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="upcoming">Очікується</option>
                        <option value="registration">Реєстрація</option>
                        <option value="ongoing">Проводиться</option>
                        <option value="completed">Завершено</option>
                        <option value="cancelled">Скасовано</option>
                      </select>

                      <a
                        href={`/admin-panel/registrations?competition=${competition.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        📋 Заявки ({competition.registeredParticipants})
                      </a>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={`/competitions/${competition.id}`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        👁️ Переглянути
                      </a>
                      <a
                        href={`/admin-panel/competitions/${competition.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ✏️ Редагувати
                      </a>
                      <button
                        onClick={() => handleDelete(competition.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
