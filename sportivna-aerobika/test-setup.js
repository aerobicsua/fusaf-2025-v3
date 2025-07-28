// Скрипт для налаштування тестових даних
// Запустити в консолі браузера після переходу на сайт

function setupTestData() {
  console.log('🏗️ Налаштування тестових даних...');

  // 1. Створюємо тестовий клуб
  const testClub = {
    id: `club-test-${Date.now()}`,
    name: 'Тестовий Спортивний Клуб',
    type: 'club',
    address: 'вул. Тестова, 15',
    city: 'Київ',
    region: 'м. Київ',
    zipCode: '01001',
    description: 'Тестовий клуб для перевірки функціональності експорту та сповіщень',
    legalStatus: 'ТОВ',
    website: 'https://test-club.kiev.ua',
    owner: {
      name: 'Тестовий Керівник',
      email: 'test-manager@example.com',
      phone: '+380501234567'
    },
    approvedAt: new Date().toISOString(),
    status: 'active'
  };

  // Зберігаємо клуб
  const existingClubs = JSON.parse(localStorage.getItem('approvedClubs') || '[]');
  existingClubs.push(testClub);
  localStorage.setItem('approvedClubs', JSON.stringify(existingClubs));

  // 2. Створюємо тестового тренера
  const testTrainer = {
    id: `trainer-test-${Date.now()}`,
    name: 'Тестовий Тренер',
    email: 'test-trainer@example.com',
    phone: '+380501234568',
    region: 'м. Київ',
    city: 'Київ',
    clubId: testClub.id,
    clubName: testClub.name,
    roles: ['coach', 'judge'],
    judgeInfo: {
      category: 'national',
      license: 'NAT123456'
    },
    education: 'Тестовий університет, спеціальність фізичне виховання',
    specialization: 'aerobics',
    experience: 'Більше 5 років досвіду тренерської роботи',
    certificates: 'Сертифікат тренера з аеробіки, Сертифікат судді',
    achievements: 'Переможець регіональних змагань',
    approvedAt: new Date().toISOString(),
    approvedBy: 'Тестовий Керівник',
    status: 'active'
  };

  // Зберігаємо тренера
  const existingTrainers = JSON.parse(localStorage.getItem('clubTrainers') || '[]');
  existingTrainers.push(testTrainer);
  localStorage.setItem('clubTrainers', JSON.stringify(existingTrainers));

  // 3. Створюємо тестового спортсмена
  const testAthlete = {
    id: `athlete-test-${Date.now()}`,
    name: 'Тестовий Спортсмен',
    email: 'test-athlete@example.com',
    phone: '+380501234569',
    city: 'Київ',
    club: testClub.id,
    registeredAt: new Date().toISOString(),
    status: 'active'
  };

  // Зберігаємо спортсмена
  const existingAthletes = JSON.parse(localStorage.getItem('approvedAthletes') || '[]');
  existingAthletes.push(testAthlete);
  localStorage.setItem('approvedAthletes', JSON.stringify(existingAthletes));

  // 4. Створюємо тестову заявку тренера
  const testApplication = {
    id: `application-test-${Date.now()}`,
    name: 'Новий Тестовий Тренер',
    email: 'new-trainer@example.com',
    phone: '+380501234570',
    region: 'м. Київ',
    city: 'Київ',
    preferredClub: {
      id: testClub.id,
      name: testClub.name
    },
    applicationMessage: 'Хочу приєднатися до вашого клубу для тестування функціональності',
    roles: ['coach'],
    education: 'Тестова освіта',
    specialization: 'fitness',
    experience: 'Тестовий досвід',
    certificates: 'Тестові сертифікати',
    achievements: 'Тестові досягнення',
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };

  // Зберігаємо заявку
  const existingApplications = JSON.parse(localStorage.getItem('coachJudgeApplications') || '[]');
  existingApplications.push(testApplication);
  localStorage.setItem('coachJudgeApplications', JSON.stringify(existingApplications));

  console.log('✅ Тестові дані створено!');
  console.log('📊 Клуб:', testClub.name);
  console.log('👨‍🏫 Тренер:', testTrainer.name);
  console.log('🏃‍♂️ Спортсмен:', testAthlete.name);
  console.log('📋 Заявка від:', testApplication.name);
  console.log('');
  console.log('🎯 Для тестування:');
  console.log('1. Перейдіть на /club-manager/dashboard (увійдіть як test-manager@example.com)');
  console.log('2. Перевірте експорт статистики клубу');
  console.log('3. Перевірте сповіщення про нові заявки');
  console.log('4. Відкрийте публічну сторінку клубу /club/' + testClub.id);

  // Перезавантажуємо сторінку для оновлення лічильників
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Запускаємо налаштування
setupTestData();
