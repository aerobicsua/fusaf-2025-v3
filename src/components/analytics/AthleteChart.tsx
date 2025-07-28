"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Medal,
  Target,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import type { Athlete, AthleteStats } from '@/lib/athletes-storage';

interface AthleteChartProps {
  athlete: Athlete;
  showDetailedStats?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export function AthleteChart({ athlete, showDetailedStats = true }: AthleteChartProps) {
  const [chartType, setChartType] = useState<'progress' | 'medals' | 'competitions' | 'scores'>('progress');
  const [timeRange, setTimeRange] = useState<'year' | 'all' | 'last3years'>('year');
  const [stats, setStats] = useState<AthleteStats | null>(athlete.stats || null);

  useEffect(() => {
    if (athlete.stats) {
      setStats(athlete.stats);
    }
  }, [athlete]);

  // Фільтрація результатів за часовим діапазоном
  const getFilteredResults = () => {
    const currentYear = new Date().getFullYear();
    let results = athlete.results || [];

    if (timeRange === 'year') {
      results = results.filter(r => new Date(r.date).getFullYear() === currentYear);
    } else if (timeRange === 'last3years') {
      results = results.filter(r => new Date(r.date).getFullYear() >= currentYear - 2);
    }

    return results;
  };

  // Підготовка даних для графіків
  const getChartData = (): ChartData => {
    const results = getFilteredResults();

    switch (chartType) {
      case 'progress': {
        // Графік прогресу балів по часу
        const sortedResults = results
          .filter(r => r.totalScore)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-10); // Останні 10 результатів

        return {
          labels: sortedResults.map(r => {
            const date = new Date(r.date);
            return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
          }),
          datasets: [{
            label: 'Загальний бал',
            data: sortedResults.map(r => r.totalScore || 0),
            backgroundColor: ['rgba(59, 130, 246, 0.1)'],
            borderColor: ['rgb(59, 130, 246)'],
            borderWidth: 2
          }]
        };
      }

      case 'medals': {
        // Розподіл медалей
        const gold = results.filter(r => r.rank === 1).length;
        const silver = results.filter(r => r.rank === 2).length;
        const bronze = results.filter(r => r.rank === 3).length;
        const other = results.filter(r => r.rank && r.rank > 3).length;

        return {
          labels: ['Золото', 'Срібло', 'Бронза', 'Інші місця'],
          datasets: [{
            label: 'Кількість',
            data: [gold, silver, bronze, other],
            backgroundColor: [
              'rgba(251, 191, 36, 0.8)',  // Золото
              'rgba(156, 163, 175, 0.8)', // Срібло
              'rgba(245, 158, 11, 0.8)',  // Бронза
              'rgba(107, 114, 128, 0.8)'  // Інші
            ],
            borderColor: [
              'rgb(251, 191, 36)',
              'rgb(156, 163, 175)',
              'rgb(245, 158, 11)',
              'rgb(107, 114, 128)'
            ],
            borderWidth: 1
          }]
        };
      }

      case 'competitions': {
        // Змагання по рокам
        const competitionsByYear = results.reduce((acc, r) => {
          const year = new Date(r.date).getFullYear().toString();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const years = Object.keys(competitionsByYear).sort();

        return {
          labels: years,
          datasets: [{
            label: 'Кількість змагань',
            data: years.map(year => competitionsByYear[year]),
            backgroundColor: ['rgba(34, 197, 94, 0.6)'],
            borderColor: ['rgb(34, 197, 94)'],
            borderWidth: 1
          }]
        };
      }

      case 'scores': {
        // Розподіл балів по типах оцінок
        const resultsWithScores = results.filter(r => r.totalScore && r.technicScore && r.artisticScore);

        if (resultsWithScores.length === 0) {
          return {
            labels: ['Немає даних'],
            datasets: [{
              label: 'Бали',
              data: [0],
              backgroundColor: ['rgba(156, 163, 175, 0.6)'],
              borderColor: ['rgb(156, 163, 175)'],
              borderWidth: 1
            }]
          };
        }

        const avgTechnic = resultsWithScores.reduce((sum, r) => sum + (r.technicScore || 0), 0) / resultsWithScores.length;
        const avgArtistic = resultsWithScores.reduce((sum, r) => sum + (r.artisticScore || 0), 0) / resultsWithScores.length;
        const avgExecution = resultsWithScores.reduce((sum, r) => sum + (r.executionScore || 0), 0) / resultsWithScores.length;

        return {
          labels: ['Технічна', 'Артистична', 'Виконання'],
          datasets: [{
            label: 'Середній бал',
            data: [avgTechnic, avgArtistic, avgExecution].map(score => Math.round(score * 10) / 10),
            backgroundColor: [
              'rgba(168, 85, 247, 0.6)',   // Фіолетовий
              'rgba(236, 72, 153, 0.6)',   // Рожевий
              'rgba(34, 197, 94, 0.6)'     // Зелений
            ],
            borderColor: [
              'rgb(168, 85, 247)',
              'rgb(236, 72, 153)',
              'rgb(34, 197, 94)'
            ],
            borderWidth: 1
          }]
        };
      }

      default:
        return {
          labels: [],
          datasets: []
        };
    }
  };

  const chartData = getChartData();

  // Простий компонент для відображення даних (оскільки ми не використовуємо Chart.js через обмеження)
  const SimpleChart = ({ data }: { data: ChartData }) => {
    if (chartType === 'progress') {
      const maxValue = Math.max(...data.datasets[0].data);

      return (
        <div className="space-y-2">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-600">{label}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'medals' || chartType === 'scores') {
      const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);

      return (
        <div className="grid grid-cols-2 gap-3">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            const color = data.datasets[0].backgroundColor[index];

            return (
              <div key={index} className="text-center p-3 rounded-lg border">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {value}
                </div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'competitions') {
      const maxValue = Math.max(...data.datasets[0].data);

      return (
        <div className="space-y-3">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div key={index} className="flex items-end space-x-2">
                <div className="w-12 text-sm font-medium">{label}</div>
                <div className="flex-1 flex items-end">
                  <div
                    className="bg-green-500 rounded-t flex items-end justify-center text-white text-xs font-medium"
                    style={{
                      height: `${Math.max(height, 20)}px`,
                      width: '40px'
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return <div className="text-center text-gray-500">Немає даних для відображення</div>;
  };

  return (
    <div className="space-y-6">
      {/* Контроли */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Аналітика результатів</span>
        </div>

        <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Тип графіка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="progress">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Прогрес балів</span>
              </div>
            </SelectItem>
            <SelectItem value="medals">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Розподіл медалей</span>
              </div>
            </SelectItem>
            <SelectItem value="competitions">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Змагання по рокам</span>
              </div>
            </SelectItem>
            <SelectItem value="scores">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Середні оцінки</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Період" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">Цей рік</SelectItem>
            <SelectItem value="last3years">Останні 3 роки</SelectItem>
            <SelectItem value="all">Весь час</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Основний графік */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {chartType === 'progress' && 'Прогрес результатів'}
              {chartType === 'medals' && 'Розподіл нагород'}
              {chartType === 'competitions' && 'Активність по рокам'}
              {chartType === 'scores' && 'Аналіз оцінок'}
            </span>
            <Badge variant="outline">
              {timeRange === 'year' && 'Поточний рік'}
              {timeRange === 'last3years' && 'Останні 3 роки'}
              {timeRange === 'all' && 'Весь період'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <SimpleChart data={chartData} />
          </div>
        </CardContent>
      </Card>

      {/* Детальна статистика */}
      {showDetailedStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                Загальна активність
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Змагань:</span>
                  <span className="font-medium">{stats.totalCompetitions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Середній бал:</span>
                  <span className="font-medium">
                    {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Кращий бал:</span>
                  <span className="font-medium text-green-600">
                    {stats.bestScore > 0 ? stats.bestScore.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                Досягнення
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Перемоги:</span>
                  <span className="font-medium text-yellow-600">{stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Подіуми:</span>
                  <span className="font-medium text-orange-600">{stats.podiums}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">% успіху:</span>
                  <span className="font-medium">
                    {stats.totalCompetitions > 0
                      ? Math.round((stats.podiums / stats.totalCompetitions) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Medal className="h-4 w-4 mr-2 text-orange-500" />
                Медалі
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">🥇 Золото:</span>
                  <span className="font-medium">{stats.medalsByType.gold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🥈 Срібло:</span>
                  <span className="font-medium">{stats.medalsByType.silver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🥉 Бронза:</span>
                  <span className="font-medium">{stats.medalsByType.bronze}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
