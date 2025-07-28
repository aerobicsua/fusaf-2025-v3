"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Eye,
  MessageCircle,
  Star,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  FileText,
  Users,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      // Завантажуємо новини з localStorage
      const savedNews = JSON.parse(localStorage.getItem('approvedNews') || '[]');
      const publishedNews = savedNews.filter((n: any) => n.status === 'published');

      setNews(publishedNews);
      setFilteredNews(publishedNews);
    } catch (error) {
      console.error('Помилка завантаження новин:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Фільтрація новин
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    setFilteredNews(filtered);
  }, [news, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📰 Новини ФУСАФ</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Останні новини та оновлення Федерації України зі Спортивної Аеробіки і Фітнесу
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="bg-blue-100 p-3 rounded-xl inline-block mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : news.length}
                </div>
                <div className="text-sm text-gray-600">Всього новин</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="bg-green-100 p-3 rounded-xl inline-block mb-3">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : news.reduce((total, n) => total + (n.views || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Всього переглядів</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="bg-purple-100 p-3 rounded-xl inline-block mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : news.reduce((total, n) => total + (n.likes || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Лайків</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="bg-orange-100 p-3 rounded-xl inline-block mb-3">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : news.filter(n => n.featured).length}
                </div>
                <div className="text-sm text-gray-600">Важливих новин</div>
              </CardContent>
            </Card>
          </div>

          {/* Фільтри та пошук */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Пошук новин..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Всі категорії</option>
              <option value="Змагання">Змагання</option>
              <option value="Правила">Правила</option>
              <option value="Навчання">Навчання</option>
              <option value="Анонси">Анонси</option>
              <option value="Досягнення">Досягнення</option>
              <option value="Курси">Курси</option>
              <option value="Клуби">Клуби</option>
            </select>
          </div>

          {/* Контент новин */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження новин...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {news.length === 0 ? 'Новин поки що немає' : 'Нічого не знайдено'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {news.length === 0
                  ? 'Наразі немає опублікованих новин. Слідкуйте за оновленнями!'
                  : 'Спробуйте змінити критерії пошуку або категорію'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/competitions">
                  <Button>
                    <Trophy className="mr-2 h-4 w-4" />
                    Переглянути змагання
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    На головну
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredNews.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {article.category}
                          </Badge>
                          {article.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="mr-1 h-3 w-3" />
                              Рекомендовано
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl leading-tight">
                          {article.title}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('uk-UA')}
                          </div>
                          <div className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            {article.views || 0} переглядів
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {article.author}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4 line-clamp-3">
                      {article.content.length > 200
                        ? `${article.content.substring(0, 200)}...`
                        : article.content
                      }
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex gap-1">
                            {article.tags.slice(0, 3).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link href={`/news/${article.id}`}>
                        <Button>
                          Читати далі
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
