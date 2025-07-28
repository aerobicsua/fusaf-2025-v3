import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Home,
  CreditCard,
  BarChart3,
  Settings,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На головну
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">ФУСАФ Адмін</h1>
                  <p className="text-xs text-gray-500">Платіжна система</p>
                </div>
              </div>
            </div>

            <nav className="flex items-center space-x-1">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Платежі
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Аналітика
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Налаштування
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
