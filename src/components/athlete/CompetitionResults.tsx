"use client";

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Trophy,
  Medal,
  Star,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  Filter,
  BarChart3
} from 'lucide-react';
import type { CompetitionResult, Athlete } from '@/lib/athletes-storage';

interface CompetitionResultsProps {
  athlete: Athlete;
  canEdit?: boolean;
  onResultUpdate?: () => void;
}

interface ResultForm {
  competitionName: string;
  competitionType: string;
  date: string;
  location: string;
  venue: string;
  category: string;
  discipline: string;
  rank: string;
  totalScore: string;
  technicScore: string;
  artisticScore: string;
  executionScore: string;
  difficultyScore: string;
  participantsCount: string;
  notes: string;
  videoUrl: string;
  judgesCount: string;
  deductions: string;
}

const initialForm: ResultForm = {
  competitionName: '',
  competitionType: 'Other',
  date: '',
  location: '',
  venue: '',
  category: '',
  discipline: 'Спортивна аеробіка',
  rank: '',
  totalScore: '',
  technicScore: '',
  artisticScore: '',
  executionScore: '',
  difficultyScore: '',
  participantsCount: '',
  notes: '',
  videoUrl: '',
  judgesCount: '',
  deductions: ''
};

export function CompetitionResults({ athlete, canEdit = false, onResultUpdate }: CompetitionResultsProps) {
  const { user } = useSimpleAuth();
  const [results, setResults] = useState<CompetitionResult[]>(athlete.results || []);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResult, setEditingResult] = useState<CompetitionResult | null>(null);
  const [formData, setFormData] = useState<ResultForm>(initialForm);

  // Фільтри
  const [filters, setFilters] = useState({
    year: '',
    discipline: '',
    competitionType: '',
    showStats: false
  });

  useEffect(() => {
    loadResults();
  }, [athlete.id, filters]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.discipline) params.append('discipline', filters.discipline);
      if (filters.competitionType) params.append('competitionType', filters.competitionType);
      if (filters.showStats) params.append('includeStats', 'true');

      const response = await fetch(`/api/athletes/${athlete.id}/results?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Помилка завантаження результатів:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.competitionName || !formData.date || !formData.location) {
      alert('Заповніть обов\'язкові поля: назва змагання, дата, місце');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        rank: formData.rank ? Number.parseInt(formData.rank) : undefined,
        totalScore: formData.totalScore ? Number.parseFloat(formData.totalScore) : undefined,
        technicScore: formData.technicScore ? Number.parseFloat(formData.technicScore) : undefined,
        artisticScore: formData.artisticScore ? Number.parseFloat(formData.artisticScore) : undefined,
        executionScore: formData.executionScore ? Number.parseFloat(formData.executionScore) : undefined,
        difficultyScore: formData.difficultyScore ? Number.parseFloat(formData.difficultyScore) : undefined,
        participantsCount: formData.participantsCount ? Number.parseInt(formData.participantsCount) : undefined,
        judgesCount: formData.judgesCount ? Number.parseInt(formData.judgesCount) : undefined,
        deductions: formData.deductions ? Number.parseFloat(formData.deductions) : undefined
      };

      const url = editingResult
        ? `/api/athletes/${athlete.id}/results/${editingResult.id}`
        : `/api/athletes/${athlete.id}/results`;

      const method = editingResult ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData(initialForm);
        setShowAddDialog(false);
        setEditingResult(null);
        await loadResults();
        onResultUpdate?.();
      } else {
        const error = await response.json();
        alert(`Помилка: ${error.error}`);
      }
    } catch (error) {
      console.error('Помилка збереження результату:', error);
      alert('Помилка збереження результату');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result: CompetitionResult) => {
    setEditingResult(result);
    setFormData({
      competitionName: result.competitionName,
      competitionType: result.competitionType,
      date: result.date,
      location: result.location,
      venue: result.venue || '',
      category: result.category,
      discipline: result.discipline,
      rank: result.rank?.toString() || '',
      totalScore: result.totalScore?.toString() || '',
      technicScore: result.technicScore?.toString() || '',
      artisticScore: result.artisticScore?.toString() || '',
      executionScore: result.executionScore?.toString() || '',
      difficultyScore: result.difficultyScore?.toString() || '',
      participantsCount: result.participantsCount?.toString() || '',
      notes: result.notes || '',
      videoUrl: result.videoUrl || '',
      judgesCount: result.judgesCount?.toString() || '',
      deductions: result.deductions?.toString() || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (resultId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/athletes/${athlete.id}/results/${resultId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadResults();
        onResultUpdate?.();
      } else {
        const error = await response.json();
        alert(`Помилка: ${error.error}`);
      }
    } catch (error) {
      console.error('Помилка видалення результату:', error);
      alert('Помилка видалення результату');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingResult(null);
  };

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;

    let className = 'font-bold';
    let icon = null;

    if (rank === 1) {
      className += ' bg-yellow-500 text-white';
      icon = <Trophy className="h-3 w-3" />;
    } else if (rank === 2) {
      className += ' bg-gray-400 text-white';
      icon = <Medal className="h-3 w-3" />;
    } else if (rank === 3) {
      className += ' bg-orange-500 text-white';
      icon = <Award className="h-3 w-3" />;
    } else {
      className += ' bg-blue-500 text-white';
    }

    return (
      <Badge className={className}>
        {icon && <span className="mr-1">{icon}</span>}
        {rank} місце
      </Badge>
    );
  };

  const getPersonalBestBadge = (isPersonalBest?: boolean) => {
    if (!isPersonalBest) return null;
    return (
      <Badge className="bg-green-500 text-white">
        <Star className="h-3 w-3 mr-1" />
        PB
      </Badge>
    );
  };

  // Розрахунок простої статистики
  const stats = {
    total: results.length,
    wins: results.filter(r => r.rank === 1).length,
    podiums: results.filter(r => r.rank && r.rank <= 3).length,
    averageScore: results.filter(r => r.totalScore).length > 0
      ? results.filter(r => r.totalScore).reduce((sum, r) => sum + (r.totalScore || 0), 0) / results.filter(r => r.totalScore).length
      : 0,
    bestScore: results.filter(r => r.totalScore).length > 0
      ? Math.max(...results.filter(r => r.totalScore).map(r => r.totalScore!))
      : 0
  };

  const uniqueYears = [...new Set(results.map(r => new Date(r.date).getFullYear()))].sort((a, b) => b - a);
  const uniqueDisciplines = [...new Set(results.map(r => r.discipline))];
  const uniqueCompetitionTypes = [...new Set(results.map(r => r.competitionType))];

  return (
    <div className="space-y-6">
      {/* Заголовок та статистика */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Результати змагань</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Змагань</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.wins}</div>
              <div className="text-sm text-gray-600">Перемог</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.podiums}</div>
              <div className="text-sm text-gray-600">Подіумів</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.bestScore > 0 ? stats.bestScore.toFixed(1) : '-'}
              </div>
              <div className="text-sm text-gray-600">Кращий бал</div>
            </div>
          </div>
        </div>

        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Додати результат
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingResult ? 'Редагувати результат' : 'Додати новий результат'}
                </DialogTitle>
                <DialogDescription>
                  Заповніть інформацію про змагання та результат спортсмена
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Основна інформація */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="competitionName">Назва змагання *</Label>
                    <Input
                      id="competitionName"
                      value={formData.competitionName}
                      onChange={(e) => setFormData({ ...formData, competitionName: e.target.value })}
                      placeholder="Чемпіонат України з аеробіки 2024"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitionType">Тип змагання</Label>
                    <Select value={formData.competitionType} onValueChange={(value) => setFormData({ ...formData, competitionType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="World Championships">Чемпіонат світу</SelectItem>
                        <SelectItem value="Continental Championships">Континентальний чемпіонат</SelectItem>
                        <SelectItem value="National Championships">Національний чемпіонат</SelectItem>
                        <SelectItem value="Regional Championships">Регіональний чемпіонат</SelectItem>
                        <SelectItem value="Club Championships">Клубні/підрозділні змагання</SelectItem>
                        <SelectItem value="Other">Інші</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Дата *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Місто *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Київ, Україна"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue">Зал/Арена</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="Палац спорту"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discipline">Дисципліна</Label>
                    <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Спортивна аеробіка">Спортивна аеробіка</SelectItem>
                        <SelectItem value="Фітнес аеробіка">Фітнес аеробіка</SelectItem>
                        <SelectItem value="Степ аеробіка">Степ аеробіка</SelectItem>
                        <SelectItem value="Хіп-хоп аеробіка">Хіп-хоп аеробіка</SelectItem>
                        <SelectItem value="Танцювальна аеробіка">Танцювальна аеробіка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Категорія</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Жінки Individual Junior"
                    />
                  </div>

                  <div>
                    <Label htmlFor="participantsCount">Кількість учасників</Label>
                    <Input
                      id="participantsCount"
                      type="number"
                      value={formData.participantsCount}
                      onChange={(e) => setFormData({ ...formData, participantsCount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Результати */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Результати</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rank">Місце</Label>
                      <Input
                        id="rank"
                        type="number"
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalScore">Загальний бал</Label>
                      <Input
                        id="totalScore"
                        type="number"
                        step="0.1"
                        value={formData.totalScore}
                        onChange={(e) => setFormData({ ...formData, totalScore: e.target.value })}
                        placeholder="85.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="technicScore">Технічна оцінка</Label>
                      <Input
                        id="technicScore"
                        type="number"
                        step="0.1"
                        value={formData.technicScore}
                        onChange={(e) => setFormData({ ...formData, technicScore: e.target.value })}
                        placeholder="42.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="artisticScore">Артистична оцінка</Label>
                      <Input
                        id="artisticScore"
                        type="number"
                        step="0.1"
                        value={formData.artisticScore}
                        onChange={(e) => setFormData({ ...formData, artisticScore: e.target.value })}
                        placeholder="43.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="executionScore">Виконання</Label>
                      <Input
                        id="executionScore"
                        type="number"
                        step="0.1"
                        value={formData.executionScore}
                        onChange={(e) => setFormData({ ...formData, executionScore: e.target.value })}
                        placeholder="40.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="difficultyScore">Складність</Label>
                      <Input
                        id="difficultyScore"
                        type="number"
                        step="0.1"
                        value={formData.difficultyScore}
                        onChange={(e) => setFormData({ ...formData, difficultyScore: e.target.value })}
                        placeholder="45.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Додаткова інформація */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Додаткова інформація</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="notes">Примітки</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Додаткова інформація про виступ"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="videoUrl">Посилання на відео</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="judgesCount">Кількість суддів</Label>
                        <Input
                          id="judgesCount"
                          type="number"
                          value={formData.judgesCount}
                          onChange={(e) => setFormData({ ...formData, judgesCount: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="deductions">Зниження балів</Label>
                        <Input
                          id="deductions"
                          type="number"
                          step="0.1"
                          value={formData.deductions}
                          onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Скасувати
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Збереження...' : (editingResult ? 'Оновити' : 'Додати')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Фільтри */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Filter className="h-4 w-4 mr-2" />
            Фільтри
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterYear">Рік</Label>
              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі роки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі роки</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterDiscipline">Дисципліна</Label>
              <Select value={filters.discipline} onValueChange={(value) => setFilters({ ...filters, discipline: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі дисципліни" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі дисципліни</SelectItem>
                  {uniqueDisciplines.map(discipline => (
                    <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterType">Тип змагання</Label>
              <Select value={filters.competitionType} onValueChange={(value) => setFilters({ ...filters, competitionType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Всі типи" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі типи</SelectItem>
                  {uniqueCompetitionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ year: '', discipline: '', competitionType: '', showStats: false })}
                className="w-full"
              >
                Очистити фільтри
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблиця результатів */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Немає результатів змагань
            </h3>
            <p className="text-gray-600 mb-4">
              {canEdit ? 'Додайте результати змагань спортсмена' : 'Результати змагань ще не додані'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Результати змагань ({results.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, showStats: !filters.showStats })}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {filters.showStats ? 'Приховати' : 'Показати'} статистику
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Змагання</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Місце</TableHead>
                    <TableHead>Дисципліна</TableHead>
                    <TableHead>Бал</TableHead>
                    <TableHead>Тип</TableHead>
                    {canEdit && <TableHead>Дії</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.competitionName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {result.location}
                            {result.venue && ` • ${result.venue}`}
                          </div>
                          <div className="text-sm text-gray-500">{result.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(result.date).toLocaleDateString('uk-UA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRankBadge(result.rank)}
                          {getPersonalBestBadge(result.isPersonalBest)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.discipline}</Badge>
                      </TableCell>
                      <TableCell>
                        {result.totalScore ? (
                          <div>
                            <div className="font-medium">{result.totalScore.toFixed(1)}</div>
                            {(result.technicScore || result.artisticScore) && (
                              <div className="text-xs text-gray-500">
                                {result.technicScore && `T: ${result.technicScore}`}
                                {result.technicScore && result.artisticScore && ' • '}
                                {result.artisticScore && `A: ${result.artisticScore}`}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {result.competitionType}
                        </Badge>
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(result)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Видалити результат?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Результат "{result.competitionName}" буде видалено. Дію неможливо скасувати.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(result.id)}>
                                    Видалити
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
