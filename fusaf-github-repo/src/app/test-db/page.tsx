"use client"

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { testSupabaseConnection } from '@/lib/test-supabase'
import { Database, CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react'

export default function TestDatabasePage() {
  const [connectionResult, setConnectionResult] = useState<{success: boolean, error?: string} | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [schemaStatus, setSchemaStatus] = useState<{success: boolean, error?: string, needsManualSetup?: boolean, message?: string, data?: unknown} | null>(null)
  const [isCreatingSchema, setIsCreatingSchema] = useState(false)

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const result = await testSupabaseConnection()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({ success: false, error: String(error) })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const createDatabaseSchema = async () => {
    setIsCreatingSchema(true)
    setSchemaStatus(null)

    try {
      console.log('🚀 Creating database schema...')

      // Create the schema using SQL
      const schemaSQL = `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create custom types
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('athlete', 'club_owner', 'coach_judge', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE sport_level AS ENUM ('beginner', 'amateur', 'professional', 'elite');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE competition_category AS ENUM ('open', 'junior', 'senior', 'professional', 'amateur');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE competition_status AS ENUM ('draft', 'published', 'registration_open', 'registration_closed', 'completed', 'cancelled');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        DO $$ BEGIN
            CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlist');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Users table (extends Supabase auth.users)
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            role user_role NOT NULL DEFAULT 'athlete',
            phone TEXT,
            date_of_birth DATE,
            city TEXT,
            bio TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Clubs table
        CREATE TABLE IF NOT EXISTS public.clubs (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            city TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            logo_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

        -- Competitions table
        CREATE TABLE IF NOT EXISTS public.competitions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location TEXT NOT NULL,
            address TEXT NOT NULL,
            max_participants INTEGER,
            entry_fee DECIMAL(10,2),
            category competition_category NOT NULL,
            prizes TEXT,
            rules TEXT,
            contact_info TEXT,
            status competition_status NOT NULL DEFAULT 'draft',
            club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
            created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
      `

      const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL })

      if (error) {
        // If RPC doesn't exist, try direct table creation
        console.log('Trying direct table creation...')

        // Try creating users table directly
        const { error: usersError } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (usersError && usersError.message.includes('does not exist')) {
          setSchemaStatus({
            success: false,
            error: 'Schema creation requires manual setup in Supabase SQL Editor',
            needsManualSetup: true
          })
        } else {
          setSchemaStatus({ success: true, message: 'Schema appears to be set up correctly' })
        }
      } else {
        setSchemaStatus({ success: true, data })
      }

    } catch (error) {
      console.error('Schema creation error:', error)
      setSchemaStatus({
        success: false,
        error: String(error),
        needsManualSetup: true
      })
    } finally {
      setIsCreatingSchema(false)
    }
  }

  const checkTables = async () => {
    const tables = ['users', 'clubs', 'competitions', 'registrations', 'athlete_profiles', 'coach_profiles']
    const results: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        results[table] = !error
      } catch {
        results[table] = false
      }
    }

    return results
  }

  const [tableStatus, setTableStatus] = useState<Record<string, boolean> | null>(null)
  const [isCheckingTables, setIsCheckingTables] = useState(false)

  const handleCheckTables = async () => {
    setIsCheckingTables(true)
    try {
      const results = await checkTables()
      setTableStatus(results)
    } catch (error) {
      console.error('Error checking tables:', error)
    } finally {
      setIsCheckingTables(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔬 Тестування бази даних
          </h1>
          <p className="text-gray-600">
            Перевірка підключення до Supabase та налаштування схеми
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Підключення до Supabase
              </CardTitle>
              <CardDescription>
                Перевірка з'єднання з базою даних
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="btn-aerobics-primary"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Тестування...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Тест підключення
                    </>
                  )}
                </Button>
              </div>

              {connectionResult && (
                <div className={`p-4 rounded-lg ${connectionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start space-x-2">
                    {connectionResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-medium ${connectionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {connectionResult.success ? 'Підключення успішне!' : 'Помилка підключення'}
                      </h4>
                      {connectionResult.error && (
                        <p className="text-sm text-red-700 mt-1">
                          {connectionResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schema Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Створення схеми
              </CardTitle>
              <CardDescription>
                Налаштування таблиць та структури бази даних
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  onClick={createDatabaseSchema}
                  disabled={isCreatingSchema}
                  variant="outline"
                >
                  {isCreatingSchema ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Створення...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Створити схему
                    </>
                  )}
                </Button>
              </div>

              {schemaStatus && (
                <div className={`p-4 rounded-lg ${schemaStatus.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start space-x-2">
                    {schemaStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-medium ${schemaStatus.success ? 'text-green-800' : 'text-yellow-800'}`}>
                        {schemaStatus.success ? 'Схема створена!' : 'Потрібне ручне налаштування'}
                      </h4>
                      {schemaStatus.error && (
                        <p className="text-sm text-yellow-700 mt-1">
                          {schemaStatus.error}
                        </p>
                      )}
                      {schemaStatus.needsManualSetup && (
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Для створення схеми:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Перейдіть у Supabase Dashboard</li>
                            <li>Відкрийте SQL Editor</li>
                            <li>Скопіюйте вміст файлу database/schema.sql</li>
                            <li>Виконайте SQL команди</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Статус таблиць
              </CardTitle>
              <CardDescription>
                Перевірка існування необхідних таблиць
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCheckTables}
                disabled={isCheckingTables}
                variant="outline"
              >
                {isCheckingTables ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Перевірка...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Перевірити таблиці
                  </>
                )}
              </Button>

              {tableStatus && (
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(tableStatus).map(([table, exists]) => (
                    <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{table}</span>
                      <Badge variant={exists ? "default" : "destructive"}>
                        {exists ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Існує
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Відсутня
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Інструкції з налаштування</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <h4>1. Налаштування Google OAuth в Supabase:</h4>
              <ol>
                <li>Перейдіть у Supabase Dashboard → Authentication → Providers</li>
                <li>Увімкніть Google Provider</li>
                <li>Додайте redirect URLs: <code>http://localhost:3000/auth/callback</code></li>
              </ol>

              <h4>2. Створення Google OAuth App:</h4>
              <ol>
                <li>Перейдіть у Google Cloud Console</li>
                <li>Створіть OAuth 2.0 Client ID</li>
                <li>Додайте redirect URI: <code>https://wmdkymgpcitlnfiwmsuq.supabase.co/auth/v1/callback</code></li>
                <li>Скопіюйте Client ID та Secret у .env.local</li>
              </ol>

              <h4>3. Оновлення .env.local:</h4>
              <pre className="bg-gray-100 p-2 rounded">
{`GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
