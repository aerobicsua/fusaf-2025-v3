import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Отримати OpenAPI специфікацію
 *     description: Повертає повну OpenAPI 3.0 специфікацію для FUSAF API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OpenAPI специфікація
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(swaggerSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating API documentation:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to generate API documentation',
      message: 'Internal server error'
    }, { status: 500 });
  }
}
