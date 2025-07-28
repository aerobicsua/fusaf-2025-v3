"use client";

import { useState } from "react";
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
// Select замінено на звичайні HTML select елементи
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, UserPlus, ArrowLeft, Info, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AthleteRegistrationPage() {
  const { user, register } = useSimpleAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("personal");

  const [formData, setFormData] = useState({
    // Особисті дані
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",

    // Англійські дані (не обов'язково)
    firstNameEn: "",
    lastNameEn: "",
    passport: "",

    // Контактна інформація
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    region: "",
    city: "",
    address: "",

    // Спортивна інформація
    club: "",
    coach: "",
    sportCategory: "",
    experience: "",

    // Додаткова інформація
    achievements: "",

    // Файли
    photo: null as File | null,
    medicalCertificate: null as File | null,
    parentalConsent: null as File | null,

    // Згоди
    agreeToTerms: false,
    agreeToPayment: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clubs = [
    // Клуби будуть завантажуватися з бази даних після верифікації
  ];

  const coaches = [
    // Тренери будуть завантажуватися з бази даних після реєстрації клубів
  ];

  const regions = [
    "Вінницька область", "Волинська область", "Дніпропетровська область",
    "Донецька область", "Житомирська область", "Закарпатська область",
    "Запорізька область", "Івано-Франківська область", "Київська область",
    "Кіровоградська область", "Луганська область", "Львівська область",
    "Миколаївська область", "Одеська область", "Полтавська область",
    "Рівненська область", "Сумська область", "Тернопільська область",
    "Харківська область", "Херсонська область", "Хмельницька область",
    "Черкаська область", "Чернівецька область", "Чернігівська область",
    "м. Київ", "м. Севастополь"
  ];

  const sportCategories = [
    "Без розряду", "3 юнацький розряд", "2 юнацький розряд", "1 юнацький розряд",
    "3 спортивний розряд", "2 спортивний розряд", "1 спортивний розряд",
    "Кандидат у майстри спорту", "Майстер спорту", "Майстер спорту міжнародного класу"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищуємо помилку при зміні поля
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Обов'язкові поля
    if (!formData.firstName) errors.firstName = "Ім'я обов'язкове";
    if (!formData.lastName) errors.lastName = "Прізвище обов'язкове";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Дата народження обов'язкова";
    if (!formData.gender) errors.gender = "Оберіть стать";
    if (!formData.email) errors.email = "Email обов'язковий";
    if (!formData.phone) errors.phone = "Телефон обов'язковий";
    if (!formData.password) errors.password = "Пароль обов'язковий";
    if (formData.password && formData.password.length < 6) {
      errors.password = "Пароль повинен містити мінімум 6 символів";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Паролі не співпадають";
    }
    if (!formData.region) errors.region = "Оберіть область";
    if (!formData.city) errors.city = "Місто обов'язкове";
    if (!formData.address) errors.address = "Адреса обов'язкова";
    if (!formData.club) errors.club = "Оберіть клуб";
    if (!formData.sportCategory) errors.sportCategory = "Оберіть спортивну категорію";
    if (!formData.experience) errors.experience = "Стаж обов'язковий";

    // Файли
    if (!formData.photo) errors.photo = "Фотографія обов'язкова";
    if (!formData.medicalCertificate) errors.medicalCertificate = "Медична довідка обов'язкова";

    // Перевірка віку для дозволу батьків
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 && !formData.parentalConsent) {
        errors.parentalConsent = "Для неповнолітніх обов'язковий дозвіл батьків";
      }
    }

    // Згоди
    if (!formData.agreeToTerms) errors.agreeToTerms = "Потрібна згода з умовами";
    if (!formData.agreeToPayment) errors.agreeToPayment = "Потрібна згода на оплату";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isTabValid = (tabName: string) => {
    switch (tabName) {
      case "personal":
        return formData.firstName && formData.lastName && formData.dateOfBirth && formData.gender;
      case "contact":
        return formData.email && formData.phone && formData.password && formData.region && formData.city;
      case "sport":
        return formData.club && formData.sportCategory && formData.experience;
      case "files":
        return formData.photo && formData.medicalCertificate;
      case "final":
        return formData.agreeToTerms && formData.agreeToPayment;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Переходимо на першу вкладку з помилками
      const errorTabs = ["personal", "contact", "sport", "files", "final"];
      for (const tab of errorTabs) {
        if (!isTabValid(tab)) {
          setCurrentTab(tab);
          break;
        }
      }
      return;
    }

    setIsLoading(true);

    try {
      // Використовуємо SimpleAuth для реєстрації
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'athlete'
      };

      const result = await register(registrationData);

      if (result.success) {
        // Зберігаємо спортсмена до списку для статистики
        const athleteData = {
          id: `athlete-${Date.now()}`,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          region: formData.region,
          city: formData.city,
          club: formData.club,
          coach: formData.coach,
          sportCategory: formData.sportCategory,
          registeredAt: new Date().toISOString(),
          status: 'active'
        };

        // Додаємо до списку схвалених спортсменів
        const existingAthletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
        existingAthletes.push(athleteData);
        localStorage.setItem('approvedAthletes', JSON.stringify(existingAthletes));

        router.push('/registration-success');
      } else {
        alert(`Помилка реєстрації: ${result.error}`);
      }
    } catch (error) {
      alert('Виникла помилка при реєстрації. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableCoaches = coaches.filter(coach => coach.clubId === formData.club);

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
                <Link href="/membership/athlete" className="text-gray-700 hover:text-blue-600">Спортсмен</Link>
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

        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-blue-600">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Реєстрація спортсмена
            </h1>
            <p className="text-gray-600">
              Заповніть усі необхідні дані для членства у ФУСАФ
            </p>
          </div>

          {/* Прогрес */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Прогрес заповнення</span>
              <span className="text-sm text-gray-600">
                {Object.values({
                  personal: isTabValid("personal"),
                  contact: isTabValid("contact"),
                  sport: isTabValid("sport"),
                  files: isTabValid("files"),
                  final: isTabValid("final")
                }).filter(Boolean).length} / 5
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.values({
                    personal: isTabValid("personal"),
                    contact: isTabValid("contact"),
                    sport: isTabValid("sport"),
                    files: isTabValid("files"),
                    final: isTabValid("final")
                  }).filter(Boolean).length / 5) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Форма */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal" className="relative">
                    Особисті дані
                    {isTabValid("personal") && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="relative">
                    Контакти
                    {isTabValid("contact") && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sport" className="relative">
                    Спорт
                    {isTabValid("sport") && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="files" className="relative">
                    Документи
                    {isTabValid("files") && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="final" className="relative">
                    Завершення
                    {isTabValid("final") && (
                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  {/* Особисті дані */}
                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Основна інформація</h3>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="lastName">Прізвище *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Іванов"
                            className={formErrors.lastName ? "border-red-500" : ""}
                          />
                          {formErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="firstName">Ім'я *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Іван"
                            className={formErrors.firstName ? "border-red-500" : ""}
                          />
                          {formErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="middleName">По батькові</Label>
                          <Input
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            placeholder="Іванович"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateOfBirth">Дата народження *</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className={formErrors.dateOfBirth ? "border-red-500" : ""}
                          />
                          {formErrors.dateOfBirth && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="gender">Стать *</Label>
                          <select
                            value={formData.gender}
                            onChange={(e) => handleSelectChange('gender', e.target.value)}
                            className={`w-full p-2 border rounded-md ${formErrors.gender ? "border-red-500" : "border-gray-300"}`}
                          >
                            <option value="">Оберіть стать</option>
                            <option value="male">Чоловіча</option>
                            <option value="female">Жіноча</option>
                          </select>
                          {formErrors.gender && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">Дані англійською мовою</h3>
                        <Info className="h-4 w-4 text-blue-500" />
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Рекомендовано заповнювати спортсменам, що приймають участь в міжнародних змаганнях.
                        </AlertDescription>
                      </Alert>

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

                      <div>
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
                  </TabsContent>

                  {/* Контактна інформація */}
                  <TabsContent value="contact" className="space-y-6 mt-6">
                    <h3 className="text-lg font-semibold">Контактна інформація</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email (логін) *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="ivan@example.com"
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Телефон *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+380671234567"
                          className={formErrors.phone ? "border-red-500" : ""}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Пароль *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Мінімум 6 символів"
                          className={formErrors.password ? "border-red-500" : ""}
                        />
                        {formErrors.password && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Підтвердження паролю *</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Повторіть пароль"
                          className={formErrors.confirmPassword ? "border-red-500" : ""}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-semibold">Адреса проживання</h4>

                      <div>
                        <Label htmlFor="region">Область *</Label>
                        <select
                          value={formData.region}
                          onChange={(e) => handleSelectChange('region', e.target.value)}
                          className={`w-full p-2 border rounded-md ${formErrors.region ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Оберіть область</option>
                          {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                        {formErrors.region && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.region}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Місто *</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Київ"
                            className={formErrors.city ? "border-red-500" : ""}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="address">Вулиця, будинок, квартира *</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="вул. Хрещатик, 1, кв. 1"
                            className={formErrors.address ? "border-red-500" : ""}
                          />
                          {formErrors.address && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Спортивна інформація */}
                  <TabsContent value="sport" className="space-y-6 mt-6">
                    <h3 className="text-lg font-semibold">Спортивна інформація</h3>

                    <div>
                      <Label htmlFor="club">Спортивний клуб *</Label>
                      <select
                        value={formData.club}
                        onChange={(e) => {
                          handleSelectChange('club', e.target.value);
                          setFormData(prev => ({ ...prev, coach: "" })); // Скидаємо тренера при зміні клубу
                        }}
                        className={`w-full p-2 border rounded-md ${formErrors.club ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Оберіть клуб</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                      </select>
                      {formErrors.club && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.club}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="coach">Тренер (необов'язково)</Label>
                      <select
                        value={formData.coach}
                        onChange={(e) => handleSelectChange('coach', e.target.value)}
                        disabled={!formData.club}
                        className="w-full p-2 border rounded-md border-gray-300 disabled:bg-gray-100"
                      >
                        <option value="">
                          {formData.club ? "Оберіть тренера" : "Спочатку оберіть клуб"}
                        </option>
                        {availableCoaches.map(coach => (
                          <option key={coach.id} value={coach.id}>{coach.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sportCategory">Спортивна категорія *</Label>
                        <select
                          value={formData.sportCategory}
                          onChange={(e) => handleSelectChange('sportCategory', e.target.value)}
                          className={`w-full p-2 border rounded-md ${formErrors.sportCategory ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Оберіть категорію</option>
                          {sportCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        {formErrors.sportCategory && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.sportCategory}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="experience">Стаж у спортивній аеробіці *</Label>
                        <Input
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="3 роки"
                          className={formErrors.experience ? "border-red-500" : ""}
                        />
                        {formErrors.experience && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.experience}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="achievements">Спортивні досягнення</Label>
                      <Textarea
                        id="achievements"
                        name="achievements"
                        value={formData.achievements}
                        onChange={handleInputChange}
                        placeholder="Опишіть ваші досягнення, участь у змаганнях, нагороди тощо"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  {/* Завантаження файлів */}
                  <TabsContent value="files" className="space-y-6 mt-6">
                    <h3 className="text-lg font-semibold">Необхідні документи</h3>

                    <div className="space-y-6">
                      {/* Фотографія */}
                      <div>
                        <Label htmlFor="photo">Фотографія (для аватара) *</Label>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Натисніть для завантаження</span>
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG або JPEG (макс. 5MB)</p>
                              </div>
                              <input
                                id="photo"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>
                          {formData.photo && (
                            <p className="text-sm text-green-600 mt-2">
                              ✓ Завантажено: {formData.photo.name}
                            </p>
                          )}
                          {formErrors.photo && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.photo}</p>
                          )}
                        </div>
                      </div>

                      {/* Медична довідка */}
                      <div>
                        <Label htmlFor="medicalCertificate">Медична довідка *</Label>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Завантажити медичну довідку</span>
                                </p>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG або JPEG (макс. 10MB)</p>
                              </div>
                              <input
                                id="medicalCertificate"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('medicalCertificate', e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>
                          {formData.medicalCertificate && (
                            <p className="text-sm text-green-600 mt-2">
                              ✓ Завантажено: {formData.medicalCertificate.name}
                            </p>
                          )}
                          {formErrors.medicalCertificate && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.medicalCertificate}</p>
                          )}
                        </div>
                      </div>

                      {/* Дозвіл батьків (для неповнолітніх) */}
                      {formData.dateOfBirth && (() => {
                        const birthDate = new Date(formData.dateOfBirth);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        return age < 18;
                      })() && (
                        <div>
                          <Label htmlFor="parentalConsent">Дозвіл батьків (для неповнолітніх) *</Label>
                          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Оскільки вам менше 18 років, необхідний письмовий дозвіл батьків або опікунів.
                            </AlertDescription>
                          </Alert>
                          <div className="mt-2">
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Завантажити дозвіл батьків</span>
                                  </p>
                                  <p className="text-xs text-gray-500">PDF, PNG, JPG або JPEG (макс. 10MB)</p>
                                </div>
                                <input
                                  id="parentalConsent"
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileChange('parentalConsent', e.target.files?.[0] || null)}
                                />
                              </label>
                            </div>
                            {formData.parentalConsent && (
                              <p className="text-sm text-green-600 mt-2">
                                ✓ Завантажено: {formData.parentalConsent.name}
                              </p>
                            )}
                            {formErrors.parentalConsent && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.parentalConsent}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Завершення та згоди */}
                  <TabsContent value="final" className="space-y-6 mt-6">
                    <h3 className="text-lg font-semibold">Завершення реєстрації</h3>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Наступні кроки після реєстрації:</strong>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Ви отримаєте email з реєстраційними даними</li>
                          <li>Необхідно сплатити членський внесок через LiqPay</li>
                          <li>Після оплати ваш профіль буде активований</li>
                          <li>Ви зможете брати участь у змаганнях ФУСАФ</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Вартість членства:</h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">500 грн на рік</div>
                      <p className="text-sm text-gray-600">
                        Членський внесок включає участь у змаганнях, доступ до навчальних матеріалів
                        та офіційну реєстрацію у федерації.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleCheckboxChange('agreeToTerms', checked as boolean)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                          Я погоджуюсь з{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            правилами та умовами
                          </Link>{" "}
                          участі у ФУСАФ та даю згоду на обробку персональних даних
                        </Label>
                      </div>
                      {formErrors.agreeToTerms && (
                        <p className="text-red-500 text-sm">{formErrors.agreeToTerms}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToPayment"
                          checked={formData.agreeToPayment}
                          onCheckedChange={(checked) => handleCheckboxChange('agreeToPayment', checked as boolean)}
                        />
                        <Label htmlFor="agreeToPayment" className="text-sm leading-5">
                          Я підтверджую готовність сплатити членський внесок у розмірі 500 грн протягом 7 днів
                          після реєстрації для активації членства
                        </Label>
                      </div>
                      {formErrors.agreeToPayment && (
                        <p className="text-red-500 text-sm">{formErrors.agreeToPayment}</p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Кнопки навігації */}
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tabs = ["personal", "contact", "sport", "files", "final"];
                        const currentIndex = tabs.indexOf(currentTab);
                        if (currentIndex > 0) {
                          setCurrentTab(tabs[currentIndex - 1]);
                        } else {
                          router.back();
                        }
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {currentTab === "personal" ? "Назад" : "Попередній крок"}
                    </Button>

                    {currentTab === "final" ? (
                      <Button
                        type="submit"
                        disabled={isLoading || !isTabValid("final")}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Реєстрація...
                          </div>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Завершити реєстрацію
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          const tabs = ["personal", "contact", "sport", "files", "final"];
                          const currentIndex = tabs.indexOf(currentTab);
                          if (currentIndex < tabs.length - 1) {
                            setCurrentTab(tabs[currentIndex + 1]);
                          }
                        }}
                        disabled={!isTabValid(currentTab)}
                      >
                        Наступний крок
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
