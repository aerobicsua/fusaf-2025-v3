#!/usr/bin/env node

/**
 * FUSAF Health Check Script
 * Performs comprehensive health checks for the application
 */

const http = require('http');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DATABASE_HOST || 'fusaf-db';
const DB_PORT = process.env.DATABASE_PORT || 3306;
const DB_USER = process.env.DATABASE_USER || 'fusaf_user';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || '';
const DB_NAME = process.env.DATABASE_NAME || 'fusaf_production';

/**
 * Check HTTP endpoint health
 */
async function checkHTTP() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', service: 'http' });
      } else {
        reject(new Error(`HTTP health check failed with status: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`HTTP health check failed: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP health check timed out'));
    });

    req.end();
  });
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectTimeout: 5000
    });

    // Simple query to test connection
    const [rows] = await connection.execute('SELECT 1 as health');

    if (rows && rows[0] && rows[0].health === 1) {
      return { status: 'healthy', service: 'database' };
    } else {
      throw new Error('Database query returned unexpected result');
    }
  } catch (error) {
    throw new Error(`Database health check failed: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Check critical tables exist
 */
async function checkDatabaseTables() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectTimeout: 5000
    });

    const criticalTables = ['users', 'athletes', 'coaches', 'clubs', 'competitions', 'news'];
    const results = [];

    for (const table of criticalTables) {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [DB_NAME, table]
      );

      if (rows[0].count === 1) {
        results.push({ table, status: 'exists' });
      } else {
        throw new Error(`Critical table '${table}' does not exist`);
      }
    }

    return { status: 'healthy', service: 'database_tables', tables: results };
  } catch (error) {
    throw new Error(`Database tables check failed: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Check system resources
 */
function checkSystemResources() {
  const usage = process.memoryUsage();
  const uptime = process.uptime();

  // Convert bytes to MB
  const memoryUsage = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };

  // Check if memory usage is reasonable (less than 500MB)
  if (memoryUsage.rss > 500) {
    throw new Error(`High memory usage detected: ${memoryUsage.rss}MB`);
  }

  return {
    status: 'healthy',
    service: 'system',
    uptime: Math.round(uptime),
    memory: memoryUsage
  };
}

/**
 * Main health check function
 */
async function performHealthCheck() {
  const results = [];
  const errors = [];

  console.log('🔍 Starting FUSAF health check...');

  // Check HTTP endpoint
  try {
    const httpResult = await checkHTTP();
    results.push(httpResult);
    console.log('✅ HTTP endpoint: healthy');
  } catch (error) {
    errors.push({ service: 'http', error: error.message });
    console.log('❌ HTTP endpoint: failed -', error.message);
  }

  // Check database connectivity
  try {
    const dbResult = await checkDatabase();
    results.push(dbResult);
    console.log('✅ Database connection: healthy');
  } catch (error) {
    errors.push({ service: 'database', error: error.message });
    console.log('❌ Database connection: failed -', error.message);
  }

  // Check database tables
  try {
    const tablesResult = await checkDatabaseTables();
    results.push(tablesResult);
    console.log('✅ Database tables: healthy');
  } catch (error) {
    errors.push({ service: 'database_tables', error: error.message });
    console.log('❌ Database tables: failed -', error.message);
  }

  // Check system resources
  try {
    const systemResult = checkSystemResources();
    results.push(systemResult);
    console.log('✅ System resources: healthy');
  } catch (error) {
    errors.push({ service: 'system', error: error.message });
    console.log('❌ System resources: failed -', error.message);
  }

  // Overall health status
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overall: errors.length === 0 ? 'healthy' : 'unhealthy',
    services: results,
    errors: errors,
    checks_performed: results.length + errors.length,
    checks_passed: results.length,
    checks_failed: errors.length
  };

  if (errors.length === 0) {
    console.log('🎉 All health checks passed!');
    console.log(JSON.stringify(healthStatus, null, 2));
    process.exit(0);
  } else {
    console.log('💥 Health check failed!');
    console.log(JSON.stringify(healthStatus, null, 2));
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run health check
performHealthCheck().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
