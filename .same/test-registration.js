#!/usr/bin/env node

// Скрипт для тестування реєстрації клубів через API
const fs = require('fs');
const path = require('path');

// Тестові дані
const testClubs = [
  {
    firstName: "Олена",
    lastName: "Петренко",
    middleName: "Василівна",
    position: "Директор",
    email: "olena.petrenko@gracia.kiev.ua",
    phone: "+380501234567",
    password: "gracia2025",
    region: "м. Київ",
    city: "Київ",
    clubName: "Спортивний клуб 'Грація'",
    clubType: "club",
    zipCode: "01001",
    clubRegion: "м. Київ",
    clubCity: "Київ",
    clubAddress: "вул. Хрещатик, 25, оф. 301",
    clubDescription: "Провідний клуб спортивної аеробіки в Україні з 15-річною історією.",
    experience: "15 років у сфері спортивної аеробіки. Підготувала понад 200 спортсменів.",
    legalStatus: "ТОВ",
    website: "https://gracia.kiev.ua"
  },
  {
    firstName: "Андрій",
    lastName: "Ковальчук",
    middleName: "Олександрович",
    position: "Президент",
    email: "kovalchuk@olimpik.lviv.ua",
    phone: "+380671234567",
    password: "olimpik2025",
    region: "Львівська область",
    city: "Львів",
    clubName: "Фітнес-клуб 'Олімпік'",
    clubType: "club",
    zipCode: "79000",
    clubRegion: "Львівська область",
    clubCity: "Львів",
    clubAddress: "вул. Городоцька, 67",
    clubDescription: "Сучасний фітнес-клуб з акцентом на спортивну аеробіку та фітнес.",
    experience: "10 років досвіду в управлінні спортивними закладами.",
    legalStatus: "ПП",
    website: "https://olimpik.lviv.ua"
  }
];

// Функція для створення тестового PDF файлу
function createTestDocument() {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000074 00000 n
0000000120 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
309
%%EOF`;

  return Buffer.from(content);
}

async function testClubRegistration(clubData) {
  try {
    console.log(`📋 Тестуємо реєстрацію клубу: ${clubData.clubName}`);

    // Створюємо FormData
    const FormData = require('form-data');
    const form = new FormData();

    // Додаємо всі поля
    Object.keys(clubData).forEach(key => {
      form.append(key, clubData[key]);
    });

    // Додаємо тестовий документ
    const testDoc = createTestDocument();
    form.append('registrationDocuments', testDoc, {
      filename: 'test-registration.pdf',
      contentType: 'application/pdf'
    });

    // Відправляємо запрос
    const response = await fetch('http://localhost:3000/api/club-owner-registration', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.text();

    console.log(`📊 Статус: ${response.status}`);

    if (response.ok) {
      try {
        const jsonResult = JSON.parse(result);
        console.log(`✅ Успіх: ${jsonResult.message}`);
        console.log(`👤 Email: ${jsonResult.data?.email}`);
        console.log(`🔑 Пароль: ${jsonResult.data?.password}`);
        return { success: true, data: jsonResult };
      } catch (e) {
        console.log(`✅ Відповідь отримана (не JSON):`, result.substring(0, 200));
        return { success: true, text: result };
      }
    } else {
      console.log(`❌ Помилка: ${result.substring(0, 200)}`);
      return { success: false, error: result };
    }

  } catch (error) {
    console.error(`❌ Виключення:`, error.message);
    return { success: false, error: error.message };
  }
}

async function checkClubRequests() {
  try {
    console.log('\n📋 Перевіряємо список заявок...');
    const response = await fetch('http://localhost:3000/api/clubs/requests');
    const result = await response.json();

    console.log(`📊 Всього заявок: ${result.requests?.length || 0}`);
    console.log(`📈 Статистика:`, result.stats);

    if (result.requests?.length > 0) {
      result.requests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.user.name} - ${req.club.name} (${req.status})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Помилка перевірки заявок:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Початок тестування системи реєстрації клубів\n');

  // Перевіряємо поточний стан
  await checkClubRequests();

  // Тестуємо реєстрацію клубів
  for (let i = 0; i < testClubs.length; i++) {
    console.log(`\n--- Тест ${i + 1}/${testClubs.length} ---`);
    const result = await testClubRegistration(testClubs[i]);

    if (result.success) {
      console.log('✅ Тест пройшов успішно');
    } else {
      console.log('❌ Тест не пройшов');
    }

    // Пауза між запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Перевіряємо фінальний стан
  console.log('\n📋 Фінальний стан:');
  await checkClubRequests();

  console.log('\n🏁 Тестування завершено');
}

// Запускаємо тест якщо скрипт викликано напряму
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testClubRegistration, checkClubRequests };
