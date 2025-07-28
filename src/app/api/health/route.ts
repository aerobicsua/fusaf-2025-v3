import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

/**
 * Health Check API Endpoint
 * Provides comprehensive health status for the FUSAF application
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const healthChecks = {
      timestamp: new Date().toISOString(),
      service: 'FUSAF',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      status: 'healthy',
      checks: {}
    };

    // Database connectivity check
    try {
      const dbStart = Date.now();
      await executeQuery('SELECT 1 as health_check');
      const dbEnd = Date.now();

      healthChecks.checks.database = {
        status: 'healthy',
        responseTime: dbEnd - dbStart,
        message: 'Database connection successful'
      };
    } catch (dbError) {
      healthChecks.status = 'unhealthy';
      healthChecks.checks.database = {
        status: 'unhealthy',
        error: dbError instanceof Error ? dbError.message : 'Database connection failed',
        message: 'Database connection failed'
      };
    }

    // Critical tables check
    try {
      const criticalTables = ['users', 'athletes', 'coaches', 'clubs', 'competitions', 'news'];
      const tableChecks = [];

      for (const table of criticalTables) {
        try {
          await executeQuery(`SELECT 1 FROM ${table} LIMIT 1`);
          tableChecks.push({ table, status: 'accessible' });
        } catch (tableError) {
          tableChecks.push({
            table,
            status: 'error',
            error: tableError instanceof Error ? tableError.message : 'Table access failed'
          });
          healthChecks.status = 'degraded';
        }
      }

      healthChecks.checks.tables = {
        status: tableChecks.every(t => t.status === 'accessible') ? 'healthy' : 'degraded',
        tables: tableChecks,
        message: `${tableChecks.filter(t => t.status === 'accessible').length}/${criticalTables.length} critical tables accessible`
      };
    } catch (tablesError) {
      healthChecks.status = 'unhealthy';
      healthChecks.checks.tables = {
        status: 'unhealthy',
        error: tablesError instanceof Error ? tablesError.message : 'Tables check failed',
        message: 'Critical tables check failed'
      };
    }

    // System resources check
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsedMB = Math.round(memoryUsage.rss / 1024 / 1024);

      healthChecks.checks.system = {
        status: memoryUsedMB < 500 ? 'healthy' : 'warning',
        memory: {
          rss: memoryUsedMB,
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        uptime: Math.round(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        message: memoryUsedMB < 500 ? 'System resources healthy' : 'High memory usage detected'
      };

      if (memoryUsedMB >= 500 && healthChecks.status === 'healthy') {
        healthChecks.status = 'warning';
      }
    } catch (systemError) {
      healthChecks.checks.system = {
        status: 'error',
        error: systemError instanceof Error ? systemError.message : 'System check failed',
        message: 'System resources check failed'
      };
    }

    // Environment variables check
    try {
      const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'JWT_SECRET'
      ];

      const envCheck = requiredEnvVars.map(envVar => ({
        name: envVar,
        present: !!process.env[envVar]
      }));

      const missingEnvVars = envCheck.filter(env => !env.present);

      healthChecks.checks.environment = {
        status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
        variables: envCheck,
        message: missingEnvVars.length === 0
          ? 'All required environment variables present'
          : `Missing environment variables: ${missingEnvVars.map(env => env.name).join(', ')}`
      };

      if (missingEnvVars.length > 0) {
        healthChecks.status = 'unhealthy';
      }
    } catch (envError) {
      healthChecks.checks.environment = {
        status: 'error',
        error: envError instanceof Error ? envError.message : 'Environment check failed',
        message: 'Environment variables check failed'
      };
    }

    // Calculate total response time
    const endTime = Date.now();
    healthChecks.responseTime = endTime - startTime;

    // Set HTTP status based on health status
    const httpStatus = healthChecks.status === 'healthy' ? 200 :
                      healthChecks.status === 'warning' || healthChecks.status === 'degraded' ? 200 : 503;

    // Add cache headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    return NextResponse.json(healthChecks, {
      status: httpStatus,
      headers
    });

  } catch (error) {
    console.error('Health check failed:', error);

    const errorResponse = {
      timestamp: new Date().toISOString(),
      service: 'FUSAF',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// Simple HEAD request for basic health check
export async function HEAD(request: NextRequest) {
  try {
    // Quick database ping
    await executeQuery('SELECT 1');

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
