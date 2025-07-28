"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getClubsByOwner,
  createCompetition
} from "@/lib/database";
import type { Club } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  FileText,
  Save,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function CreateCompetitionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    max_participants: "",
    category: "open",
    entry_fee: "",
    prizes: "",
    rules: "",
    contact_info: "",
    club_id: "",
    status: "draft"
  });

  useEffect(() => {
    const fetchClubs = async () => {
      if (!user?.id) return;

      try {
        const userClubs = await getClubsByOwner(user.id);
        setClubs(userClubs);

        // Автоматично обираємо перший клуб, якщо він є
        if (userClubs.length > 0) {
          setFormData(prev => ({ ...prev, club_id: userClubs[0].id }));
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [user]);

  if (!user || user.user_metadata?.role !== "club_owner") {
    router.push("/auth/role-selection");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Завантаження...</p>
          </div>
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Створення змагання
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Потрібно створити клуб
              </h2>
              <p className="text-yellow-700 mb-4">
                Щоб створити змагання, спочатку потрібно зареєструвати свій спортивний клуб.
              </p>
              <Button className="btn-aerobics-primary">
                Створити клуб
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.id || !formData.club_id) {
        throw new Error('Не вдалося знайти користувача або клуб');
      }

      // Перетворюємо дані для API
      const competitionData = {
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        address: formData.address,
        registration_fee: formData.entry_fee ? Number.parseFloat(formData.entry_fee) : 0,
        entry_fee: formData.entry_fee ? Number.parseFloat(formData.entry_fee) : undefined,
        max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : undefined,
        age_groups: ['all'], // Default age group
        categories: [formData.category], // Use the selected category
        category: formData.category as 'open' | 'junior' | 'senior' | 'professional' | 'amateur',
        club_id: formData.club_id,
        status: formData.status as 'draft' | 'published',
        registration_deadline: formData.date, // Use same date as default
        rules_and_regulations: formData.rules || undefined,
        contact_info: formData.contact_info || undefined,
        prizes: formData.prizes || undefined,
        created_by: user.id
      };

      console.log("Creating competition:", competitionData);

      const result = await createCompetition(competitionData);

      if (result) {
        // Перенаправлення на панель управління
        router.push("/dashboard/club-owner");
      } else {
        throw new Error('Не вдалося створити змагання');
      }
    } catch (error) {
      console.error("Error creating competition:", error);
      // Тут можна додати toast notification про помилку
      alert('Помилка при створенні змагання. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлібні крихти */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard/club-owner" className="hover:text-pink-600">
            Панель управління
          </Link>
          <span>/</span>
          <span className="text-gray-900">Створити змагання</span>
        </div>

        {/* Заголовок */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/dashboard/club-owner">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Створити змагання</h1>
            <p className="text-gray-600 mt-2">
              Заповніть всю необхідну інформацію для організації змагань з спортивної аеробіки
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Основна форма */}
            <div className="lg:col-span-2 space-y-6">
              {/* Основна інформація */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Основна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Назва змагання *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Наприклад: Чемпіонат міста з спортивної аеробіки"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Опис змагання
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      placeholder="Детальний опис змагання, його цілей та особливостей..."
                    />
                  </div>

                  <div>
                    <label htmlFor="club_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Клуб-організатор *
                    </label>
                    <select
                      id="club_id"
                      name="club_id"
                      value={formData.club_id}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name} - {club.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Категорія змагання *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="open">Відкрита категорія</option>
                      <option value="junior">Юніори (до 18 років)</option>
                      <option value="senior">Сеніори (18+ років)</option>
                      <option value="professional">Професіонали</option>
                      <option value="amateur">Аматори</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Статус публікації *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="draft">Зберегти як чернетку</option>
                      <option value="published">Опублікувати зараз</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Дата та місце */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Дата та місце проведення
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                        Дата проведення *
                      </label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                        Час початку *
                      </label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Назва майданчика *
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Наприклад: Спорткомплекс 'Олімпійський'"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Повна адреса *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Місто, вулиця, номер будинку"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Учасники та умови */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Умови участі
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                        Максимальна кількість учасників
                      </label>
                      <Input
                        id="max_participants"
                        name="max_participants"
                        type="number"
                        value={formData.max_participants}
                        onChange={handleInputChange}
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <label htmlFor="entry_fee" className="block text-sm font-medium text-gray-700 mb-2">
                        Вартість участі (грн)
                      </label>
                      <Input
                        id="entry_fee"
                        name="entry_fee"
                        type="number"
                        step="0.01"
                        value={formData.entry_fee}
                        onChange={handleInputChange}
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prizes" className="block text-sm font-medium text-gray-700 mb-2">
                      Призи та нагороди
                    </label>
                    <textarea
                      id="prizes"
                      name="prizes"
                      value={formData.prizes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      placeholder="Опишіть призи для переможців (медалі, кубки, грошові винагороди)..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Правила та контакти */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Додаткова інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                      Правила та вимоги
                    </label>
                    <textarea
                      id="rules"
                      name="rules"
                      value={formData.rules}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      placeholder="Основні правила, вимоги до учасників, необхідні документи..."
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
                      Контактна інформація
                    </label>
                    <textarea
                      id="contact_info"
                      name="contact_info"
                      value={formData.contact_info}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      placeholder="Телефон, email організатора для питань та реєстрації..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Бічна панель */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Попередній перегляд */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Попередній перегляд</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {formData.title || "Назва змагання"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {formData.date ? new Date(formData.date).toLocaleDateString('uk-UA') : "Дата не вказана"}
                        {formData.time && ` о ${formData.time}`}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {formData.location || "Місце не вказано"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {formData.max_participants ? `До ${formData.max_participants} учасників` : "Без обмежень"}
                      </span>
                    </div>

                    {formData.category && (
                      <Badge variant="secondary" className="mt-2">
                        {formData.category === "open" && "Відкрита категорія"}
                        {formData.category === "junior" && "Юніори"}
                        {formData.category === "senior" && "Сеніори"}
                        {formData.category === "professional" && "Професіонали"}
                        {formData.category === "amateur" && "Аматори"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Кнопки дій */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-aerobics-primary w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Створення...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Створити змагання
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/dashboard/club-owner")}
                    >
                      Скасувати
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Після створення ви зможете редагувати змагання в панелі управління
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
