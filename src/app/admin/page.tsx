"use client";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>🎉 УСПІХ!</strong> Повна адмін панель /admin працює!
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🏛️ Повна Адмін Панель ФУСАФ
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📧 Email Система
            </h3>
            <p className="text-blue-600 mb-4">
              Тестування та управління email розсилками
            </p>
            <a
              href="/admin/test-email"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Тестувати Email
            </a>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              👥 Користувачі
            </h3>
            <p className="text-purple-600 mb-4">
              Управління користувачами системи
            </p>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              disabled
            >
              В розробці
            </button>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              🗄️ База Даних
            </h3>
            <p className="text-green-600 mb-4">
              Очистка демо даних
            </p>
            <button
              onClick={() => {
                if (confirm('Очистити всі демо дані?')) {
                  fetch('/api/clear-demo-data', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => alert(data.message || 'Виконано'))
                    .catch(err => alert('Помилка: ' + err.message));
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Очистити
            </button>
          </div>

        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ℹ️ Інформація про AdminLayout
          </h3>
          <p className="text-yellow-700">
            Цей файл `/admin/page.tsx` тепер максимально спрощений без складних залежностей.
            Якщо ви бачите цю сторінку - то AdminLayout працює правильно!
          </p>
        </div>

        <div className="mt-6">
          <a
            href="/admin-direct"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 mr-4"
          >
            ← Повернутися до Debug панелі
          </a>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            🏠 На головну
          </a>
        </div>
      </div>
    </div>
  );
}
