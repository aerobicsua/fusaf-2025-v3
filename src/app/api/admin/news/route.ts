import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// Перевірка прав адміністратора
async function checkAdminPermissions(request: NextRequest) {
  // TODO: В реальному проекті тут була б перевірка JWT токена
  return true;
}

// GET - отримати список всіх новин для адміністратора
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено. Потрібні права адміністратора.'
      }, { status: 403 });
    }

    const url = new URL(request.url);

    // Параметри фільтрації
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const search = url.searchParams.get('search');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('📰 Admin GET /api/admin/news з фільтрами:', {
      status, category, author, search, date_from, date_to, page, limit
    });

    // Спочатку створимо таблицю, якщо вона не існує
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        featured_image TEXT,
        gallery JSON,

        category VARCHAR(100) DEFAULT 'general',
        tags JSON,

        author_id VARCHAR(36),
        author_name VARCHAR(255),
        author_email VARCHAR(255),

        status ENUM('draft', 'published', 'archived', 'scheduled') DEFAULT 'draft',
        publish_date TIMESTAMP NULL,
        scheduled_date TIMESTAMP NULL,

        meta_title VARCHAR(500),
        meta_description TEXT,
        meta_keywords TEXT,

        views_count INT DEFAULT 0,
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,

        is_featured BOOLEAN DEFAULT FALSE,
        is_pinned BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_publish_date (publish_date),
        INDEX idx_author (author_id),
        INDEX idx_featured (is_featured),
        INDEX idx_slug (slug)
      )
    `);

    // Базовий запит для новин
    let query = `
      SELECT
        id, title, slug, excerpt, content, featured_image, gallery,
        category, tags, author_id, author_name, author_email,
        status, publish_date, scheduled_date,
        meta_title, meta_description, meta_keywords,
        views_count, likes_count, comments_count,
        is_featured, is_pinned,
        created_at, updated_at
      FROM news
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM news WHERE 1=1`;
    const queryParams: any[] = [];
    const countParams: any[] = [];

    // Додаємо фільтри
    if (status) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (category) {
      query += ` AND category = ?`;
      countQuery += ` AND category = ?`;
      queryParams.push(category);
      countParams.push(category);
    }

    if (author) {
      query += ` AND (author_name LIKE ? OR author_email LIKE ?)`;
      countQuery += ` AND (author_name LIKE ? OR author_email LIKE ?)`;
      queryParams.push(`%${author}%`, `%${author}%`);
      countParams.push(`%${author}%`, `%${author}%`);
    }

    if (search) {
      query += ` AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)`;
      countQuery += ` AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (date_from) {
      query += ` AND DATE(created_at) >= ?`;
      countQuery += ` AND DATE(created_at) >= ?`;
      queryParams.push(date_from);
      countParams.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(created_at) <= ?`;
      countQuery += ` AND DATE(created_at) <= ?`;
      queryParams.push(date_to);
      countParams.push(date_to);
    }

    // Сортування та пагінація
    query += ` ORDER BY is_pinned DESC, created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('📊 Виконуємо MySQL запит для новин');

    // Виконуємо запити
    const [newsItems, countResult] = await Promise.all([
      executeQuery<any>(query, queryParams),
      executeQuery<any>(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;

    console.log(`✅ Знайдено ${newsItems.length} новин з ${total} загалом`);

    // Обробляємо дані новин для адміна
    const processedNews = newsItems.map(news => {
      // Парсимо JSON поля безпечно
      let tags: string[] = [];
      let gallery: string[] = [];

      try {
        tags = typeof news.tags === 'string' ? JSON.parse(news.tags) : news.tags || [];
      } catch (e) {
        tags = [];
      }

      try {
        gallery = typeof news.gallery === 'string' ? JSON.parse(news.gallery) : news.gallery || [];
      } catch (e) {
        gallery = [];
      }

      return {
        id: news.id,
        title: news.title,
        slug: news.slug,
        excerpt: news.excerpt,
        content: news.content,
        featuredImage: news.featured_image,
        gallery: gallery,

        category: news.category,
        tags: tags,

        authorId: news.author_id,
        authorName: news.author_name,
        authorEmail: news.author_email,

        status: news.status,
        publishDate: news.publish_date,
        scheduledDate: news.scheduled_date,

        metaTitle: news.meta_title,
        metaDescription: news.meta_description,
        metaKeywords: news.meta_keywords,

        viewsCount: news.views_count,
        likesCount: news.likes_count,
        commentsCount: news.comments_count,

        isFeatured: news.is_featured,
        isPinned: news.is_pinned,

        createdAt: news.created_at,
        updatedAt: news.updated_at
      };
    });

    // Статистика новин
    const stats = await executeQuery<any>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured,
        SUM(views_count) as total_views,
        AVG(views_count) as avg_views
      FROM news
    `);

    const categoryStats = await executeQuery<any>(`
      SELECT category, COUNT(*) as count
      FROM news
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    const authorStats = await executeQuery<any>(`
      SELECT author_name, COUNT(*) as count
      FROM news
      WHERE author_name IS NOT NULL AND author_name != ''
      GROUP BY author_name
      ORDER BY count DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      news: processedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        ...stats[0],
        byCategory: categoryStats.reduce((acc: any, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {}),
        byAuthor: authorStats.reduce((acc: any, item) => {
          acc[item.author_name] = item.count;
          return acc;
        }, {})
      },
      filters: { status, category, author, search, date_from, date_to }
    });

  } catch (error) {
    console.error('❌ Помилка Admin GET /api/admin/news:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка завантаження новин',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// POST - створити нову новину
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const newsData = await request.json();

    console.log('📰 Admin POST /api/admin/news - створення новини');

    // Валідація обов'язкових полів
    if (!newsData.title || !newsData.content) {
      return NextResponse.json({
        success: false,
        error: 'Заголовок та контент обов\'язкові'
      }, { status: 400 });
    }

    // Генеруємо slug з заголовка
    const generateSlug = (title: string) => {
      const transliterationMap: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
        'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
        'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya'
      };

      return title
        .toLowerCase()
        .split('')
        .map(char => transliterationMap[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const newsId = uuidv4();
    const slug = newsData.slug || generateSlug(newsData.title);

    // Перевіряємо унікальність slug
    const existingNews = await executeQuery<any>(`
      SELECT id FROM news WHERE slug = ?
    `, [slug]);

    const finalSlug = existingNews.length > 0 ? `${slug}-${Date.now()}` : slug;

    // Підготовка дати публікації
    let publishDate = null;
    if (newsData.status === 'published') {
      publishDate = new Date().toISOString();
    } else if (newsData.status === 'scheduled' && newsData.scheduledDate) {
      publishDate = newsData.scheduledDate;
    }

    // Створюємо новину
    await executeQuery(`
      INSERT INTO news (
        id, title, slug, excerpt, content, featured_image, gallery,
        category, tags, author_id, author_name, author_email,
        status, publish_date, scheduled_date,
        meta_title, meta_description, meta_keywords,
        is_featured, is_pinned,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      newsId,
      newsData.title,
      finalSlug,
      newsData.excerpt || '',
      newsData.content,
      newsData.featuredImage || '',
      JSON.stringify(newsData.gallery || []),
      newsData.category || 'general',
      JSON.stringify(newsData.tags || []),
      newsData.authorId || null,
      newsData.authorName || '',
      newsData.authorEmail || '',
      newsData.status || 'draft',
      publishDate,
      newsData.scheduledDate || null,
      newsData.metaTitle || newsData.title,
      newsData.metaDescription || newsData.excerpt || '',
      newsData.metaKeywords || '',
      newsData.isFeatured || false,
      newsData.isPinned || false
    ]);

    console.log('✅ Новину створено адміністратором:', newsData.title);

    return NextResponse.json({
      success: true,
      message: 'Новину успішно створено',
      newsId: newsId,
      slug: finalSlug
    });

  } catch (error) {
    console.error('❌ Помилка Admin POST /api/admin/news:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка створення новини',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// PUT - оновити новину
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { newsId, updates } = await request.json();

    if (!newsId) {
      return NextResponse.json({
        success: false,
        error: 'ID новини обов\'язковий'
      }, { status: 400 });
    }

    console.log('📰 Admin PUT /api/admin/news для:', newsId);

    // Підготовка оновлень
    const updateFields = [];
    const updateValues = [];

    // Дозволені поля для оновлення
    const allowedFields = [
      'title', 'slug', 'excerpt', 'content', 'featured_image', 'category',
      'author_id', 'author_name', 'author_email', 'status', 'publish_date',
      'scheduled_date', 'meta_title', 'meta_description', 'meta_keywords',
      'is_featured', 'is_pinned'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    // JSON поля
    if (updates.tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(updates.tags));
    }

    if (updates.gallery !== undefined) {
      updateFields.push('gallery = ?');
      updateValues.push(JSON.stringify(updates.gallery));
    }

    // Логіка публікації
    if (updates.status === 'published' && !updates.publish_date) {
      updateFields.push('publish_date = NOW()');
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Немає даних для оновлення'
      }, { status: 400 });
    }

    // Додаємо updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(newsId);

    const updateQuery = `
      UPDATE news
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    console.log('✅ Новину оновлено адміністратором');

    return NextResponse.json({
      success: true,
      message: 'Новину успішно оновлено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin PUT /api/admin/news:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка оновлення новини',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}

// DELETE - видалити новину
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminPermissions(request))) {
      return NextResponse.json({
        success: false,
        error: 'Доступ заборонено'
      }, { status: 403 });
    }

    const { newsId } = await request.json();

    if (!newsId) {
      return NextResponse.json({
        success: false,
        error: 'ID новини обов\'язковий'
      }, { status: 400 });
    }

    console.log('📰 Admin DELETE /api/admin/news для:', newsId);

    // Перевіряємо чи існує новина
    const newsItems = await executeQuery<any>(`
      SELECT id, title FROM news WHERE id = ?
    `, [newsId]);

    if (newsItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Новину не знайдено'
      }, { status: 404 });
    }

    const news = newsItems[0];

    // Видаляємо новину
    await executeQuery(`DELETE FROM news WHERE id = ?`, [newsId]);

    console.log('✅ Новину видалено адміністратором:', news.title);

    return NextResponse.json({
      success: true,
      message: 'Новину успішно видалено'
    });

  } catch (error) {
    console.error('❌ Помилка Admin DELETE /api/admin/news:', error);

    return NextResponse.json({
      success: false,
      error: 'Помилка видалення новини',
      details: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 });
  }
}
