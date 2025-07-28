/**
 * Additional Swagger Schemas for FUSAF API
 * These schemas complement the main OpenAPI specification
 */

/**
 * @swagger
 *
 * paths:
 *   /api/auth/login:
 *     post:
 *       summary: Вхід користувача
 *       description: Аутентифікація користувача за email та паролем
 *       tags: [Authentication]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@fusaf.org.ua"
 *                 password:
 *                   type: string
 *                   minLength: 6
 *                   example: "password123"
 *       responses:
 *         200:
 *           description: Успішна аутентифікація
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       token:
 *                         type: string
 *                         description: JWT токен
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                   message:
 *                     type: string
 *                     example: "Login successful"
 *         400:
 *           $ref: '#/components/responses/400'
 *         401:
 *           description: Неправильні облікові дані
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiError'
 *
 *   /api/auth/register:
 *     post:
 *       summary: Реєстрація користувача
 *       description: Створення нового акаунту користувача
 *       tags: [Authentication]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *                 - firstName
 *                 - lastName
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 password:
 *                   type: string
 *                   minLength: 6
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 phone:
 *                   type: string
 *       responses:
 *         201:
 *           description: Користувача успішно створено
 *         400:
 *           $ref: '#/components/responses/400'
 *         409:
 *           description: Користувач з таким email вже існує
 *
 *   /api/auth/profile:
 *     get:
 *       summary: Профіль користувача
 *       description: Отримання профілю поточного користувача
 *       tags: [Authentication]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Профіль користувача
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     $ref: '#/components/schemas/User'
 *         401:
 *           $ref: '#/components/responses/401'
 *
 *   /api/athletes:
 *     get:
 *       summary: Список спортсменів
 *       description: Отримання списку спортсменів з фільтрацією та пагінацією
 *       tags: [Athletes]
 *       parameters:
 *         - $ref: '#/components/parameters/page'
 *         - $ref: '#/components/parameters/limit'
 *         - $ref: '#/components/parameters/search'
 *         - name: category
 *           in: query
 *           description: Фільтр за категорією
 *           schema:
 *             type: string
 *         - name: club
 *           in: query
 *           description: Фільтр за клубом
 *           schema:
 *             type: string
 *         - name: region
 *           in: query
 *           description: Фільтр за регіоном
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Список спортсменів
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       athletes:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Athlete'
 *                       pagination:
 *                         $ref: '#/components/schemas/PaginationResponse'
 *                       statistics:
 *                         type: object
 *
 *     post:
 *       summary: Створити спортсмена
 *       description: Реєстрація нового спортсмена
 *       tags: [Athletes]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - email
 *                 - dateOfBirth
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 middleName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 phone:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                 gender:
 *                   type: string
 *                   enum: [male, female]
 *                 category:
 *                   type: string
 *                 club:
 *                   type: string
 *       responses:
 *         201:
 *           description: Спортсмена створено
 *         400:
 *           $ref: '#/components/responses/400'
 *         401:
 *           $ref: '#/components/responses/401'
 *
 *   /api/admin/coaches:
 *     get:
 *       summary: Список тренерів/суддів
 *       description: Отримання списку тренерів та суддів (тільки для адміністраторів)
 *       tags: [Coaches, Admin]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/page'
 *         - $ref: '#/components/parameters/limit'
 *         - $ref: '#/components/parameters/search'
 *         - $ref: '#/components/parameters/status'
 *         - name: qualification
 *           in: query
 *           description: Фільтр за кваліфікацією
 *           schema:
 *             type: string
 *         - name: specialization
 *           in: query
 *           description: Фільтр за спеціалізацією
 *           schema:
 *             type: string
 *         - name: license_status
 *           in: query
 *           description: Статус ліцензії
 *           schema:
 *             type: string
 *             enum: [active, expired, suspended, revoked]
 *       responses:
 *         200:
 *           description: Список тренерів/суддів
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   coaches:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Coach'
 *                   pagination:
 *                     $ref: '#/components/schemas/PaginationResponse'
 *                   statistics:
 *                     type: object
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *     post:
 *       summary: Створити тренера/суддю
 *       description: Реєстрація нового тренера або судді
 *       tags: [Coaches, Admin]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - email
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 middleName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 coachType:
 *                   type: string
 *                   enum: [coach, judge, both]
 *                 qualificationLevel:
 *                   type: string
 *                 licenseNumber:
 *                   type: string
 *                 specializations:
 *                   type: array
 *                   items:
 *                     type: string
 *       responses:
 *         201:
 *           description: Тренера/суддю створено
 *         400:
 *           $ref: '#/components/responses/400'
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *   /api/admin/logs:
 *     get:
 *       summary: Логи дій адміністраторів
 *       description: Отримання журналу дій адміністраторів для аудиту
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/page'
 *         - $ref: '#/components/parameters/limit'
 *         - name: admin_email
 *           in: query
 *           description: Фільтр за email адміністратора
 *           schema:
 *             type: string
 *         - name: action
 *           in: query
 *           description: Тип дії
 *           schema:
 *             type: string
 *         - name: target_type
 *           in: query
 *           description: Тип об'єкта дії
 *           schema:
 *             type: string
 *         - name: date_from
 *           in: query
 *           description: Дата початку періоду
 *           schema:
 *             type: string
 *             format: date
 *         - name: date_to
 *           in: query
 *           description: Дата закінчення періоду
 *           schema:
 *             type: string
 *             format: date
 *       responses:
 *         200:
 *           description: Список логів
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   logs:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/AdminLog'
 *                   pagination:
 *                     $ref: '#/components/schemas/PaginationResponse'
 *                   statistics:
 *                     type: object
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *   /api/admin/export:
 *     get:
 *       summary: Експорт даних
 *       description: Експорт даних системи в різних форматах
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: type
 *           in: query
 *           required: true
 *           description: Тип даних для експорту
 *           schema:
 *             type: string
 *             enum: [users, athletes, coaches, clubs, competitions, news, logs]
 *         - name: format
 *           in: query
 *           description: Формат експорту
 *           schema:
 *             type: string
 *             enum: [csv, json]
 *             default: csv
 *         - name: filters
 *           in: query
 *           description: JSON об'єкт з фільтрами
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Експортовані дані
 *           content:
 *             text/csv:
 *               schema:
 *                 type: string
 *             application/json:
 *               schema:
 *                 type: object
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *   /api/admin/notifications:
 *     get:
 *       summary: Історія сповіщень
 *       description: Отримання історії відправлених email сповіщень
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/page'
 *         - $ref: '#/components/parameters/limit'
 *         - name: type
 *           in: query
 *           description: Тип сповіщення
 *           schema:
 *             type: string
 *         - name: status
 *           in: query
 *           description: Статус відправки
 *           schema:
 *             type: string
 *             enum: [sent, failed, pending]
 *         - name: recipient
 *           in: query
 *           description: Email отримувача
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Історія сповіщень
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *     post:
 *       summary: Відправити сповіщення
 *       description: Відправка email сповіщень користувачам
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - type
 *                 - recipients
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [announcement, competition_update, system_notification, newsletter]
 *                 recipients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         format: email
 *                       name:
 *                         type: string
 *                 template:
 *                   type: string
 *                 customSubject:
 *                   type: string
 *                 customMessage:
 *                   type: string
 *                 variables:
 *                   type: object
 *       responses:
 *         200:
 *           description: Сповіщення відправлено
 *         400:
 *           $ref: '#/components/responses/400'
 *         401:
 *           $ref: '#/components/responses/401'
 *         403:
 *           $ref: '#/components/responses/403'
 *
 *   /api/health:
 *     get:
 *       summary: Перевірка здоров'я системи
 *       description: Комплексна перевірка стану всіх компонентів системи
 *       tags: [System]
 *       responses:
 *         200:
 *           description: Система здорова
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   service:
 *                     type: string
 *                     example: "FUSAF"
 *                   version:
 *                     type: string
 *                   environment:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [healthy, warning, degraded, unhealthy]
 *                   uptime:
 *                     type: number
 *                   checks:
 *                     type: object
 *                     properties:
 *                       database:
 *                         type: object
 *                       tables:
 *                         type: object
 *                       system:
 *                         type: object
 *                       environment:
 *                         type: object
 *         503:
 *           description: Система нездорова
 *
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email користувача
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Пароль користувача
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT токен для авторизації
 *             user:
 *               $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *
 *     AthleteRegistration:
 *       type: object
 *       required:
 *         - competitionId
 *         - category
 *       properties:
 *         competitionId:
 *           type: string
 *           format: uuid
 *         category:
 *           type: string
 *         notes:
 *           type: string
 *
 *     Certificate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         coachId:
 *           type: string
 *           format: uuid
 *         certificateName:
 *           type: string
 *         issuingOrganization:
 *           type: string
 *         certificateType:
 *           type: string
 *           enum: [coaching, judging, first_aid, education, other]
 *         issueDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 *         certificateNumber:
 *           type: string
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         fileUrl:
 *           type: string
 *           format: uri
 *         isExpired:
 *           type: boolean
 *         daysUntilExpiry:
 *           type: integer
 */

export {};
