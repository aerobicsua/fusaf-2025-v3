"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, UserPlus, ArrowLeft, Info, Building, Users } from "lucide-react";

// Список областей України
const REGIONS = [
  "Вінницька область",
  "Волинська область",
  "Дніпропетровська область",
  "Донецька область",
  "Житомирська область",
  "Закарпатська область",
  "Запорізька область",
  "Івано-Франківська область",
  "Київська область",
  "Кіровоградська область",
  "Луганська область",
  "Львівська область",
  "Миколаївська область",
  "Одеська область",
  "Полтавська область",
  "Рівненська область",
  "Сумська область",
  "Тернопільська область",
  "Харківська область",
  "Херсонська область",
  "Хмельницька область",
  "Черкаська область",
  "Чернівецька область",
  "Чернігівська область",
  "м. Київ",
  "АР Крим"
];

export default function CoachJudgeRegistrationPage() {
  const { user, register } = useSimpleAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    region: "",
    city: "",
    // ЗАМІНЕНО: замість обов'язкового клубу - заявка до клубу
    preferredClub: "", // бажаний клуб для подачі заявки
    applicationMessage: "", // повідомлення для керівника клубу
    // Дані англійською мовою для міжнародних змагань
    firstNameEn: "",
    lastNameEn: "",
    passport: "",
    education: "",
    specialization: "",
    experience: "",
    achievements: "",
    certificates: "",
    isCoach: false,
    isJudge: false,
    // НОВІ ПОЛЯ ДЛЯ СУДДІВСЬКИХ ЛІЦЕНЗІЙ
    judgeCategory: "", // national або international
    nationalJudgeLicense: "", // для національної категорії
    figJudgeLicense: "", // для міжнародної категорії FIG
  });

  // Завантажуємо список клубів при ініціалізації
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = () => {
    try {
      const approvedClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      setClubs(approvedClubs);
    } catch (error) {
      console.error('Помилка завантаження клубів:', error);
      setClubs([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Перевірка, що обрано хоча б одну роль
      if (!formData.isCoach && !formData.isJudge) {
        alert('Оберіть хоча б одну роль: тренер або суддя');
        setIsLoading(false);
        return;
      }

      // Основні поля для реєстрації
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.preferredClub) {
        alert('Заповніть всі обов\'язкові поля (включаючи клуб, до якого подаєте заявку)');
        setIsLoading(false);
        return;
      }

      // Перевірка суддівських ліцензій
      if (formData.isJudge) {
        if (!formData.judgeCategory) {
          alert('Оберіть категорію судді');
          setIsLoading(false);
          return;
        }

        if (formData.judgeCategory === 'international' && !formData.figJudgeLicense) {
          alert('Для судді міжнародної категорії обов\'язковий номер ліцензії FIG');
          setIsLoading(false);
          return;
        }

        if (formData.judgeCategory === 'national' && !formData.nationalJudgeLicense) {
          alert('Для судді національної категорії обов\'язковий номер ліцензії');
          setIsLoading(false);
          return;
        }
      }

      // Перевірка паролів
      if (formData.password !== formData.confirmPassword) {
        alert('Паролі не співпадають');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        alert('Пароль повинен містити мінімум 6 символів');
        setIsLoading(false);
        return;
      }

      // Спочатку видаляємо конкретного користувача якщо він існує
      try {
        await fetch('/api/delete-specific-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'alyonafedosenko@gmail.com' })
        });

        // Видаляємо з localStorage
        const existingCoachesJudges = JSON.parse(localStorage.getItem('approvedCoachesJudges') || '[]');
        const filteredCoachesJudges = existingCoachesJudges.filter((item: any) =>
          item.email !== 'alyonafedosenko@gmail.com'
        );
        localStorage.setItem('approvedCoachesJudges', JSON.stringify(filteredCoachesJudges));

        console.log('✅ Користувача alyonafedosenko@gmail.com видалено');
      } catch (deleteError) {
        console.log('ℹ️ Користувач для видалення не знайдений або вже видалений');
      }

      // Використовуємо SimpleAuth для реєстрації
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'coach_judge'
      };

      const result = await register(registrationData);

      if (result.success) {
        // Отримуємо інформацію про обраний клуб
        const selectedClub = clubs.find(club => club.id === formData.preferredClub);

        // Зберігаємо тренера/суддю до списку для статистики
        const coachJudgeApplication = {
          id: `coach-judge-app-${Date.now()}`,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          city: formData.city,
          preferredClub: {
            id: formData.preferredClub,
            name: selectedClub?.name || 'Невідомий клуб'
          },
          applicationMessage: formData.applicationMessage,
          roles: [
            ...(formData.isCoach ? ['coach'] : []),
            ...(formData.isJudge ? ['judge'] : [])
          ],
          judgeInfo: formData.isJudge ? {
            category: formData.judgeCategory,
            license: formData.judgeCategory === 'international'
              ? formData.figJudgeLicense
              : formData.nationalJudgeLicense
          } : null,
          education: formData.education,
          specialization: formData.specialization,
          experience: formData.experience,
          certificates: formData.certificates,
          achievements: formData.achievements,
          // Дані англійською
          firstNameEn: formData.firstNameEn,
          lastNameEn: formData.lastNameEn,
          passport: formData.passport,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };

        // Додаємо до списку заявок тренерів/суддів
        const existingApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
        existingApplications.push(coachJudgeApplication);
        localStorage.setItem('coachJudgeApplications', JSON.stringify(existingApplications));

        router.push('/registration-success?type=coach-application');
      } else {
        alert(`Помилка реєстрації: ${result.error}`);
      }
    } catch (error) {
      alert('Виникла помилка при реєстрації. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлібні крихти */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Головна</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/membership" className="text-gray-700 hover:text-blue-600">Членство</Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/membership/coach-judge" className="text-gray-700 hover:text-blue-600">Тренер/Суддя</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Реєстрація</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Реєстрація тренера/судді
            </h1>
            <p className="text-gray-600">
              Станьте офіційним тренером або суддею ФУСАФ
            </p>
          </div>

          {/* Інформаційне повідомлення */}
          {!user && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                📝 <strong>Автоматичне створення аккаунту:</strong> Після заповнення форми для вас буде створено аккаунт з тимчасовим паролем, і ви одразу увійдете в систему.
              </AlertDescription>
            </Alert>
          )}

          {/* Форма реєстрації */}
          <Card>
            <CardHeader>
              <CardTitle>Професійні дані</CardTitle>
              <CardDescription>
                Заповніть інформацію про вашу кваліфікацію та досвід
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Особисті дані */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Особисті дані</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName">Прізвище *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Введіть ваше прізвище"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">Ім'я *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Введіть ваше ім'я"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="middleName">По батькові</Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="Введіть по батькові"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+380..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="password">Пароль *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Мінімум 6 символів"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Підтвердження пароля *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Повторіть пароль"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="region">Область *</Label>
                      <select
                        value={formData.region}
                        onChange={(e) => handleSelectChange("region", e.target.value)}
                        className="w-full p-2 border rounded-md border-gray-300"
                        required
                      >
                        <option value="">Оберіть область</option>
                        {REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="city">Місто *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Введіть ваше місто"
                      />
                    </div>
                  </div>

                  {/* ПОДАЧА ЗАЯВКИ ДО КЛУБУ */}
                  <div className="mt-4">
                    <Label htmlFor="preferredClub" className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Клуб, до якого подаєте заявку *
                    </Label>
                    <select
                      value={formData.preferredClub}
                      onChange={(e) => handleSelectChange("preferredClub", e.target.value)}
                      className="w-full p-2 border rounded-md border-gray-300"
                      required
                    >
                      <option value="">Оберіть клуб для подачі заявки</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name} - {club.city}, {club.region}
                        </option>
                      ))}
                    </select>
                    {clubs.length === 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        ℹ️ Наразі немає зареєстрованих клубів. Зверніться до адміністрації.
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="applicationMessage">Повідомлення для керівника клубу</Label>
                    <Textarea
                      id="applicationMessage"
                      name="applicationMessage"
                      value={formData.applicationMessage}
                      onChange={handleInputChange}
                      placeholder="Напишіть коротко, чому ви хочете приєднатися до цього клубу, або залиште поле порожнім"
                      rows={2}
                    />
                  </div>

                  {/* Дані англійською мовою для міжнародних змагань */}
                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <span>Дані англійською мовою</span>
                      <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Рекомендовано для тренерів/суддів, що приймають участь в міжнародних змаганнях
                      </span>
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstNameEn">Ім'я англійською</Label>
                        <Input
                          id="firstNameEn"
                          name="firstNameEn"
                          value={formData.firstNameEn}
                          onChange={handleInputChange}
                          placeholder="Ivan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastNameEn">Прізвище англійською</Label>
                        <Input
                          id="lastNameEn"
                          name="lastNameEn"
                          value={formData.lastNameEn}
                          onChange={handleInputChange}
                          placeholder="Ivanov"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="passport">Номер закордонного паспорта</Label>
                      <Input
                        id="passport"
                        name="passport"
                        value={formData.passport}
                        onChange={handleInputChange}
                        placeholder="AA123456"
                      />
                    </div>
                  </div>
                </div>

                {/* Ролі */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4">Оберіть ваші ролі</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isCoach"
                        checked={formData.isCoach}
                        onCheckedChange={(checked) => handleCheckboxChange('isCoach', checked as boolean)}
                      />
                      <Label htmlFor="isCoach" className="font-medium">
                        Тренер - підготовка спортсменів, проведення тренувань
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isJudge"
                        checked={formData.isJudge}
                        onCheckedChange={(checked) => handleCheckboxChange('isJudge', checked as boolean)}
                      />
                      <Label htmlFor="isJudge" className="font-medium">
                        Суддя - суддівство змагань, оцінювання виступів
                      </Label>
                    </div>
                  </div>

                  {/* НОВІ ПОЛЯ ДЛЯ СУДДІВСЬКИХ ЛІЦЕНЗІЙ */}
                  {formData.isJudge && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold mb-4 text-purple-800">🏅 Суддівська кваліфікація</h4>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="judgeCategory">Категорія судді *</Label>
                          <select
                            value={formData.judgeCategory}
                            onChange={(e) => handleSelectChange("judgeCategory", e.target.value)}
                            className="w-full p-2 border rounded-md border-gray-300"
                            required={formData.isJudge}
                          >
                            <option value="">Оберіть категорію</option>
                            <option value="national">Суддя національної категорії</option>
                            <option value="international">Суддя міжнародної категорії</option>
                          </select>
                        </div>

                        {formData.judgeCategory === 'national' && (
                          <div>
                            <Label htmlFor="nationalJudgeLicense">Номер ліцензії судді *</Label>
                            <Input
                              id="nationalJudgeLicense"
                              name="nationalJudgeLicense"
                              value={formData.nationalJudgeLicense}
                              onChange={handleInputChange}
                              placeholder="Введіть номер ліцензії"
                              required={formData.judgeCategory === 'national'}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Номер ліцензії судді національної категорії
                            </p>
                          </div>
                        )}

                        {formData.judgeCategory === 'international' && (
                          <div>
                            <Label htmlFor="figJudgeLicense">Номер ліцензії судді FIG *</Label>
                            <Input
                              id="figJudgeLicense"
                              name="figJudgeLicense"
                              value={formData.figJudgeLicense}
                              onChange={handleInputChange}
                              placeholder="Введіть номер ліцензії FIG"
                              required={formData.judgeCategory === 'international'}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Номер ліцензії судді Міжнародної федерації гімнастики (FIG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Освіта та кваліфікація */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Освіта та кваліфікація</h3>

                  <div>
                    <Label htmlFor="education">Освіта *</Label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      required
                      placeholder="Навчальний заклад, спеціальність, рік закінчення"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="specialization">Спеціалізація *</Label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full p-2 border rounded-md border-gray-300"
                      required
                    >
                      <option value="">Оберіть вашу спеціалізацію</option>
                      <option value="aerobics">Спортивна аеробіка</option>
                      <option value="fitness">Фітнес</option>
                      <option value="gymnastics">Гімнастика</option>
                      <option value="dance">Танці</option>
                      <option value="physical-education">Фізичне виховання</option>
                      <option value="other">Інша</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="experience">Досвід роботи *</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      placeholder="Опишіть ваш досвід роботи тренером/суддею, скільки років працюєте у сфері"
                      rows={3}
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="certificates">Сертифікати та ліцензії</Label>
                    <Textarea
                      id="certificates"
                      name="certificates"
                      value={formData.certificates}
                      onChange={handleInputChange}
                      placeholder="Перелічіть ваші професійні сертифікати, ліцензії, курси підвищення кваліфікації"
                      rows={3}
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="achievements">Досягнення</Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleInputChange}
                      placeholder="Ваші професійні досягнення, нагороди, визнання"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Реєстрація...
                      </div>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Подати заявку
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Додаткова інформація */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Після подання заявки ваш запит буде розглянуто кваліфікаційною комісією.
              Ви отримаєте повідомлення про результат розгляду та подальші кроки.
            </p>
            <p className="mt-2">
              Питання? Напишіть нам на{" "}
              <a href="mailto:education@fusaf.org.ua" className="text-blue-600 hover:underline">
                education@fusaf.org.ua
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
