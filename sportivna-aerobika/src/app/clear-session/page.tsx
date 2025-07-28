"use client";

import { useEffect } from 'react';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { useRouter } from 'next/navigation';

export default function ClearSessionPage() {
  const { logout } = useSimpleAuth();
  const router = useRouter();

  useEffect(() => {
    // Очищаємо сесію
    logout();

    // Очищаємо localStorage
    localStorage.removeItem('simple-auth-user');
    localStorage.removeItem('clubRequests');

    // Перенаправляємо на головну
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-xl font-semibold mb-2">Очищення сесії...</h1>
        <p className="text-gray-600">Ви будете перенаправлені на головну сторінку</p>
      </div>
    </div>
  );
}
