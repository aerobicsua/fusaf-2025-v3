import { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Найпростіший layout без хуків, авторизації та залежностей
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-100 border-b border-yellow-200 p-2">
        <p className="text-center text-yellow-800 text-sm">
          🔧 AdminLayout v3: Максимально спрощений без React хуків
        </p>
      </div>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
