"use client";

import { useState } from "react";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, UserCheck, Trophy, ArrowUp, Send, AlertCircle, Clock } from "lucide-react";

const ROLE_OPTIONS = [
  {
    id: 'club_owner',
    name: 'Власник клубу',
    icon: Building,
    description: 'Управління клубом, реєстрація спортсменів на змагання',
    requirements: [
      'Досвід роботи з спортсменами',
      'Наявність приміщення для тренувань',
      'Документи про реєстрацію клубу'
    ]
  },
  {
    id: 'coach_judge',
    name: 'Тренер/Суддя',
    icon: UserCheck,
    description: 'Тренування спортсменів, суддівство змагань',
    requirements: [
      'Тренерська освіта або досвід',
      'Знання правил змагань',
      'Сертифікати або дипломи'
    ]
  }
];

const ROLE_NAMES = {
  athlete: 'Спортсмен',
  club_owner: 'Власник клубу',
  coach_judge: 'Тренер/Суддя'
};

export function RequestRoleUpgrade() {
  const { user } = useSimpleAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Не показуємо компонент, якщо користувач не спортсмен
  if (!user ||
      (!user?.roles?.includes('athlete') && !user?.roles?.includes('admin')) ||
      hasSubmitted) {
    return null;
  }

  const handleSubmitRequest = async () => {
    if (!selectedRole || !reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/role-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestedRole: selectedRole,
          reason: reason.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Запит успішно подано:', result);

        setDialogOpen(false);
        setSelectedRole('');
        setReason('');

        // Одразу ховаємо компонент
        setHasSubmitted(true);

        // Оновлюємо сесію з новими даними про roleRequest
        await update({
          roleRequest: {
            status: 'pending' as const,
            requestedRole: selectedRole,
            requestDate: new Date().toISOString()
          }
        });

        // Форсуємо перерендер компонентів
        console.log('✅ Сесія оновлена з roleRequest:', selectedRole);
      } else {
        const errorData = await response.json();
        console.error('Помилка при подачі запиту:', errorData.error);
        alert('Помилка при подачі запиту: ' + errorData.error);
      }
    } catch (error) {
      console.error('Помилка при подачі запиту:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedRoleInfo = () => {
    return ROLE_OPTIONS.find(role => role.id === selectedRole);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 text-white rounded-lg">
            <ArrowUp className="h-5 w-5" />
          </div>
          <span>Розширити можливості</span>
        </CardTitle>
        <CardDescription>
          Подайте запит на отримання додаткових ролей та можливостей у системі ФУСАФ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Поточна роль */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <Trophy className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">Поточна роль: Спортсмен</p>
            <p className="text-sm text-gray-600">Участь у змаганнях, перегляд результатів</p>
          </div>
        </div>

        {/* Подано запит */}
        {false && ( // Тимчасово відключено - спрощена система авторизації
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 text-white rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Подано запит</p>
                <p className="text-sm text-yellow-700">
                  Запит на роль "{ROLE_NAMES[(session?.user as any)?.roleRequest?.requestedRole as keyof typeof ROLE_NAMES] || (session?.user as any)?.roleRequest?.requestedRole || 'Невідома роль'}" очікує розгляду
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Подано: {(session?.user as any)?.roleRequest?.requestDate ? new Date((session?.user as any)?.roleRequest?.requestDate).toLocaleDateString('uk-UA') : 'Невідомо'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Доступні ролі для запиту */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Доступні для запиту:</h4>
          <div className="grid gap-3">
            {ROLE_OPTIONS.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.id} className="p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium">{role.name}</h5>
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          Потребує схвалення
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Вимоги:</span> {role.requirements.slice(0, 2).join(', ')}
                        {role.requirements.length > 2 && '...'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Кнопка для подачі запиту */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={(session?.user as any)?.roleRequest?.status === 'pending'}
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              {(session?.user as any)?.roleRequest?.status === 'pending'
                ? 'Запит вже подано'
                : 'Подати запит на додаткову роль'
              }
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Запит на отримання ролі</DialogTitle>
              <DialogDescription>
                Заповніть форму для подачі запиту на додаткові права в системі
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Вибір ролі */}
              <div>
                <Label htmlFor="role">Оберіть роль</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть роль для запиту" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{role.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Інформація про обрану роль */}
              {selectedRole && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Вимоги для ролі "{getSelectedRoleInfo()?.name}":
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {getSelectedRoleInfo()?.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Причина запиту */}
              <div>
                <Label htmlFor="reason">
                  Обґрунтування запиту <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Опишіть, чому ви хочете отримати цю роль. Включіть інформацію про ваш досвід, кваліфікацію та плани щодо використання нових можливостей (мінімум 50 символів)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Мінімум 50 символів
                  </p>
                  <p className="text-xs text-gray-500">
                    {reason.length}/500
                  </p>
                </div>
              </div>

              {/* Попередження */}
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Зверніть увагу:</p>
                  <p>
                    Ваш запит буде розглянутий адміністратором протягом 3-5 робочих днів.
                    Поки запит розглядається, ви зберігаєте всі права спортсмена.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Скасувати
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={!selectedRole || reason.trim().length < 50 || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Надсилання...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Подати запит
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Контактна інформація */}
        <div className="text-center pt-4 border-t border-blue-200">
          <p className="text-sm text-gray-600">
            Питання щодо ролей? Напишіть на{" "}
            <a href="mailto:info@fusaf.org.ua" className="text-blue-600 hover:underline">
              info@fusaf.org.ua
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
