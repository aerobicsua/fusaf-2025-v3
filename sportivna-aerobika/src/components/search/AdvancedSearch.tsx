"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  User,
  Trophy,
  MapPin,
  Building,
  Calendar,
  X,
  Zap,
  Star,
  Medal
} from 'lucide-react';
import Link from 'next/link';
import type { Athlete } from '@/lib/athletes-storage';

interface AdvancedSearchProps {
  athletes: Athlete[];
  onResultSelect?: (athlete: Athlete) => void;
  placeholder?: string;
  showQuickActions?: boolean;
}

interface SearchFilters {
  query: string;
  discipline: string;
  country: string;
  status: string;
  ageRange: string;
  hasResults: boolean;
  hasAchievements: boolean;
  club: string;
}

const initialFilters: SearchFilters = {
  query: '',
  discipline: '',
  country: '',
  status: '',
  ageRange: '',
  hasResults: false,
  hasAchievements: false,
  club: ''
};

export function AdvancedSearch({
  athletes,
  onResultSelect,
  placeholder = "Пошук спортсменів...",
  showQuickActions = true
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Обчислення унікальних значень для фільтрів
  const filterOptions = useMemo(() => {
    const disciplines = [...new Set(athletes.flatMap(a => a.disciplines))];
    const countries = [...new Set(athletes.map(a => a.country))];
    const clubs = [...new Set(athletes.map(a => a.club).filter(Boolean))] as string[];
    const statuses = [...new Set(athletes.map(a => a.status))];

    return {
      disciplines: disciplines.sort(),
      countries: countries.sort(),
      clubs: clubs.sort(),
      statuses: statuses.sort()
    };
  }, [athletes]);

  // Фільтрація спортсменів
  const filteredAthletes = useMemo(() => {
    return athletes.filter(athlete => {
      // Текстовий пошук
      if (filters.query) {
        const searchTerms = filters.query.toLowerCase().split(' ');
        const searchableText = [
          athlete.firstName,
          athlete.lastName,
          athlete.email,
          athlete.license,
          athlete.club,
          athlete.coach,
          athlete.placeOfBirth,
          ...(athlete.disciplines || []),
          ...(athlete.interests || [])
        ].join(' ').toLowerCase();

        const matchesAll = searchTerms.every(term => searchableText.includes(term));
        if (!matchesAll) return false;
      }

      // Фільтр по дисципліні
      if (filters.discipline && !athlete.disciplines.includes(filters.discipline)) {
        return false;
      }

      // Фільтр по країні
      if (filters.country && athlete.country !== filters.country) {
        return false;
      }

      // Фільтр по статусу
      if (filters.status && athlete.status !== filters.status) {
        return false;
      }

      // Фільтр по клубу
      if (filters.club && athlete.club !== filters.club) {
        return false;
      }

      // Фільтр по віку
      if (filters.ageRange && athlete.yearOfBirth) {
        const age = new Date().getFullYear() - athlete.yearOfBirth;
        switch (filters.ageRange) {
          case 'junior':
            if (age >= 18) return false;
            break;
          case 'senior':
            if (age < 18 || age > 35) return false;
            break;
          case 'veteran':
            if (age <= 35) return false;
            break;
        }
      }

      // Фільтр по наявності результатів
      if (filters.hasResults && (!athlete.results || athlete.results.length === 0)) {
        return false;
      }

      // Фільтр по наявності досягнень
      if (filters.hasAchievements && (!athlete.achievements || athlete.achievements.length === 0)) {
        return false;
      }

      return true;
    });
  }, [athletes, filters]);

  // Сортування результатів за релевантністю
  const sortedResults = useMemo(() => {
    if (!filters.query) {
      return filteredAthletes.slice(0, 10);
    }

    const query = filters.query.toLowerCase();

    return filteredAthletes
      .map(athlete => {
        let score = 0;

        // Пряме збігання імені або прізвища
        if (athlete.firstName.toLowerCase().includes(query) || athlete.lastName.toLowerCase().includes(query)) {
          score += 100;
        }

        // Збігання ліцензії
        if (athlete.license?.toLowerCase().includes(query)) {
          score += 50;
        }

        // Збігання клубу
        if (athlete.club?.toLowerCase().includes(query)) {
          score += 30;
        }

        // Наявність результатів і досягнень
        if (athlete.results && athlete.results.length > 0) {
          score += 10;
        }

        if (athlete.achievements && athlete.achievements.length > 0) {
          score += 5;
        }

        return { athlete, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.athlete);
  }, [filteredAthletes, filters.query]);

  const handleResultClick = (athlete: Athlete) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    onResultSelect?.(athlete);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setShowAdvanced(false);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    typeof value === 'boolean' ? value : Boolean(value)
  );

  // Рендер результату пошуку
  const SearchResult = ({ athlete, index }: { athlete: Athlete; index: number }) => {
    const isSelected = selectedIndex === index;
    const stats = athlete.stats;

    return (
      <Link
        href={`/membership/athletes/${athlete.id}`}
        onClick={() => handleResultClick(athlete)}
        className={`block p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Аватар */}
          <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
            {athlete.firstName.charAt(0)}{athlete.lastName.charAt(0)}
          </div>

          {/* Основна інформація */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">{athlete.firstName} {athlete.lastName}</h4>
              {stats && stats.wins > 0 && (
                <Trophy className="h-4 w-4 text-yellow-500" />
              )}
              {athlete.status === 'active' && (
                <Badge variant="outline" className="text-xs">Активний</Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {athlete.country}
                </span>
                {athlete.club && (
                  <span className="flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    {athlete.club}
                  </span>
                )}
                {athlete.yearOfBirth && (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().getFullYear() - athlete.yearOfBirth} років
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {athlete.disciplines.slice(0, 2).map(discipline => (
                  <Badge key={discipline} variant="secondary" className="text-xs">
                    {discipline}
                  </Badge>
                ))}
                {athlete.disciplines.length > 2 && (
                  <span className="text-xs text-gray-500">+{athlete.disciplines.length - 2}</span>
                )}
              </div>
            </div>
          </div>

          {/* Статистика */}
          {stats && (
            <div className="text-right text-xs text-gray-500">
              <div>🏆 {stats.wins}</div>
              <div>🥇 {stats.medalsByType.gold}</div>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="relative">
      {/* Основне поле пошуку */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={filters.query}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, query: e.target.value }));
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${hasActiveFilters ? 'text-blue-600' : ''}`}
              >
                <Filter className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Розширений пошук</DialogTitle>
                <DialogDescription>
                  Налаштуйте фільтри для точного пошуку спортсменів
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Дисципліна</label>
                  <Select
                    value={filters.discipline}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, discipline: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Всі дисципліни" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі дисципліни</SelectItem>
                      {filterOptions.disciplines.map(discipline => (
                        <SelectItem key={discipline} value={discipline}>
                          {discipline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Країна</label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Всі країни" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі країни</SelectItem>
                      {filterOptions.countries.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Всі статуси" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі статуси</SelectItem>
                      <SelectItem value="active">Активний</SelectItem>
                      <SelectItem value="inactive">Неактивний</SelectItem>
                      <SelectItem value="suspended">Призупинено</SelectItem>
                      <SelectItem value="retired">Завершив кар'єру</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Вікова категорія</label>
                  <Select
                    value={filters.ageRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Всі вікові групи" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі вікові групи</SelectItem>
                      <SelectItem value="junior">Юніори (до 18)</SelectItem>
                      <SelectItem value="senior">Дорослі (18-35)</SelectItem>
                      <SelectItem value="veteran">Ветерани (35+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Клуб/Підрозділ</label>
                  <Select
                    value={filters.club}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, club: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Всі клуби" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всі клуби</SelectItem>
                      {filterOptions.clubs.map(club => (
                        <SelectItem key={club} value={club}>
                          {club}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Додаткові фільтри</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.hasResults}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasResults: e.target.checked }))}
                      />
                      <span>Має результати змагань</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.hasAchievements}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasAchievements: e.target.checked }))}
                      />
                      <span>Має досягнення</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Очистити все
                </Button>
                <Button onClick={() => setShowAdvanced(false)}>
                  Застосувати фільтри
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Результати пошуку */}
      {isOpen && (filters.query || hasActiveFilters) && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-96 overflow-y-auto border shadow-lg">
          {sortedResults.length > 0 ? (
            <div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Знайдено {filteredAthletes.length} спортсменів
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sortedResults.map((athlete, index) => (
                  <SearchResult key={athlete.id} athlete={athlete} index={index} />
                ))}

                {filteredAthletes.length > 10 && (
                  <div className="p-3 text-center text-sm text-gray-500 border-t">
                    Показано 10 з {filteredAthletes.length} результатів
                  </div>
                )}
              </CardContent>
            </div>
          ) : (
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Спортсменів не знайдено</p>
              <p className="text-sm text-gray-400 mt-1">
                Спробуйте змінити критерії пошуку
              </p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Швидкі дії */}
      {showQuickActions && !isOpen && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, hasResults: true, query: 'чемпіон' }))}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            Чемпіони
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, discipline: 'Спортивна аеробіка' }))}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Спортивна аеробіка
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, ageRange: 'junior' }))}
            className="text-xs"
          >
            <User className="h-3 w-3 mr-1" />
            Юніори
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, hasAchievements: true }))}
            className="text-xs"
          >
            <Medal className="h-3 w-3 mr-1" />
            З досягненнями
          </Button>
        </div>
      )}
    </div>
  );
}
