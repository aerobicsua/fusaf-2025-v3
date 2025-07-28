"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Змагання',
    status: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    tags: '',
    publishDate: '',
    publishTime: '',
    image: null as File | null
  });

  const categories = ['Змагання', 'Правила', 'Навчання', 'Анонси', 'Досягнення', 'Курси', 'Клуби'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Підготовка даних для відправки
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publishedAt: formData.status === 'published'
          ? new Date().toISOString()
          : formData.status === 'scheduled' && formData.publishDate
            ? new Date(`${formData.publishDate}T${formData.publishTime || '09:00'}`).toISOString()
            : null,
        author: 'Адміністратор', // TODO: взяти з контексту користувача
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0
      };

      // Збереження новини в localStorage
      const newsId = `news-${Date.now()}`;
      const newsItem = {
        id: newsId,
        ...submitData
      };

      // Завантажуємо існуючі новини
      const existingNews = JSON.parse(localStorage.getItem('approvedNews') || '[]');
      existingNews.push(newsItem);
      localStorage.setItem('approvedNews', JSON.stringify(existingNews));

      console.log('Новину збережено:', newsItem);

      // Симуляція успішного створення
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Новину створено та збережено успішно!');
      router.push('/admin-panel/news');

    } catch (error) {
      alert('Помилка створення новини: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPreview = () => {
    // TODO: Зберегти як чернетку і показати попередній перегляд
    alert('Функція попереднього перегляду в розробці');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">✍️ Створити новину</h1>
              <p className="text-gray-600 text-sm">Додавання нової новини на сайт ФУСАФ</p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin-panel/news" className="text-gray-500 hover:text-gray-700">
                ← Повернутися до новин
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Основна інформація */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Основна інформація</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок новини *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введіть заголовок новини..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Контент новини *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введіть текст новини..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Підтримується форматування Markdown
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категорія
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус публікації
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Чернетка</option>
                    <option value="published">Опублікувати зараз</option>
                    <option value="scheduled">Запланована публікація</option>
                  </select>
                </div>
              </div>

              {/* Планована публікація */}
              {formData.status === 'scheduled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата публікації
                    </label>
                    <input
                      type="date"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Час публікації
                    </label>
                    <input
                      type="time"
                      name="publishTime"
                      value={formData.publishTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Додаткові налаштування */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Додаткові налаштування</h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">⭐ Рекомендована новина (відображається на головній сторінці)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Теги (через кому)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="чемпіонат, результати, аеробіка"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Теги допомагають користувачам знаходити схожі новини
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зображення
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.image && (
                  <p className="text-sm text-green-600 mt-1">
                    Вибрано: {formData.image.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SEO налаштування */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO оптимізація</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO заголовок
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Заголовок для пошукових систем (до 60 символів)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 символів
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO опис
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Короткий опис для пошукових систем (до 160 символів)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 символів
                </p>
              </div>
            </div>
          </div>

          {/* Кнопки дій */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSaveAndPreview}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                👁️ Зберегти і переглянути
              </button>
            </div>

            <div className="flex space-x-4">
              <a
                href="/admin-panel/news"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Скасувати
              </a>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                  loading || !formData.title || !formData.content
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Створюємо...
                  </>
                ) : (
                  <>
                    ✅ {formData.status === 'published' ? 'Опублікувати' : 'Створити новину'}
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
