import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
  getTaskNotificationHtml,
  getDeadlineReminderHtml,
  getGradeNotificationHtml,
  getPasswordResetHtml,
  getVerificationHtml,
} from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, template, props } = body;

    if (!to || !subject || !template || !props) {
      return NextResponse.json(
        { error: 'Field "to", "subject", "template", dan "props" wajib diisi.' },
        { status: 400 }
      );
    }

    let html = '';

    switch (template) {
      case 'task':
        html = getTaskNotificationHtml(props);
        break;
      case 'deadline':
        html = getDeadlineReminderHtml(props);
        break;
      case 'grade':
        html = getGradeNotificationHtml(props);
        break;
      case 'reset':
      case 'password-reset':
        html = getPasswordResetHtml(props);
        break;
      case 'verification':
      case 'verify':
        html = getVerificationHtml(props);
        break;
      default:
        return NextResponse.json(
          { error: 'Template tidak valid. Pilihan: task, deadline, grade, password-reset, verification.' },
          { status: 400 }
        );
    }

    const result = await sendEmail({ to, subject, html });

    if (result.success) {
      return NextResponse.json({
        message: 'Email berhasil dikirim!',
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { error: 'Gagal mengirim email.', details: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error pada API send email:', error);
    return NextResponse.json(
      { error: 'Internal server error saat mengirim email.', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
