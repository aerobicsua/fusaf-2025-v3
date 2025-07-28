import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = process.env.APP_URL || 'http://localhost:3000';

// Шаблон підтвердження реєстрації
export function CompetitionRegistrationEmail({
  userName,
  competitionTitle,
  competitionDate,
  competitionLocation,
  requiresPayment,
  entryFee
}: {
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  requiresPayment: boolean;
  entryFee?: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>Підтвердження реєстрації на змагання {competitionTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>ФУСАФ</Text>
            <Text style={subtitle}>Федерація України зі Спортивної Аеробіки і Фітнесу</Text>
          </Section>

          <Heading style={h1}>Реєстрація підтверджена! 🎉</Heading>

          <Text style={text}>
            Вітаємо, <strong>{userName}</strong>!
          </Text>

          <Text style={text}>
            Ваша реєстрація на змагання <strong>"{competitionTitle}"</strong> була успішно створена.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Деталі змагання:</Text>
            <Text style={infoText}><strong>Назва:</strong> {competitionTitle}</Text>
            <Text style={infoText}><strong>Дата:</strong> {new Date(competitionDate).toLocaleDateString('uk-UA')}</Text>
            <Text style={infoText}><strong>Місце:</strong> {competitionLocation}</Text>
            {requiresPayment && entryFee && (
              <Text style={infoText}><strong>Вартість участі:</strong> {entryFee} грн</Text>
            )}
          </Section>

          {requiresPayment ? (
            <>
              <Text style={warningText}>
                ⚠️ <strong>Увага!</strong> Для підтвердження участі необхідно сплатити {entryFee} грн.
              </Text>

              <Section style={buttonContainer}>
                <Button style={button} href={`${baseUrl}/competitions`}>
                  Сплатити зараз
                </Button>
              </Section>
            </>
          ) : (
            <Text style={successText}>
              ✅ Ваша участь підтверджена! Оплата не потрібна.
            </Text>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            З найкращими побажаннями,<br />
            Команда ФУСАФ<br />
            <Link href="mailto:info@fusaf.org.ua" style={link}>info@fusaf.org.ua</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Шаблон підтвердження платежу
export function PaymentConfirmationEmail({
  userName,
  competitionTitle,
  amount,
  orderId
}: {
  userName: string;
  competitionTitle: string;
  amount: number;
  orderId: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Платіж підтверджено для змагання {competitionTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>ФУСАФ</Text>
            <Text style={subtitle}>Федерація України зі Спортивної Аеробіки і Фітнесу</Text>
          </Section>

          <Heading style={h1}>Платіж підтверджено! 💳</Heading>

          <Text style={text}>
            Вітаємо, <strong>{userName}</strong>!
          </Text>

          <Text style={text}>
            Ваш платіж за участь у змаганні <strong>"{competitionTitle}"</strong> був успішно обробений.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Деталі платежу:</Text>
            <Text style={infoText}><strong>Сума:</strong> {amount} грн</Text>
            <Text style={infoText}><strong>Номер замовлення:</strong> {orderId}</Text>
            <Text style={infoText}><strong>Статус:</strong> Оплачено ✅</Text>
          </Section>

          <Text style={successText}>
            🏆 Ваша участь у змаганні офіційно підтверджена!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${baseUrl}/dashboard/athlete`}>
              Переглянути мої змагання
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            З найкращими побажаннями,<br />
            Команда ФУСАФ<br />
            <Link href="mailto:info@fusaf.org.ua" style={link}>info@fusaf.org.ua</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Шаблон нагадування про змагання
export function CompetitionReminderEmail({
  userName,
  competitionTitle,
  competitionDate,
  competitionLocation,
  competitionTime
}: {
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  competitionTime: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Нагадування про змагання {competitionTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={title}>ФУСАФ</Text>
            <Text style={subtitle}>Федерація України зі Спортивної Аеробіки і Фітнесу</Text>
          </Section>

          <Heading style={h1}>Нагадування про змагання! ⏰</Heading>

          <Text style={text}>
            Вітаємо, <strong>{userName}</strong>!
          </Text>

          <Text style={text}>
            Нагадуємо, що завтра відбудуються змагання <strong>"{competitionTitle}"</strong>,
            на які ви зареєстровані.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Не забудьте:</Text>
            <Text style={infoText}><strong>Дата:</strong> {new Date(competitionDate).toLocaleDateString('uk-UA')}</Text>
            <Text style={infoText}><strong>Час:</strong> {competitionTime}</Text>
            <Text style={infoText}><strong>Місце:</strong> {competitionLocation}</Text>
          </Section>

          <Text style={warningText}>
            📋 <strong>Не забудьте взяти з собою:</strong>
          </Text>
          <Text style={listText}>• Документ, що посвідчує особу</Text>
          <Text style={listText}>• Медичну довідку</Text>
          <Text style={listText}>• Спортивну форму</Text>
          <Text style={listText}>• Спортивну страховку</Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${baseUrl}/dashboard/athlete`}>
              Переглянути деталі
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Удачі на змаганнях!<br />
            Команда ФУСАФ<br />
            <Link href="mailto:info@fusaf.org.ua" style={link}>info@fusaf.org.ua</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Стилі
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoContainer = {
  textAlign: 'center' as const,
  padding: '20px 0',
  borderBottom: '1px solid #eaeaea',
  marginBottom: '20px',
};

const title = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#be185d',
  margin: '0',
  lineHeight: '1.3',
};

const subtitle = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '5px 0 0 0',
  lineHeight: '1.4',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  margin: '0 0 12px 0',
};

const infoText = {
  fontSize: '14px',
  color: '#666',
  margin: '4px 0',
  lineHeight: '1.4',
};

const successText = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
};

const warningText = {
  color: '#f59e0b',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fffbeb',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
};

const listText = {
  fontSize: '14px',
  color: '#666',
  margin: '4px 0',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#be185d',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.4',
  textAlign: 'center' as const,
};

const link = {
  color: '#be185d',
  textDecoration: 'underline',
};
