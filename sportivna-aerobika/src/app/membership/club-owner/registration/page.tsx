"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, UserPlus, ArrowLeft, Info, Upload } from "lucide-react";

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

// Посади керівників
const POSITIONS = [
  "Керівник",
  "Директор",
  "Президент",
  "Голова",
  "Засновник",
  "Виконавчий директор",
  "Генеральний директор"
];

export default function ClubOwnerRegistrationPage() {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Особисті дані
    firstName: "",
    lastName: "",
    middleName: "",
    position: "", // Нове поле
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    region: "", // Нове поле
    city: "",

    // Інформація про клуб/підрозділ
    clubName: "",
    clubType: "club", // club або subdivision
    zipCode: "", // Нове поле
    clubRegion: "", // Нове поле
    clubCity: "",
    clubAddress: "",
    clubDescription: "",
    experience: "",
    achievements: "", // Нове поле для досягнень клубу
    legalStatus: "",
    website: "",

    // Документи
    registrationDocuments: null as File | null
  });

  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWebsiteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      setFormData(prev => ({
        ...prev,
        website: `https://${value}`
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Перевірка розміру файлу ПЕРЕД завантаженням (максимум 2MB для стабільної роботи)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert(`Файл занадто великий! Максимальний розмір: 2MB. Ваш файл: ${Math.round(file.size / 1024 / 1024)}MB`);
        e.target.value = ''; // Очищаємо input
        return;
      }

      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Валідація основних полів
      if (!formData.firstName || !formData.lastName || !formData.middleName || !formData.email || !formData.phone || !formData.password) {
        alert('Заповніть всі обов\'язкові поля');
        setIsLoading(false);
        return;
      }

      if (!formData.clubName) {
        alert('Назва клубу обов\'язкова');
        setIsLoading(false);
        return;
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

      // Створюємо FormData для API реєстрації клуб-власника
      const registrationFormData = new FormData();

      // Особисті дані
      registrationFormData.append('firstName', formData.firstName);
      registrationFormData.append('lastName', formData.lastName);
      registrationFormData.append('middleName', formData.middleName);
      registrationFormData.append('position', formData.position);
      registrationFormData.append('email', formData.email);
      registrationFormData.append('phone', formData.phone);
      registrationFormData.append('password', formData.password);
      registrationFormData.append('region', formData.region);
      registrationFormData.append('city', formData.city);

      // Логування FormData
      console.log('📤 FormData для API:');
      for (let [key, value] of registrationFormData.entries()) {
        if (key === 'password') {
          console.log(`  ${key}: ${value ? '✓ пароль передається' : '✗ пароль пустий'} (довжина: ${value.length})`);
        } else if (key === 'registrationDocuments') {
          console.log(`  ${key}: файл ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Інформація про клуб
      registrationFormData.append('clubName', formData.clubName);
      registrationFormData.append('clubType', formData.clubType);
      registrationFormData.append('zipCode', formData.zipCode);
      registrationFormData.append('clubRegion', formData.clubRegion);
      registrationFormData.append('clubCity', formData.clubCity);
      registrationFormData.append('clubAddress', formData.clubAddress);
      registrationFormData.append('clubDescription', formData.clubDescription);
      registrationFormData.append('experience', formData.experience);
      registrationFormData.append('achievements', formData.achievements);
      registrationFormData.append('legalStatus', formData.legalStatus);
      registrationFormData.append('website', formData.website);

      // Документи
      if (formData.registrationDocuments) {
        registrationFormData.append('registrationDocuments', formData.registrationDocuments);
      }

      // Логування перед відправкою
      console.log('📋 Дані форми перед відправкою:', {
        legalStatus: formData.legalStatus,
        clubType: formData.clubType,
        region: formData.region,
        clubRegion: formData.clubRegion,
        password: formData.password ? '✓ є пароль' : '✗ немає пароля',
        passwordLength: formData.password?.length || 0,
        allFormData: formData
      });

      // Відправляємо заявку на основний API
      console.log('📤 Відправляємо заявку на реєстрацію клубу...');

      const apiResponse = await fetch('/api/club-owner-registration', {
        method: 'POST',
        body: registrationFormData,
      });

      console.log('📊 API статус:', apiResponse.status);

      // Отримуємо відповідь як текст спочатку
      const apiText = await apiResponse.text();
      console.log('📄 Відповідь API:', apiText.substring(0, 200) + '...');

      // Перевіряємо, чи це HTML помилка 413
      if (apiResponse.status === 413) {
        throw new Error('Файл занадто великий для сервера! Максимальний розмір: 2MB. Спробуйте менший файл.');
      }

      // Перевіряємо, чи відповідь є HTML замість JSON
      if (apiText.trim().startsWith('<html') || apiText.includes('<title>')) {
        throw new Error(`Сервер повернув помилку. Статус: ${apiResponse.status}. Спробуйте менший файл.`);
      }

      // Парсимо JSON відповідь
      let apiResult;
      try {
        apiResult = JSON.parse(apiText);
      } catch (jsonError) {
        console.error('❌ Помилка парсингу JSON:', apiText.substring(0, 200));
        throw new Error('Сервер повернув некоректну відповідь. Спробуйте ще раз.');
      }

      if (apiResult && apiResult.success) {
        console.log('✅ Заявка успішно відправлена через API');
        setShowSuccess(true);
        // Перенаправляємо через 3 секунди
        setTimeout(() => {
          router.push('/registration-success?type=club');
        }, 3000);
      } else {
        throw new Error(apiResult?.error || 'Помилка API реєстрації клуб-власника');
      }
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      alert(error instanceof Error ? error.message : 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/membership/club-owner" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад до інформації
            </Link>

            <div className="text-center mb-8">
              <Building className="h-16 w-16 text-pink-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Реєстрація Керівника Клубу/Підрозділу
              </h1>
              <p className="text-gray-600">
                Заповніть форму для реєстрації як керівник клубу або підрозділу ФУСАФ
              </p>
            </div>
          </div>

          {/* Повідомлення про успіх */}
          {showSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-green-800 font-medium">Заявка успішно подана!</h4>
                  <AlertDescription className="text-green-700">
                    Ваша заявка на реєстрацію клубу була успішно відправлена.
                    Адміністрація ФУСАФ розгляне її протягом 3-5 робочих днів.
                    Повідомлення про результат буде надіслано на вашу електронну пошту.
                    <br />
                    <span className="text-sm font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2 inline-block">
                      ⚠️ Важливо: Авторизація буде доступна тільки після схвалення заявки адміністратором.
                    </span>
                    <br />
                    <span className="text-sm">Перенаправляємо на сторінку підтвердження...</span>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Особисті дані */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Особисті дані
                </CardTitle>
                <CardDescription>
                  Інформація про керівника клубу/підрозділу
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">Прізвище *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
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
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="middleName">По батькові *</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Посада *</Label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleSelectChange("position", e.target.value)}
                    className="w-full p-2 border rounded-md border-gray-300"
                  >
                    <option value="">Оберіть посаду</option>
                    {POSITIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+380XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Область *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleSelectChange("region", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть область" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Місто *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Інформація про клуб/підрозділ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Інформація про Клуб/Підрозділ
                </CardTitle>
                <CardDescription>
                  Основна інформація про ваш клуб або підрозділ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clubName">Назва клубу/підрозділу *</Label>
                  <Input
                    id="clubName"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clubType">Тип організації *</Label>
                  <Select
                    value={formData.clubType}
                    onValueChange={(value) => handleSelectChange("clubType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">Спортивний клуб</SelectItem>
                      <SelectItem value="subdivision">Спортивний підрозділ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Поштовий індекс *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clubRegion">Область *</Label>
                    <Select
                      value={formData.clubRegion}
                      onValueChange={(value) => handleSelectChange("clubRegion", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть область" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clubCity">Місто *</Label>
                    <Input
                      id="clubCity"
                      name="clubCity"
                      value={formData.clubCity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="clubAddress">Повна адреса *</Label>
                  <Input
                    id="clubAddress"
                    name="clubAddress"
                    placeholder="вул. Назва, буд. №, офіс/кв. №"
                    value={formData.clubAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="legalStatus">Правовий статус *</Label>
                  <Select
                    value={formData.legalStatus}
                    onValueChange={(value) => handleSelectChange("legalStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть правовий статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ТОВ">ТОВ</SelectItem>
                      <SelectItem value="ПП">Приватне підприємство</SelectItem>
                      <SelectItem value="ФОП">ФОП</SelectItem>
                      <SelectItem value="ГО">Громадська організація</SelectItem>
                      <SelectItem value="БФ">Благодійний фонд</SelectItem>
                      <SelectItem value="КФГ">Комунальна форма господарювання</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clubDescription">Опис клубу/підрозділу</Label>
                  <Textarea
                    id="clubDescription"
                    name="clubDescription"
                    placeholder="Розкажіть про вашу організацію, напрямки діяльності, досягнення..."
                    value={formData.clubDescription}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Досвід керівництва</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Ваш досвід у сфері спорту, керівництва організаціями..."
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="achievements">Досягнення клубу/підрозділу</Label>
                  <Textarea
                    id="achievements"
                    name="achievements"
                    placeholder="Опишіть досягнення вашого клубу: нагороди, перемоги в змаганнях, визнання..."
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Веб-сайт (за наявності)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="yourclub.com або www.yourclub.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    onBlur={handleWebsiteBlur}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Введіть адресу сайту. https:// буде додано автоматично
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Документи */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Документи про реєстрацію
                </CardTitle>
                <CardDescription>
                  Завантажте документи, що підтверджують реєстрацію юридичної особи або ФОП
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="registrationDocuments">
                    Документи про реєстрацію Юрособи/ФОП *
                  </Label>
                  <Input
                    id="registrationDocuments"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "registrationDocuments")}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Прийнятні формати: PDF, JPG, PNG. Максимальний розмір: 2 МБ
                  </p>
                  {uploadedFiles.registrationDocuments && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Файл завантажено: {uploadedFiles.registrationDocuments.name}
                    </p>
                  )}
                </div>

                {/* Список необхідних документів */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Необхідні документи:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                      Витяг з ЄДР (для юридичних осіб) або свідоцтво про реєстрацію ФОП
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                      Статут організації (для юридичних осіб)
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                      Довідка про податкову реєстрацію
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                      Документи, що підтверджують право керування організацією
                    </li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    <strong>Примітка:</strong> Ви можете завантажити один PDF файл з усіма документами або окремі сканкопії
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Інформаційне повідомлення */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Після подання заявки вона буде розглянута адміністрацією ФУСАФ протягом 3-5 робочих днів.
                Ви отримаєте повідомлення на вказану електронну пошту про результат розгляду.
              </AlertDescription>
            </Alert>

            {/* Кнопка відправки */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-3 bg-pink-600 hover:bg-pink-700"
              >
                {isLoading ? "Реєстрація..." : "Подати заявку на реєстрацію"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
