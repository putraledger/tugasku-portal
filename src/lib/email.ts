import { BrevoClient } from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;

// Inisialisasi BrevoClient secara aman jika API key dikonfigurasi
const client = apiKey && apiKey !== 'xxxxx' ? new BrevoClient({ apiKey }) : null;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!client) {
    console.warn(
      `[Email Send Skipped] BREVO_API_KEY belum dikonfigurasi atau masih menggunakan nilai placeholder. ` +
      `Silakan isi BREVO_API_KEY di file .env Anda.`
    );
    return { success: false, error: 'BREVO_API_KEY is not configured' };
  }

  try {
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@studypulse.com';
    const fromName = process.env.BREVO_FROM_NAME || 'StudyPulse';

    const recipientEmails = Array.isArray(to) ? to : [to];
    
    const data = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { name: fromName, email: fromEmail },
      to: recipientEmails.map((email) => ({ email })),
    });

    console.log(`[Email Sent via Brevo] Ke: ${recipientEmails.join(', ')} | Subjek: ${subject}`);
    return { success: true, data };
  } catch (error) {
    console.error('[Email Send Failed via Brevo] Gagal mengirim email:', error);
    return { success: false, error };
  }
}
