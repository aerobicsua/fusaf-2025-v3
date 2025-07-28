"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Newspaper,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Eye,
  FileText,
  Star,
  Pin,
  Globe,
  Clock,
  BarChart3,
  Heart,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  CheckCircle,
  XCircle,
  Archive,
  Send
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery: string[];
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  status: string;
  publishDate: string;
  scheduledDate: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewsStats {
  total: number;
  draft: number;
  published: number;
  archived: number;
  scheduled: number;
  featured: number;
  total_views: number;
  avg_views: number;
  byCategory: { [key: string]: number };
  byAuthor: { [key: string]: number };
}

const newsCategories = [
  { value: 'general', label: 'Загальні новини' },
  { value: 'competitions', label: 'Змагання' },
  { value: 'athletes', label: 'Спортсмени' },
  { value: 'clubs', label: 'Клуби' },
  { value: 'training', label: 'Тренування' },
  { value: 'announcements', label: 'Оголошення' },
  { value: 'interviews', label: 'Інтерв\'ю' },
  { value: 'events', label: 'Події' },
  { value: 'rules', label: 'Правила' },
  { value: 'federation', label: 'Федерація' }
];

const newsStatuses = [
  { value: 'draft', label: 'Чернетка', color: 'gray', icon: FileText },
  { value: 'published', label: 'Опубліковано', color: 'green', icon: CheckCircle },
  { value: 'scheduled', label: 'Заплановано', color: 'blue', icon: Clock },
  { value: 'archived', label: 'Архів', color: 'orange', icon: Archive }
];

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    author: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNews();
  }, [filters]);

  const loadNews = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/news?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setNews(data.news);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження новин:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження новин:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page
    }));
  };

  const handleCreateNews = () => {
    setSelectedNews(null);
    setCreateDialogOpen(true);
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setEditDialogOpen(true);
  };

  const handleViewNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setViewDialogOpen(true);
  };

  const handleDeleteNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = async (newsItem: NewsItem, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsId: newsItem.id,
          updates: { status: newStatus }
        })
      });

      if (response.ok) {
        loadNews();

        // Логуємо дію адміністратора
        await logAdminAction(
          'UPDATE_NEWS_STATUS',
          'news',
          newsItem.id,
          { oldStatus: newsItem.status, newStatus, title: newsItem.title }
        );
      }
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  };

  const handleToggleFeatured = async (newsItem: NewsItem) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsId: newsItem.id,
          updates: { is_featured: !newsItem.isFeatured }
        })
      });

      if (response.ok) {
        loadNews();
        await logAdminAction(
          newsItem.isFeatured ? 'UNFEATURE_NEWS' : 'FEATURE_NEWS',
          'news',
          newsItem.id,
          { title: newsItem.title }
        );
      }
    } catch (error) {
      console.error('Помилка зміни статусу рекомендованої новини:', error);
    }
  };

  const handleTogglePinned = async (newsItem: NewsItem) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsId: newsItem.id,
          updates: { is_pinned: !newsItem.isPinned }
        })
      });

      if (response.ok) {
        loadNews();
        await logAdminAction(
          newsItem.isPinned ? 'UNPIN_NEWS' : 'PIN_NEWS',
          'news',
          newsItem.id,
          { title: newsItem.title }
        );
      }
    } catch (error) {
      console.error('Помилка закріплення новини:', error);
    }
  };

  const handleSaveNews = async (newsData: Partial<NewsItem>, isCreate: boolean = false) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreate ? newsData : {
          newsId: selectedNews?.id,
          updates: newsData
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setSelectedNews(null);
        loadNews();

        // Логуємо дію адміністратора
        await logAdminAction(
          isCreate ? 'CREATE_NEWS' : 'UPDATE_NEWS',
          'news',
          isCreate ? 'new' : selectedNews?.id || '',
          newsData
        );
      }
    } catch (error) {
      console.error('Помилка збереження новини:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNews) return;

    try {
      const response = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId: selectedNews.id })
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedNews(null);
        loadNews();

        // Логуємо дію адміністратора
        await logAdminAction(
          'DELETE_NEWS',
          'news',
          selectedNews.id,
          { title: selectedNews.title }
        );
      }
    } catch (error) {
      console.error('Помилка видалення новини:', error);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: 'current_admin_id',
          adminEmail: 'admin@fusaf.org.ua',
          action,
          targetType,
          targetId,
          details
        })
      });
    } catch (error) {
      console.error('Помилка логування:', error);
    }
  };

  const handleExport = () => {
    window.open('/api/admin/export?type=news&format=csv', '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = newsStatuses.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

    const colorClasses = {
      gray: 'bg-gray-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500'
    };

    const IconComponent = statusConfig.icon;

    return <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
      <IconComponent className="h-3 w-3 mr-1" />
      {statusConfig.label}
    </Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryConfig = newsCategories.find(c => c.value === category);
    return categoryConfig ? categoryConfig.label : category;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління новинами</h1>
          <p className="text-gray-600 mt-1">
            Створення, редагування та публікація новин ФУСАФ
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
          <Button onClick={handleCreateNews}>
            <Plus className="h-4 w-4 mr-2" />
            Створити новину
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього новин</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-gray-500">Опубліковано</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <p className="text-xs text-gray-500">Чернетки</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <p className="text-xs text-gray-500">Заплановано</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.archived}</div>
              <p className="text-xs text-gray-500">В архіві</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
              <p className="text-xs text-gray-500">Рекомендовані</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.total_views || 0}</div>
              <p className="text-xs text-gray-500">Всього переглядів</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(stats.avg_views || 0)}</div>
              <p className="text-xs text-gray-500">Середньо на новину</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фільтри */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фільтри та пошук
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Пошук</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Заголовок, контент..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Статус</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі статуси</SelectItem>
                  {newsStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Категорія</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі категорії" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі категорії</SelectItem>
                  {newsCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Автор</Label>
              <Input
                placeholder="Ім'я автора..."
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
              />
            </div>

            <div>
              <Label>Дата від</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  category: '',
                  author: '',
                  date_from: '',
                  date_to: '',
                  page: 1,
                  limit: 50
                })}
                className="w-full"
              >
                Очистити
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця новин */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Newspaper className="h-5 w-5 mr-2" />
              Новини ({news.length})
            </div>
            <div className="text-sm text-gray-500">
              Сторінка {filters.page} з {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Новина</TableHead>
                    <TableHead>Категорія/Теги</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Статистика</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((newsItem) => (
                    <TableRow key={newsItem.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          {newsItem.featuredImage && (
                            <img
                              src={newsItem.featuredImage}
                              alt={newsItem.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium">{newsItem.title}</div>
                              {newsItem.isPinned && (
                                <Pin className="h-4 w-4 text-blue-500" />
                              )}
                              {newsItem.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            {newsItem.excerpt && (
                              <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                {newsItem.excerpt}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Створено: {new Date(newsItem.createdAt).toLocaleDateString('uk-UA')}
                              {newsItem.publishDate && (
                                <span className="ml-2">
                                  Опубліковано: {new Date(newsItem.publishDate).toLocaleDateString('uk-UA')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(newsItem.category)}
                          </Badge>
                          {newsItem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {newsItem.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {newsItem.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{newsItem.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {newsItem.authorName && (
                            <div className="font-medium flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {newsItem.authorName}
                            </div>
                          )}
                          {newsItem.authorEmail && (
                            <div className="text-gray-500 text-xs">{newsItem.authorEmail}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center">
                            <BarChart3 className="h-3 w-3 mr-1 text-gray-400" />
                            {newsItem.viewsCount} переглядів
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-red-400" />
                            {newsItem.likesCount} вподобань
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1 text-blue-400" />
                            {newsItem.commentsCount} коментарів
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(newsItem.status)}

                          {/* Швидкі дії зміни статусу */}
                          <div className="flex flex-wrap gap-1">
                            {newsItem.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(newsItem, 'published')}
                                className="text-xs px-2 py-1 h-6 text-green-600"
                              >
                                Опублікувати
                              </Button>
                            )}
                            {newsItem.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(newsItem, 'archived')}
                                className="text-xs px-2 py-1 h-6 text-orange-600"
                              >
                                В архів
                              </Button>
                            )}
                            {newsItem.status === 'archived' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(newsItem, 'published')}
                                className="text-xs px-2 py-1 h-6 text-green-600"
                              >
                                Відновити
                              </Button>
                            )}
                          </div>

                          {/* Швидкі дії для спеціальних станів */}
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleFeatured(newsItem)}
                              className={`text-xs px-2 py-1 h-6 ${
                                newsItem.isFeatured ? 'text-yellow-600' : 'text-gray-400'
                              }`}
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTogglePinned(newsItem)}
                              className={`text-xs px-2 py-1 h-6 ${
                                newsItem.isPinned ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            >
                              <Pin className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewNews(newsItem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditNews(newsItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNews(newsItem)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Показано {news.length} з {stats?.total || 0} новин
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => handleFilterChange('page', (filters.page - 1).toString())}
                >
                  Попередня
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => handleFilterChange('page', (filters.page + 1).toString())}
                >
                  Наступна
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Діалоги */}
      <NewsFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        newsItem={null}
        onSave={(data) => handleSaveNews(data, true)}
        title="Створити нову новину"
      />

      <NewsFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        newsItem={selectedNews}
        onSave={(data) => handleSaveNews(data, false)}
        title="Редагувати новину"
      />

      <NewsViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        newsItem={selectedNews}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити новину <strong>{selectedNews?.title}</strong>?
              Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент форми новини
function NewsFormDialog({
  open,
  onOpenChange,
  newsItem,
  onSave,
  title
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsItem: NewsItem | null;
  onSave: (data: Partial<NewsItem>) => void;
  title: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    tags: [] as string[],
    featuredImage: '',
    status: 'draft',
    authorName: '',
    authorEmail: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isFeatured: false,
    isPinned: false,
    scheduledDate: ''
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        excerpt: newsItem.excerpt || '',
        content: newsItem.content || '',
        category: newsItem.category || 'general',
        tags: newsItem.tags || [],
        featuredImage: newsItem.featuredImage || '',
        status: newsItem.status || 'draft',
        authorName: newsItem.authorName || '',
        authorEmail: newsItem.authorEmail || '',
        metaTitle: newsItem.metaTitle || '',
        metaDescription: newsItem.metaDescription || '',
        metaKeywords: newsItem.metaKeywords || '',
        isFeatured: newsItem.isFeatured || false,
        isPinned: newsItem.isPinned || false,
        scheduledDate: newsItem.scheduledDate || ''
      });
    } else {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'general',
        tags: [],
        featuredImage: '',
        status: 'draft',
        authorName: 'Адміністратор ФУСАФ',
        authorEmail: 'admin@fusaf.org.ua',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        isFeatured: false,
        isPinned: false,
        scheduledDate: ''
      });
    }
  }, [newsItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Автозаповнення SEO полів
    const finalData = {
      ...formData,
      metaTitle: formData.metaTitle || formData.title,
      metaDescription: formData.metaDescription || formData.excerpt
    };

    onSave(finalData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основна інформація */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основна інформація</h3>

            <div>
              <Label>Заголовок *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label>Короткий опис</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="Короткий опис новини для превью..."
              />
            </div>

            <div>
              <Label>Контент *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                placeholder="Повний текст новини..."
                required
              />
            </div>

            <div>
              <Label>Головне зображення</Label>
              <Input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Категорія та теги */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Категорія та теги</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Категорія</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newsCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newsStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Теги</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Додати тег..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Додати</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Автор */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Автор</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ім'я автора</Label>
                <Input
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email автора</Label>
                <Input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO налаштування</h3>

            <div>
              <Label>Meta заголовок</Label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Буде використано заголовок новини"
              />
            </div>

            <div>
              <Label>Meta опис</Label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                placeholder="Буде використано короткий опис"
              />
            </div>

            <div>
              <Label>Ключові слова</Label>
              <Input
                value={formData.metaKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                placeholder="спортивна аеробіка, змагання, ФУСАФ"
              />
            </div>
          </div>

          {/* Додаткові налаштування */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Додаткові налаштування</h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                />
                <span className="text-sm">Рекомендована новина</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                />
                <span className="text-sm">Закріпити вгорі</span>
              </label>
            </div>

            {formData.status === 'scheduled' && (
              <div>
                <Label>Дата публікації</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button type="submit">
              Зберегти
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Компонент перегляду новини
function NewsViewDialog({
  open,
  onOpenChange,
  newsItem
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsItem: NewsItem | null;
}) {
  if (!newsItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Перегляд новини</DialogTitle>
          <DialogDescription>
            {newsItem.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Заголовок з мітками */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {newsItem.isPinned && <Pin className="h-5 w-5 text-blue-500" />}
              {newsItem.isFeatured && <Star className="h-5 w-5 text-yellow-500" />}
              <h1 className="text-2xl font-bold">{newsItem.title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {getStatusBadge(newsItem.status)}
              <Badge variant="outline">{getCategoryLabel(newsItem.category)}</Badge>
              <div className="flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-1" />
                {newsItem.authorName}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(newsItem.createdAt).toLocaleDateString('uk-UA')}
              </div>
            </div>
          </div>

          {/* Головне зображення */}
          {newsItem.featuredImage && (
            <div>
              <img
                src={newsItem.featuredImage}
                alt={newsItem.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Короткий опис */}
          {newsItem.excerpt && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Короткий опис</h3>
              <p className="text-gray-700">{newsItem.excerpt}</p>
            </div>
          )}

          {/* Контент */}
          <div>
            <h3 className="font-medium mb-4">Контент</h3>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{newsItem.content}</div>
            </div>
          </div>

          {/* Теги */}
          {newsItem.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {newsItem.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-lg font-semibold">{newsItem.viewsCount}</div>
                    <div className="text-xs text-gray-500">Переглядів</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-400" />
                  <div>
                    <div className="text-lg font-semibold">{newsItem.likesCount}</div>
                    <div className="text-xs text-gray-500">Вподобань</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                  <div>
                    <div className="text-lg font-semibold">{newsItem.commentsCount}</div>
                    <div className="text-xs text-gray-500">Коментарів</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO інформація */}
          {(newsItem.metaTitle || newsItem.metaDescription || newsItem.metaKeywords) && (
            <div>
              <h3 className="font-medium mb-4">SEO інформація</h3>
              <div className="space-y-2">
                {newsItem.metaTitle && (
                  <div>
                    <Label className="text-xs text-gray-500">Meta заголовок</Label>
                    <div className="text-sm">{newsItem.metaTitle}</div>
                  </div>
                )}
                {newsItem.metaDescription && (
                  <div>
                    <Label className="text-xs text-gray-500">Meta опис</Label>
                    <div className="text-sm">{newsItem.metaDescription}</div>
                  </div>
                )}
                {newsItem.metaKeywords && (
                  <div>
                    <Label className="text-xs text-gray-500">Ключові слова</Label>
                    <div className="text-sm">{newsItem.metaKeywords}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusBadge(status: string) {
  const statusConfig = newsStatuses.find(s => s.value === status);
  if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

  const colorClasses = {
    gray: 'bg-gray-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500'
  };

  const IconComponent = statusConfig.icon;

  return <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
    <IconComponent className="h-3 w-3 mr-1" />
    {statusConfig.label}
  </Badge>;
}

function getCategoryLabel(category: string) {
  const categoryConfig = newsCategories.find(c => c.value === category);
  return categoryConfig ? categoryConfig.label : category;
}
