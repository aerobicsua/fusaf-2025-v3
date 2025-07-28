import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

/**
 * API Tests for Health Check Endpoint
 * Tests the comprehensive health check functionality
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Health Check API', () => {

  beforeAll(async () => {
    // Wait for server to be ready
    console.log('🔄 Waiting for server to be ready...');

    let retries = 30;
    while (retries > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.status === 200) {
          console.log('✅ Server is ready');
          break;
        }
      } catch (error) {
        // Server not ready yet
      }

      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (retries === 0) {
      throw new Error('Server failed to start within timeout');
    }
  });

  test('GET /api/health should return 200 status', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    expect(response.status).toBe(200);
  });

  test('Health response should have correct structure', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    // Check basic structure
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('service');
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('checks');
    expect(data).toHaveProperty('responseTime');

    // Check service name
    expect(data.service).toBe('FUSAF');

    // Check status is valid
    expect(['healthy', 'warning', 'degraded', 'unhealthy']).toContain(data.status);

    // Check timestamp format
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);

    // Check response time is reasonable
    expect(data.responseTime).toBeGreaterThan(0);
    expect(data.responseTime).toBeLessThan(5000); // Should be under 5 seconds
  });

  test('Health checks should include database check', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('database');
    expect(data.checks.database).toHaveProperty('status');
    expect(data.checks.database).toHaveProperty('message');

    // Database should be healthy in test environment
    expect(['healthy', 'warning']).toContain(data.checks.database.status);
  });

  test('Health checks should include system check', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('system');
    expect(data.checks.system).toHaveProperty('status');
    expect(data.checks.system).toHaveProperty('memory');
    expect(data.checks.system).toHaveProperty('uptime');

    // Memory should be reasonable
    expect(data.checks.system.memory.rss).toBeGreaterThan(0);
    expect(data.checks.system.memory.rss).toBeLessThan(1000); // Less than 1GB

    // Uptime should be positive
    expect(data.checks.system.uptime).toBeGreaterThan(0);
  });

  test('Health checks should include critical tables check', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('tables');
    expect(data.checks.tables).toHaveProperty('status');
    expect(data.checks.tables).toHaveProperty('tables');
    expect(data.checks.tables).toHaveProperty('message');

    // Should check critical tables
    const criticalTables = ['users', 'athletes', 'coaches', 'clubs', 'competitions', 'news'];
    expect(data.checks.tables.tables).toBeArray();

    const tableNames = data.checks.tables.tables.map((t: any) => t.table);
    criticalTables.forEach(table => {
      expect(tableNames).toContain(table);
    });
  });

  test('Health checks should include environment check', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('environment');
    expect(data.checks.environment).toHaveProperty('status');
    expect(data.checks.environment).toHaveProperty('variables');
    expect(data.checks.environment).toHaveProperty('message');

    // Should check required environment variables
    const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'];
    expect(data.checks.environment.variables).toBeArray();

    const varNames = data.checks.environment.variables.map((v: any) => v.name);
    requiredVars.forEach(varName => {
      expect(varNames).toContain(varName);
    });
  });

  test('HEAD /api/health should return 200 for basic check', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'HEAD'
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-cache');
  });

  test('Health endpoint should have proper cache headers', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('cache-control')).toContain('no-cache');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('cache-control')).toContain('must-revalidate');
  });

  test('Health response time should be reasonable', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds

    const data = await response.json();
    expect(data.responseTime).toBeLessThan(3000);
  });

  test('Multiple concurrent health checks should work', async () => {
    const promises = Array.from({ length: 5 }, () =>
      fetch(`${API_BASE_URL}/api/health`)
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    const dataPromises = responses.map(r => r.json());
    const dataResults = await Promise.all(dataPromises);

    dataResults.forEach(data => {
      expect(data.service).toBe('FUSAF');
      expect(['healthy', 'warning', 'degraded', 'unhealthy']).toContain(data.status);
    });
  });

  test('Health endpoint should handle database errors gracefully', async () => {
    // This test would require a way to temporarily break database connection
    // For now, we just ensure the endpoint doesn't crash

    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    // Should always return a response, even if database is down
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('checks');

    // If database is down, status should reflect that
    if (data.checks.database?.status === 'unhealthy') {
      expect(['unhealthy', 'degraded']).toContain(data.status);
    }
  });

  test('Health endpoint should provide useful error information', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    // Each check should have a descriptive message
    Object.values(data.checks).forEach((check: any) => {
      expect(check).toHaveProperty('message');
      expect(typeof check.message).toBe('string');
      expect(check.message.length).toBeGreaterThan(0);
    });
  });

});

/**
 * Integration Tests for Health Monitoring
 */
describe('Health Monitoring Integration', () => {

  test('Health endpoint should be accessible without authentication', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      headers: {
        // No authorization header
      }
    });

    expect(response.status).toBe(200);
  });

  test('Health data should be useful for monitoring systems', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    // Check that monitoring systems can easily parse status
    expect(typeof data.status).toBe('string');
    expect(typeof data.responseTime).toBe('number');
    expect(typeof data.uptime).toBe('number');

    // Check that each subsystem has clear status
    Object.values(data.checks).forEach((check: any) => {
      expect(['healthy', 'warning', 'degraded', 'unhealthy', 'error']).toContain(check.status);
    });
  });

  test('Health endpoint should handle high load', async () => {
    // Simulate high load with many concurrent requests
    const promises = Array.from({ length: 20 }, () =>
      fetch(`${API_BASE_URL}/api/health`)
    );

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Even under load, should respond reasonably quickly
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(10000); // 10 seconds for 20 requests
  });

});
