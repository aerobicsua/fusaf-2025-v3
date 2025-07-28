import { Resend } from 'resend';
import {
  CompetitionRegistrationEmail,
  PaymentConfirmationEmail,
  CompetitionReminderEmail
} from '@/components/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface CompetitionRegistrationData {
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  requiresPayment: boolean;
  entryFee?: number;
}

export interface PaymentConfirmationData {
  userName: string;
  competitionTitle: string;
  amount: number;
  orderId: string;
}

export interface CompetitionReminderData {
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  competitionTime: string;
}

export interface EmailData {
  to: string;
  subject: string;
  template: 'registration-confirmation' | 'payment-confirmation' | 'competition-reminder';
  data: CompetitionRegistrationData | PaymentConfirmationData | CompetitionReminderData;
}

export async function sendEmail({ to, subject, template, data }: EmailData) {
  try {
    let emailComponent: React.ReactElement;

    switch (template) {
      case 'registration-confirmation':
        emailComponent = CompetitionRegistrationEmail(data as CompetitionRegistrationData);
        break;
      case 'payment-confirmation':
        emailComponent = PaymentConfirmationEmail(data as PaymentConfirmationData);
        break;
      case 'competition-reminder':
        emailComponent = CompetitionReminderEmail(data as CompetitionReminderData);
        break;
      default:
        throw new Error(`Unknown email template: ${template}`);
    }

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@fusaf.org.ua',
      to: [to],
      subject,
      react: emailComponent,
    });

    console.log('Email sent successfully:', result);
    return result;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Функції для різних типів email сповіщень
export async function sendRegistrationConfirmation({
  userEmail,
  userName,
  competitionTitle,
  competitionDate,
  competitionLocation,
  requiresPayment,
  entryFee
}: {
  userEmail: string;
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  requiresPayment: boolean;
  entryFee?: number;
}) {
  return sendEmail({
    to: userEmail,
    subject: `Підтвердження реєстрації на змагання "${competitionTitle}"`,
    template: 'registration-confirmation',
    data: {
      userName,
      competitionTitle,
      competitionDate,
      competitionLocation,
      requiresPayment,
      entryFee
    }
  });
}

export async function sendPaymentConfirmation({
  userEmail,
  userName,
  competitionTitle,
  amount,
  orderId
}: {
  userEmail: string;
  userName: string;
  competitionTitle: string;
  amount: number;
  orderId: string;
}) {
  return sendEmail({
    to: userEmail,
    subject: `Платіж підтверджено - "${competitionTitle}"`,
    template: 'payment-confirmation',
    data: {
      userName,
      competitionTitle,
      amount,
      orderId
    }
  });
}

export async function sendCompetitionReminder({
  userEmail,
  userName,
  competitionTitle,
  competitionDate,
  competitionLocation,
  competitionTime
}: {
  userEmail: string;
  userName: string;
  competitionTitle: string;
  competitionDate: string;
  competitionLocation: string;
  competitionTime: string;
}) {
  return sendEmail({
    to: userEmail,
    subject: `Нагадування про змагання "${competitionTitle}"`,
    template: 'competition-reminder',
    data: {
      userName,
      competitionTitle,
      competitionDate,
      competitionLocation,
      competitionTime
    }
  });
}
