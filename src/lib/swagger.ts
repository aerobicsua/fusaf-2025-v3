import swaggerJSDoc from 'swagger-jsdoc';

/**
 * FUSAF API Documentation Configuration
 * OpenAPI 3.0 specification for all FUSAF endpoints
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FUSAF API Documentation',
    version: '1.0.0',
    description: `
# Федерація України зі Спортивної Аеробіки і Фітнесу (ФУСАФ) - API

Комплексна система управління спортивною федерацією з повним функціоналом для:
- Управління спортсменами та тренерами
- Реєстрації на змагання
- Кваліфікаційного реєстру тренерів/суддів
- Адміністрування системи
- Email сповіщень та експорту даних

## Аутентифікація

Більшість API endpoints вимагають аутентифікації через JWT токен.
Для отримання токена використовуйте endpoint \`/api/auth/login\`.

## Авторизація

Система підтримує наступні ролі:
- **user** - звичайний користувач
- **athlete** - спортсмен
- **coach** - тренер/суддя
- **club_owner** - власник клубу
- **admin** - адміністратор (повний доступ)

## Rate Limiting

API має обмеження:
- Загальні запити: 100 запитів/хвилину
- Авторизація: 10 спроб/хвилину
- Адмін функції: 50 запитів/хвилину

## Формат відповідей

Всі API відповіді мають стандартний формат:
\`\`\`json
{
  "success": true,
  "data": {...},
  "error": null,
  "message": "Success message"
}
\`\`\`
    `,
    contact: {
      name: 'FUSAF Tech Support',
      email: 'tech@fusaf.org.ua',
      url: 'https://fusaf.org.ua'
    },
    license: {
      name: 'Proprietary',
      url: 'https://fusaf.org.ua/license'
    }
  },
  servers: [
    {
      url: 'https://fusaf.org.ua/api',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token отриманий через /api/auth/login'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API ключ для серверних інтеграцій'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['user', 'athlete', 'coach', 'club_owner', 'admin']
            }
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'suspended', 'pending']
          },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Athlete: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          middleName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female'] },
          country: { type: 'string', default: 'Україна' },
          region: { type: 'string' },
          city: { type: 'string' },
          club: { type: 'string' },
          category: { type: 'string' },
          achievements: { type: 'array', items: { type: 'object' } },
          medicalCertificate: { type: 'object' },
          status: { type: 'string', enum: ['active', 'inactive', 'retired'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Coach: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          middleName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          coachType: {
            type: 'string',
            enum: ['coach', 'judge', 'both']
          },
          qualificationLevel: { type: 'string' },
          licenseNumber: { type: 'string' },
          licenseStatus: {
            type: 'string',
            enum: ['active', 'expired', 'suspended', 'revoked']
          },
          specializations: { type: 'array', items: { type: 'string' } },
          experienceYears: { type: 'integer', minimum: 0 },
          primaryClub: { type: 'string' },
          certificatesCount: { type: 'integer' },
          athletesTrained: { type: 'integer' },
          competitionsJudged: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'pending', 'suspended', 'inactive'] }
        }
      },
      Club: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          foundedYear: { type: 'integer' },
          location: { type: 'object' },
          contactInfo: { type: 'object' },
          ownerEmail: { type: 'string', format: 'email' },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          membersCount: { type: 'integer' },
          facilities: { type: 'array', items: { type: 'string' } },
          achievements: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Competition: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          level: { type: 'string' },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled']
          },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          registrationDeadline: { type: 'string', format: 'date-time' },
          location: { type: 'object' },
          categories: { type: 'array', items: { type: 'object' } },
          registrationFee: { type: 'number' },
          maxParticipants: { type: 'integer' },
          currentParticipants: { type: 'integer' },
          organizer: { type: 'string' },
          rules: { type: 'object' },
          prizes: { type: 'array', items: { type: 'object' } }
        }
      },
      News: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          slug: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          featuredImage: { type: 'string', format: 'uri' },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived']
          },
          featured: { type: 'boolean' },
          pinned: { type: 'boolean' },
          publishedAt: { type: 'string', format: 'date-time' },
          authorEmail: { type: 'string', format: 'email' },
          seo: { type: 'object' },
          viewCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          error: { type: 'string', nullable: true },
          message: { type: 'string' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object', nullable: true }
        }
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1 },
          total: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 0 }
        }
      },
      AdminLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          adminEmail: { type: 'string', format: 'email' },
          action: { type: 'string' },
          targetType: { type: 'string' },
          targetId: { type: 'string' },
          details: { type: 'object' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    },
    responses: {
      '200': {
        description: 'Успішний запит',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiResponse' }
          }
        }
      },
      '400': {
        description: 'Помилка валідації або неправильний запит',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      },
      '401': {
        description: 'Не авторизовано - потрібен JWT токен',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      },
      '403': {
        description: 'Доступ заборонено - недостатньо прав',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      },
      '404': {
        description: 'Ресурс не знайдено',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      },
      '429': {
        description: 'Перевищено ліміт запитів',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      },
      '500': {
        description: 'Внутрішня помилка сервера',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' }
          }
        }
      }
    },
    parameters: {
      page: {
        name: 'page',
        in: 'query',
        description: 'Номер сторінки (починаючи з 1)',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      limit: {
        name: 'limit',
        in: 'query',
        description: 'Кількість елементів на сторінці',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50
        }
      },
      search: {
        name: 'search',
        in: 'query',
        description: 'Пошуковий запит',
        schema: {
          type: 'string'
        }
      },
      status: {
        name: 'status',
        in: 'query',
        description: 'Фільтр за статусом',
        schema: {
          type: 'string'
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Автентифікація та авторизація користувачів'
    },
    {
      name: 'Athletes',
      description: 'Управління спортсменами'
    },
    {
      name: 'Coaches',
      description: 'Управління тренерами та суддями'
    },
    {
      name: 'Clubs',
      description: 'Управління спортивними клубами'
    },
    {
      name: 'Competitions',
      description: 'Управління змаганнями'
    },
    {
      name: 'News',
      description: 'Новини та оголошення'
    },
    {
      name: 'Admin',
      description: 'Адміністративні функції (тільки для адміністраторів)'
    },
    {
      name: 'System',
      description: 'Системні функції та моніторинг'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/**/*.ts',
    './src/lib/swagger-schemas.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
