"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useSimpleAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);

      if (success) {
        // Всі користувачі йдуть на сторінку профілю
        window.location.href = '/profile';
      } else {
        setError('Невірний email або пароль');
      }
    } catch (error) {
      setError('Помилка входу в систему');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <div className="mb-4">
            <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">Ф</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ФУСАФ</h1>
            <p className="text-gray-600">Федерація України зі Спортивної Аеробіки і Фітнесу</p>
          </div>
        </div>

        {/* Форма входу */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2" />
              Вхід в систему
            </CardTitle>
            <CardDescription>
              Введіть вашу електронну пошту та пароль для входу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@fusaf.org.ua"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть пароль"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вхід...' : 'Увійти'}
              </Button>
            </form>
          </CardContent>
        </Card>



        {/* Посилання назад */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
