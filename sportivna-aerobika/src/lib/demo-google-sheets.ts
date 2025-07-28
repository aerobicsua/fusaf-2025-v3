// Демонстраційний сервіс для експорту в Google Sheets
// Використовується для показу функціональності без реального Google API

export interface DemoExportResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  totalRows: number;
  exportedAt: string;
  message: string;
}

export class DemoGoogleSheetsService {

  // Демонстраційний експорт даних
  static async exportData(config: any): Promise<DemoExportResult> {
    // Симуляція затримки для реалістичності
    await new Promise(resolve => setTimeout(resolve, 2000));

    const demoData = this.getDemoData(config.type);
    const spreadsheetId = this.generateDemoSpreadsheetId();
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      totalRows: demoData.rows,
      exportedAt: new Date().toISOString(),
      message: `Демонстраційний експорт даних типу "${config.type}" завершено успішно!`
    };
  }

  // Генерація демонстраційного ID таблиці
  private static generateDemoSpreadsheetId(): string {
    return `1FUSAF_DEMO_${Math.random().toString(36).substr(2, 20)}${Date.now()}`;
  }

  // Демонстраційні дані для різних типів експорту
  private static getDemoData(type: string) {
    const demoDataSets = {
      users: {
        rows: 124,
        description: 'Користувачі системи з ролями та контактною інформацією',
        columns: ['ID', 'Email', 'Повне ім\'я', 'Роль', 'Телефон', 'Дата реєстрації']
      },
      competitions: {
        rows: 15,
        description: 'Змагання з деталями та статистикою реєстрацій',
        columns: ['Назва', 'Дата', 'Місце', 'Організатор', 'Статус', 'Кількість учасників']
      },
      registrations: {
        rows: 287,
        description: 'Реєстрації учасників на змагання',
        columns: ['Учасник', 'Змагання', 'Статус', 'Дата реєстрації', 'Статус оплати']
      },
      clubs: {
        rows: 18,
        description: 'Зареєстровані клуби з контактною інформацією',
        columns: ['Назва клубу', 'Місто', 'Власник', 'Кількість спортсменів', 'Контакти']
      },
      financial: {
        rows: 143,
        description: 'Фінансовий звіт з оплаченими реєстраціями',
        columns: ['Учасник', 'Змагання', 'Сума', 'Дата оплати', 'Статус']
      }
    };

    return demoDataSets[type as keyof typeof demoDataSets] || {
      rows: 0,
      description: 'Невідомий тип даних',
      columns: []
    };
  }

  // Отримання інформації про типи експорту
  static getExportTypes() {
    return [
      {
        type: 'users',
        title: '👥 Користувачі',
        description: 'Всі користувачі системи з ролями та контактами',
        estimatedRows: 124,
        features: [
          '✅ Ролі користувачів (спортсмени, тренери, судді, власники)',
          '✅ Контактна інформація та адреси',
          '✅ Дати реєстрації та активності',
          '✅ Статистика по ролям'
        ]
      },
      {
        type: 'competitions',
        title: '🏆 Змагання',
        description: 'Всі змагання з деталями та статистикою',
        estimatedRows: 15,
        features: [
          '✅ Деталі змагань (дата, час, місце)',
          '✅ Інформація про організаторів',
          '✅ Статуси та категорії змагань',
          '✅ Кількість реєстрацій'
        ]
      },
      {
        type: 'registrations',
        title: '📝 Реєстрації',
        description: 'Реєстрації учасників на змагання',
        estimatedRows: 287,
        features: [
          '✅ Інформація про учасників',
          '✅ Статуси реєстрацій та оплати',
          '✅ Вікові групи та категорії',
          '✅ Примітки та коментарі'
        ]
      },
      {
        type: 'clubs',
        title: '🏢 Клуби',
        description: 'Зареєстровані клуби федерації',
        estimatedRows: 18,
        features: [
          '✅ Контактна інформація клубів',
          '✅ Інформація про власників',
          '✅ Кількість спортсменів',
          '✅ Географічне розташування'
        ]
      },
      {
        type: 'financial',
        title: '💰 Фінансовий звіт',
        description: 'Звіт по всіх платежам та доходам',
        estimatedRows: 143,
        features: [
          '✅ Деталі всіх платежів',
          '✅ Розбивка по змаганнях',
          '✅ Сумарні показники доходу',
          '✅ Статуси транзакцій'
        ]
      }
    ];
  }

  // Генерація демонстраційної превью таблиці
  static generatePreview(type: string) {
    const previews = {
      users: [
        ['ID', 'Email', 'Повне ім\'я', 'Роль', 'Телефон', 'Дата реєстрації'],
        ['1', 'oksana.petrenko@test.fusaf.ua', 'Петренко Оксана', 'Спортсмен', '+380671234567', '15.01.2025'],
        ['2', 'elena.moroz@test.fusaf.ua', 'Мороз Олена', 'Тренер', '+380675678901', '12.01.2025'],
        ['3', 'sergiy.melnyk@test.fusaf.ua', 'Мельник Сергій', 'Власник клубу', '+380678901234', '10.01.2025'],
        ['...', '...', '...', '...', '...', '...'],
        [`Всього ${this.getDemoData('users').rows} користувачів`, '', '', '', '', '']
      ],
      competitions: [
        ['Назва', 'Дата', 'Місце', 'Організатор', 'Статус', 'Реєстрацій'],
        ['Кубок України 2025', '15.03.2025', 'Палац спорту "Україна"', 'СК "Грація"', 'Відкрита реєстрація', '45'],
        ['Чемпіонат Львова', '22.02.2025', 'Спорткомплекс "Львів"', 'Аеробіка Львів', 'Відкрита реєстрація', '32'],
        ['Першість області', '12.04.2025', 'ЦОП Дніпро', 'Фітнес-Динаміка', 'Опубліковано', '28'],
        ['...', '...', '...', '...', '...', '...'],
        [`Всього ${this.getDemoData('competitions').rows} змагань`, '', '', '', '', '']
      ],
      financial: [
        ['Учасник', 'Змагання', 'Сума (грн)', 'Дата оплати', 'Статус'],
        ['Петренко Оксана', 'Кубок України 2025', '500', '16.01.2025', 'Оплачено'],
        ['Коваленко Андрій', 'Чемпіонат Львова', '300', '18.01.2025', 'Оплачено'],
        ['Шевченко Марія', 'Кубок України 2025', '500', '20.01.2025', 'Оплачено'],
        ['...', '...', '...', '...', '...'],
        ['ЗАГАЛЬНИЙ ДОХІД:', '', '28,500 грн', '', '143 платежі']
      ]
    };

    return previews[type as keyof typeof previews] || [
      ['Дані', 'Тип', 'Статус'],
      ['Демонстраційні дані', type, 'Готово до експорту']
    ];
  }
}

export default DemoGoogleSheetsService;
