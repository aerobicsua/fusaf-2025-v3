"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Mail,
  Send,
  Users,
  FileText,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Settings,
  MessageSquare,
  Target,
  BarChart3
} from 'lucide-react';

interface EmailNotification {
  id: string;
  type: string;
  recipientEmail: string;
  subject: string;
  templateUsed: string;
  status: string;
  sentAt: string;
  errorMessage: string;
  adminEmail: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  today: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  variables: string[];
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'userStatusChange',
    name: 'Зміна статусу користувача',
    subject: 'Зміна статусу вашого акаунту в ФУСАФ',
    description: 'Повідомлення про зміну статусу акаунту користувача',
    variables: ['userName', 'newStatus', 'changeDate', 'reason']
  },
  {
    id: 'newCompetition',
    name: 'Нове змагання',
    subject: 'Нове змагання в ФУСАФ: {{competitionTitle}}',
    description: 'Анонс нового змагання для всіх учасників',
    variables: ['competitionTitle', 'competitionDescription', 'competitionDate', 'competitionLocation', 'registrationDeadline', 'categories']
  },
  {
    id: 'competitionStatusChange',
    name: 'Зміна статусу змагання',
    subject: 'Зміна статусу змагання: {{competitionTitle}}',
    description: 'Повідомлення про зміни в змаганні',
    variables: ['competitionTitle', 'newStatus', 'changeDate', 'statusMessage', 'actionRequired']
  },
  {
    id: 'welcomeNewUser',
    name: 'Привітання нового користувача',
    subject: 'Ласкаво просимо до ФУСАФ!',
    description: 'Привітальне повідомлення для нових користувачів',
    variables: ['userName', 'userEmail', 'temporaryPassword', 'loginUrl']
  },
  {
    id: 'passwordReset',
    name: 'Скидання пароля',
    subject: 'Скидання пароля ФУСАФ',
    description: 'Повідомлення про скидання пароля',
    variables: ['userName', 'newPassword', 'loginUrl']
  }
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('send');

  // Форма відправки
  const [sendForm, setSendForm] = useState({
    type: 'announcement',
    recipients: 'all_users',
    customRecipients: '',
    template: '',
    customSubject: '',
    customMessage: '',
    variables: {} as { [key: string]: string }
  });

  // Фільтри для історії
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    recipient: '',
    page: 1,
    limit: 50
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/notifications?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setStats(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Помилка завантаження сповіщень:', data.error);
      }
    } catch (error) {
      console.error('Помилка завантаження сповіщень:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async (type: string) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'all_users':
          endpoint = '/api/admin/users';
          break;
        case 'athletes':
          endpoint = '/api/athletes';
          break;
        case 'club_owners':
          endpoint = '/api/admin/clubs';
          break;
        default:
          return [];
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (type === 'all_users' && data.success) {
        return data.users.map((user: any) => ({
          email: user.email,
          name: user.name || user.firstName + ' ' + user.lastName
        }));
      } else if (type === 'athletes' && data.athletes) {
        return data.athletes.map((athlete: any) => ({
          email: athlete.email,
          name: athlete.name || athlete.firstName + ' ' + athlete.lastName
        }));
      } else if (type === 'club_owners' && data.success) {
        return data.clubs.filter((club: any) => club.ownerEmail).map((club: any) => ({
          email: club.ownerEmail,
          name: club.ownerName
        }));
      }

      return [];
    } catch (error) {
      console.error('Помилка завантаження отримувачів:', error);
      return [];
    }
  };

  const handleSendNotification = async () => {
    try {
      let recipients = [];

      if (sendForm.recipients === 'custom') {
        recipients = sendForm.customRecipients
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.includes('@'))
          .map(email => ({ email, name: email }));
      } else {
        recipients = await loadRecipients(sendForm.recipients);
      }

      if (recipients.length === 0) {
        alert('Не знайдено отримувачів для відправки');
        return;
      }

      const payload = {
        type: sendForm.type,
        recipients,
        template: sendForm.template || 'custom',
        variables: sendForm.variables,
        customSubject: sendForm.customSubject,
        customMessage: sendForm.customMessage
      };

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Сповіщення відправлено: ${data.statistics.sent} успішно, ${data.statistics.failed} помилок`);
        setSendDialogOpen(false);
        resetSendForm();
        loadNotifications();
      } else {
        alert('Помилка відправки: ' + data.error);
      }
    } catch (error) {
      console.error('Помилка відправки сповіщення:', error);
      alert('Помилка відправки сповіщення');
    }
  };

  const resetSendForm = () => {
    setSendForm({
      type: 'announcement',
      recipients: 'all_users',
      customRecipients: '',
      template: '',
      customSubject: '',
      customMessage: '',
      variables: {}
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSendForm(prev => ({
        ...prev,
        template: templateId,
        customSubject: template.subject,
        variables: template.variables.reduce((acc, variable) => {
          acc[variable] = '';
          return acc;
        }, {} as { [key: string]: string })
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Відправлено</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Помилка</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Очікує</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_status_change': return <Users className="h-4 w-4" />;
      case 'new_competition': return <Target className="h-4 w-4" />;
      case 'competition_status_change': return <Calendar className="h-4 w-4" />;
      case 'welcome': return <MessageSquare className="h-4 w-4" />;
      case 'password_reset': return <Settings className="h-4 w-4" />;
      case 'announcement': return <Zap className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email сповіщення</h1>
          <p className="text-gray-600 mt-1">
            Відправка повідомлень користувачам та перегляд історії розсилок
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setSendDialogOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Відправити повідомлення
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500">Всього відправлено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <p className="text-xs text-gray-500">Успішно</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-gray-500">Помилки</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500">Очікують</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.today}</div>
              <p className="text-xs text-gray-500">Сьогодні</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Таби */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">Відправити</TabsTrigger>
          <TabsTrigger value="history">Історія</TabsTrigger>
          <TabsTrigger value="templates">Шаблони</TabsTrigger>
        </TabsList>

        {/* Швидка відправка */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Швидка відправка повідомлення
              </CardTitle>
              <CardDescription>
                Відправте повідомлення користувачам, використовуючи готові шаблони або власний контент
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Тип та отримувачі */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Тип повідомлення</Label>
                  <Select value={sendForm.type} onValueChange={(value) => setSendForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Оголошення</SelectItem>
                      <SelectItem value="competition_update">Оновлення змагання</SelectItem>
                      <SelectItem value="system_notification">Системне сповіщення</SelectItem>
                      <SelectItem value="newsletter">Новини</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Отримувачі</Label>
                  <Select value={sendForm.recipients} onValueChange={(value) => setSendForm(prev => ({ ...prev, recipients: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">Всі користувачі</SelectItem>
                      <SelectItem value="athletes">Тільки спортсмени</SelectItem>
                      <SelectItem value="club_owners">Власники клубів</SelectItem>
                      <SelectItem value="custom">Вказати вручну</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Кастомні отримувачі */}
              {sendForm.recipients === 'custom' && (
                <div>
                  <Label>Email адреси (по одному на рядок)</Label>
                  <Textarea
                    value={sendForm.customRecipients}
                    onChange={(e) => setSendForm(prev => ({ ...prev, customRecipients: e.target.value }))}
                    rows={5}
                    placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                  />
                </div>
              )}

              {/* Шаблон */}
              <div>
                <Label>Шаблон повідомлення</Label>
                <Select value={sendForm.template} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть шаблон або напишіть власне повідомлення" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Власне повідомлення</SelectItem>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Змінні шаблону */}
              {sendForm.template && Object.keys(sendForm.variables).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Змінні шаблону</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(sendForm.variables).map((variable) => (
                      <div key={variable}>
                        <Label>{variable}</Label>
                        <Input
                          value={sendForm.variables[variable]}
                          onChange={(e) => setSendForm(prev => ({
                            ...prev,
                            variables: { ...prev.variables, [variable]: e.target.value }
                          }))}
                          placeholder={`Введіть значення для ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Тема та контент */}
              <div className="space-y-4">
                <div>
                  <Label>Тема повідомлення</Label>
                  <Input
                    value={sendForm.customSubject}
                    onChange={(e) => setSendForm(prev => ({ ...prev, customSubject: e.target.value }))}
                    placeholder="Введіть тему повідомлення"
                  />
                </div>

                <div>
                  <Label>Текст повідомлення</Label>
                  <Textarea
                    value={sendForm.customMessage}
                    onChange={(e) => setSendForm(prev => ({ ...prev, customMessage: e.target.value }))}
                    rows={8}
                    placeholder="Введіть текст повідомлення або використовуйте шаблон"
                  />
                </div>
              </div>

              {/* Дії */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleSendNotification}
                  disabled={!sendForm.customSubject || !sendForm.customMessage}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Відправити зараз
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(true)}
                  disabled={!sendForm.customSubject || !sendForm.customMessage}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Попередній перегляд
                </Button>
                <Button variant="outline" onClick={resetSendForm}>
                  Очистити
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Історія відправок */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Історія відправок
                </div>
                <Button onClick={loadNotifications} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Оновити
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Фільтри */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>Тип</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі типи" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі типи</SelectItem>
                      <SelectItem value="announcement">Оголошення</SelectItem>
                      <SelectItem value="competition_update">Оновлення змагання</SelectItem>
                      <SelectItem value="system_notification">Системне</SelectItem>
                      <SelectItem value="newsletter">Новини</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Статус</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Всі статуси" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі статуси</SelectItem>
                      <SelectItem value="sent">Відправлено</SelectItem>
                      <SelectItem value="failed">Помилка</SelectItem>
                      <SelectItem value="pending">Очікує</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Отримувач</Label>
                  <Input
                    value={filters.recipient}
                    onChange={(e) => setFilters(prev => ({ ...prev, recipient: e.target.value, page: 1 }))}
                    placeholder="Email отримувача..."
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ type: '', status: '', recipient: '', page: 1, limit: 50 })}
                    className="w-full"
                  >
                    Очистити
                  </Button>
                </div>
              </div>

              {/* Таблиця */}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Отримувач</TableHead>
                        <TableHead>Тема</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Адміністратор</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(notification.createdAt).toLocaleDateString('uk-UA')}
                              <div className="text-gray-500 text-xs">
                                {new Date(notification.createdAt).toLocaleTimeString('uk-UA')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(notification.type)}
                              <span className="text-sm capitalize">{notification.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{notification.recipientEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium truncate max-w-xs">
                              {notification.subject}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(notification.status)}
                            {notification.status === 'failed' && notification.errorMessage && (
                              <div className="text-xs text-red-500 mt-1 truncate max-w-xs">
                                {notification.errorMessage}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{notification.adminEmail}</div>
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
                    Показано {notifications.length} з {stats?.total || 0} сповіщень
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Попередня
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page >= totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Наступна
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шаблони */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Шаблони повідомлень
              </CardTitle>
              <CardDescription>
                Готові шаблони для різних типів повідомлень
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500">Тема</Label>
                          <div className="text-sm">{template.subject}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Змінні</Label>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleTemplateChange(template.id);
                            setActiveTab('send');
                          }}
                          className="w-full"
                        >
                          Використати шаблон
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Діалог попереднього перегляду */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Попередній перегляд повідомлення</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Тема</Label>
              <div className="font-medium">{sendForm.customSubject}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Контент</Label>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="whitespace-pre-wrap text-sm">{sendForm.customMessage}</div>
              </div>
            </div>
            {Object.keys(sendForm.variables).length > 0 && (
              <div>
                <Label className="text-xs text-gray-500">Змінні</Label>
                <div className="text-sm space-y-1">
                  {Object.entries(sendForm.variables).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value || '(не заповнено)'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Закрити
            </Button>
            <Button onClick={() => {
              setPreviewDialogOpen(false);
              handleSendNotification();
            }}>
              Відправити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
