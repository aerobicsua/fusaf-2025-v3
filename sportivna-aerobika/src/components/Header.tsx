"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Menu, User, LogIn, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { useSimpleAuth } from "@/components/SimpleAuthProvider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useSimpleAuth();

  // Додаємо стан для власника клубу
  const [isClubOwner, setIsClubOwner] = useState(false);

  // Перевіряємо чи є користувач власником клубу
  useEffect(() => {
    if (user) {
      const approvedClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
      const isClubOwner = approvedClubs.some((club) => club.owner?.email === user.email);
      setIsClubOwner(isClubOwner);
    } else {
      setIsClubOwner(false);
    }
  }, [user]);

  const getRoleLabel = (roles) => {
    if (!roles || roles.length === 0) return "Користувач";
    if (roles.includes("admin")) return "Адміністратор";
    if (roles.includes("athlete")) return "Спортсмен";
    if (roles.includes("coach_judge")) return "Тренер/Суддя";
    if (roles.includes("club_owner")) return "Власник клубу";
    return "Користувач";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between min-h-16 py-2">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-3">
            <Logo className="h-10 w-auto" />
            <div className="flex flex-col justify-center">
              <span className="font-bold text-base text-gray-900 leading-tight">
                Федерація України
              </span>
              <span className="font-medium text-sm text-gray-900 leading-tight -mt-0.5">
                зі Спортивної Аеробіки і Фітнесу
              </span>
              <span className="text-xs text-blue-600 font-medium -mt-0.5">
                fusaf.org.ua
              </span>
            </div>
          </Link>

          {/* Десктопна навігація - спрощена версія */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Членство з підменю */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 p-0 h-auto font-normal">
                  Членство
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem asChild>
                  <Link href="/membership/athletes" className="cursor-pointer w-full">
                    👥 Зареєстровані спортсмени
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership/athlete/registration" className="cursor-pointer w-full">
                    🏃‍♂️ Реєстрація спортсменів
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership/club-owner/registration" className="cursor-pointer w-full">
                    🏢 Реєстрація Клубу/Підрозділу
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership/coach-judge/registration" className="cursor-pointer w-full">
                    👨‍🏫 Реєстрація Тренера/Судді
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/instructions" className="cursor-pointer w-full">
                    📋 Інструкції
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/competitions" className="text-gray-700 hover:text-pink-600">
              Змагання
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-pink-600">
              Курси
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-pink-600">
              Новини
            </Link>
            <Link href="/clubs" className="text-gray-700 hover:text-pink-600">
              Клуби/Підрозділи
            </Link>
          </nav>

          {/* Права частина */}
          <div className="flex items-center space-x-4">
            {/* Пошук */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

            {/* Авторизація */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-green-500 text-white">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {getRoleLabel(user?.roles)}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Мій профіль
                    </Link>
                  </DropdownMenuItem>

                  {(user?.roles?.includes("admin") || user?.email === 'andfedos@gmail.com') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin-panel" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Адмін панель
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Додаємо посилання на дашборд керівника клубу для власників клубів */}
                  {isClubOwner && (
                    <DropdownMenuItem asChild>
                      <Link href="/club-manager/dashboard" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Дашборд клубу
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Вхід
                </Button>
                <Button
                  onClick={() => window.location.href = '/membership'}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  Стати членом
                </Button>
              </div>
            )}

            {/* Кнопка адмін - розширена версія з debug */}
            {user?.email === 'andfedos@gmail.com' && (
              <div className="flex items-center space-x-2">
                {/* Основна кнопка адміна */}
                <Link href="/admin-panel">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg shadow-md">
                    ⚡ Адмін
                  </Button>
                </Link>

                {/* Dropdown з варіантами адмін панелі */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      ⚙️
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1 text-xs text-gray-500 border-b">
                      Адмін панелі:
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin-direct" className="cursor-pointer">
                        🔧 Пряма панель (debug)
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin-test" className="cursor-pointer">
                        📧 Тестова панель
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin-simple" className="cursor-pointer">
                        ⚡ Спрощена панель
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin-panel" className="cursor-pointer">
                        ⭐ Альтернативна панель
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Debug інформація для діагностики */}
            {user && process.env.NODE_ENV === 'development' && (
              <div className="hidden lg:block text-xs bg-blue-50 px-2 py-1 rounded">
                {user.email} | {user.roles?.join(', ') || 'no roles'}
              </div>
            )}

            {/* Мобільне меню */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Мобільна навігація */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4 absolute top-16 left-0 right-0 shadow-lg">
            <nav className="flex flex-col space-y-2 container mx-auto px-4">
              {/* Членство з підменю */}
              <div>
                <div className="font-medium text-gray-900 px-4 py-2">Членство</div>
                <div className="ml-4 space-y-1">
                  <Link
                    href="/membership/athletes"
                    className="block px-4 py-2 text-gray-600 hover:text-pink-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👥 Зареєстровані спортсмени
                  </Link>
                  <Link
                    href="/membership/athlete/registration"
                    className="block px-4 py-2 text-gray-600 hover:text-pink-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏃‍♂️ Реєстрація спортсменів
                  </Link>
                  <Link
                    href="/membership/club-owner/registration"
                    className="block px-4 py-2 text-gray-600 hover:text-pink-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏢 Реєстрація Клубу/Підрозділу
                  </Link>
                  <Link
                    href="/membership/coach-judge/registration"
                    className="block px-4 py-2 text-gray-600 hover:text-pink-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👨‍🏫 Реєстрація Тренера/Судді
                  </Link>
                  <Link
                    href="/instructions"
                    className="block px-4 py-2 text-gray-600 hover:text-pink-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📋 Інструкції
                  </Link>
                </div>
              </div>

              <Link
                href="/competitions"
                className="px-4 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Змагання
              </Link>
              <Link
                href="/courses"
                className="px-4 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Курси
              </Link>
              <Link
                href="/news"
                className="px-4 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Новини
              </Link>
              <Link
                href="/clubs"
                className="px-4 py-2 text-gray-700 hover:text-pink-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Клуби/Підрозділи
              </Link>

              <div className="px-4 pt-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Привіт, {user?.name}!
                    </div>
                    <Link href="/profile">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Мій профіль
                      </Button>
                    </Link>
                    {/* Додаємо посилання на дашборд керівника клубу для власників клубів у мобільному меню */}
                    {isClubOwner && (
                      <Link href="/club-manager/dashboard">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Дашборд клубу
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Вийти
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full text-green-600 border-green-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Вхід
                      </Button>
                    </Link>
                    <Link href="/membership">
                      <Button
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Стати членом
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
