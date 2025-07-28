"use client";

import { useState, useEffect } from "react";

export default function AdminPanelPage() {
  // Стани для динамічних лічільників
  const [clubsCount, setClubsCount] = useState(0);
  const [athletesCount, setAthletesCount] = useState(0);
  const [trainersCount, setTrainersCount] = useState(0);
  const [competitionsCount, setCompetitionsCount] = useState(0);

  // Завантаження даних при ініціалізації
  useEffect(() => {
    loadAdminStats();

    // Автооновлення кожні 5 секунд
    const interval = setInterval(() => {
      console.log('🔄 Оновлення статистики адмін-панелі...');
      loadAdminStats();
    }, 5000);

    // Слухаємо події оновлення
    const handleDataUpdate = () => {
      console.log('🔔 Отримано подію оновлення даних');
      loadAdminStats();
    };

    window.addEventListener('clubsUpdated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('clubsUpdated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, []);

  const loadAdminStats = async () => {
    try {
      // Завантажуємо клуби з API
      console.log('🏢 Адмін-панель: Завантаження клубів з API...');
      try {
        const clubsResponse = await fetch('/api/clubs/approved');
        const clubsData = await clubsResponse.json();
        const clubs = clubsData.success ? clubsData.clubs : [];
        console.log(`🏢 Адмін-панель: Завантажено клубів з API: ${clubs.length}`);
        setClubsCount(clubs.length);
      } catch (error) {
        console.error('❌ Адмін-панель: Помилка завантаження клубів з API:', error);
        setClubsCount(0);
      }

      // Завантажуємо інші дані з localStorage (поки що)
      const athletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
      const trainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
      const competitions = JSON.parse(localStorage.getItem('approvedCompetitions') || '[]');

      console.log(`🏃 Адмін-панель: Завантажено спортсменів: ${athletes.length}`);
      console.log(`👨‍🏫 Адмін-панель: Завантажено тренерів: ${trainers.length}`);
      console.log(`🏆 Адмін-панель: Завантажено змагань: ${competitions.length}`);

      setAthletesCount(athletes.length);
      setTrainersCount(trainers.length);
      setCompetitionsCount(competitions.length);

    } catch (error) {
      console.error('❌ Помилка завантаження статистики:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 Адміністративна панель ФУСАФ</h1>
              <p className="text-gray-600 text-sm">Управління спортсменами, тренерами, клубами та змаганнями</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Адміністратор</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">А</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">{athletesCount}</div>
            <div className="text-sm text-gray-600">Спортсменів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{trainersCount}</div>
            <div className="text-sm text-gray-600">Тренерів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">{clubsCount}</div>
            <div className="text-sm text-gray-600">Клубів</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">{competitionsCount}</div>
            <div className="text-sm text-gray-600">Змагань</div>
          </div>
        </div>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                👥
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Користувачі</h3>
                <p className="text-gray-600 text-sm">Управління учасниками</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href="/admin-panel/athletes" className="block w-full text-left bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-blue-700 font-medium">
                🏃‍♂️ Спортсмени
              </a>
              <a href="/admin-panel/coaches" className="block w-full text-left bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-green-700 font-medium">
                🏋️‍♂️ Тренери та судді
              </a>
              <a href="/admin-panel/club-requests" className="block w-full text-left bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-purple-700 font-medium">
                🏢 Заявки на клуби
              </a>
            </div>
          </div>

          {/* Content Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                📝
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Контент</h3>
                <p className="text-gray-600 text-sm">Новини та інформація</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href="/admin-panel/news" className="block w-full text-left bg-yellow-50 hover:bg-yellow-100 px-4 py-2 rounded-lg text-yellow-700 font-medium">
                📰 Новини
              </a>
              <a href="/admin-panel/news/create" className="block w-full text-left bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-blue-700 font-medium">
                ✍️ Створити новину
              </a>
            </div>
          </div>

          {/* Events Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                🏆
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Події</h3>
                <p className="text-gray-600 text-sm">Змагання та курси</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href="/admin-panel/competitions" className="block w-full text-left bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg text-orange-700 font-medium">
                🏆 Змагання
              </a>
              <a href="/admin-panel/courses" className="block w-full text-left bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-purple-700 font-medium">
                📚 Курси
              </a>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                📊
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Аналітика</h3>
                <p className="text-gray-600 text-sm">Звіти та статистика</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href="/admin-panel/analytics" className="block w-full text-left bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-blue-700 font-medium">
                📈 Детальна аналітика
              </a>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">📋 Останні дії</h3>
            <p className="text-blue-100 text-sm mb-4">Перегляньте останні заявки та дії користувачів</p>
            <a href="/admin-panel/club-requests" className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
              Переглянути заявки
            </a>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">📧 Повідомлення</h3>
            <p className="text-green-100 text-sm mb-4">Надішліть повідомлення всім користувачам або групам</p>
            <a href="/admin-panel/notifications" className="inline-block bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50">
              Створити повідомлення
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
