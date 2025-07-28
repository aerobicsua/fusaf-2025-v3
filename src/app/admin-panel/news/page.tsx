"use client";

import { useState, useEffect } from 'react';

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      // Завантажуємо новини з localStorage
      const savedNews = JSON.parse(localStorage.getItem('approvedNews') || '[]');
      setNews(savedNews);
    } catch (error) {
      console.error('Помилка завантаження новин:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newsId: string, newStatus: string) => {
    try {
      const updatedNews = news.map((item: any) =>
        item.id === newsId ? {
          ...item,
          status: newStatus,
          publishedAt: newStatus === 'published' ? new Date().toISOString() : item.publishedAt,
          updatedAt: new Date().toISOString()
        } : item
      );

      setNews(updatedNews);
      localStorage.setItem('approvedNews', JSON.stringify(updatedNews));
      alert(`Статус новини змінено на "${newStatus}"`);
    } catch (error) {
      alert('Помилка зміни статусу');
    }
  };

  const handleDelete = async (newsId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю новину?')) return;

    try {
      const updatedNews = news.filter((item: any) => item.id !== newsId);
      setNews(updatedNews);
      localStorage.setItem('approvedNews', JSON.stringify(updatedNews));
      alert('Новину видалено успішно');
    } catch (error) {
      alert('Помилка видалення новини');
    }
  };

  const handleFeatureToggle = async (newsId: string) => {
    try {
      setNews(news.map((item: any) =>
        item.id === newsId ? { ...item, featured: !item.featured } : item
      ));
    } catch (error) {
      alert('Помилка зміни статусу рекомендованої новини');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };

    const labels: Record<string, string> = {
      published: 'Опубліковано',
      draft: 'Чернетка',
      scheduled: 'Заплановано',
      archived: 'Архів'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredNews = news.filter((item: any) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ['Змагання', 'Правила', 'Навчання', 'Анонси', 'Досягнення'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📰 Управління новинами</h1>
              <p className="text-gray-600 text-sm">Створення, редагування та публікація новин</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin-panel/news/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                ✍️ Створити новину
              </a>
              <a href="/admin-panel" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до панелі
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{news.length}</div>
            <div className="text-sm text-gray-600">Всього новин</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {news.filter((item: any) => item.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Опубліковано</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {news.filter((item: any) => item.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Чернетки</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {news.filter((item: any) => item.featured).length}
            </div>
            <div className="text-sm text-gray-600">Рекомендовані</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Пошук по заголовку, контенту..."
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
              <option value="published">Опубліковано</option>
              <option value="draft">Чернетки</option>
              <option value="scheduled">Заплановано</option>
              <option value="archived">Архів</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі категорії</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => alert('Експорт в розробці')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Експорт
            </button>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Завантаження...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Новин не знайдено</div>
              <a
                href="/admin-panel/news/create"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Створити першу новину
              </a>
            </div>
          ) : (
            filteredNews.map((newsItem: any) => (
              <div key={newsItem.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(newsItem.status)}
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {newsItem.category}
                        </span>
                        {newsItem.featured && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            ⭐ Рекомендована
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {newsItem.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {newsItem.content}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👤 {newsItem.author}</span>
                        <span>
                          📅 {newsItem.publishedAt
                            ? new Date(newsItem.publishedAt).toLocaleDateString('uk-UA')
                            : 'Не опубліковано'
                          }
                        </span>
                        {newsItem.views > 0 && <span>👁️ {newsItem.views}</span>}
                        {newsItem.likes > 0 && <span>❤️ {newsItem.likes}</span>}
                      </div>

                      {/* Tags */}
                      {newsItem.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {newsItem.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    {newsItem.image && (
                      <div className="ml-6 flex-shrink-0">
                        <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          🖼️
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-4">

                      {/* Quick Status Change */}
                      <select
                        value={newsItem.status}
                        onChange={(e) => handleStatusChange(newsItem.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Чернетка</option>
                        <option value="published">Опублікувати</option>
                        <option value="scheduled">Запланувати</option>
                        <option value="archived">Архівувати</option>
                      </select>

                      <button
                        onClick={() => handleFeatureToggle(newsItem.id)}
                        className={`text-sm px-3 py-1 rounded ${
                          newsItem.featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {newsItem.featured ? '⭐ Рекомендована' : '☆ Рекомендувати'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={`/admin-panel/news/${newsItem.id}/preview`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        👁️ Переглянути
                      </a>
                      <a
                        href={`/admin-panel/news/${newsItem.id}/edit`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        ✏️ Редагувати
                      </a>
                      <button
                        onClick={() => handleDelete(newsItem.id)}
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

        {/* Pagination */}
        {filteredNews.length > 10 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                ← Попередня
              </button>
              <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">1</span>
              <button className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Наступна →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
