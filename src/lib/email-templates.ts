// Utility templates for TugasKu email notifications in consistent Premium Dark Mode style

const baseHeader = `
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="font-size: 28px; font-weight: bold; color: #6366f1; font-family: 'Outfit', 'Inter', sans-serif; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
  </div>
`;

const baseFooter = `
  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #4b5563; font-family: 'Inter', sans-serif; line-height: 1.5;">
    <p>Email ini dikirim otomatis oleh sistem TugasKu Portal.</p>
    <p>© 2026 TugasKu. Hak Cipta Dilindungi.</p>
  </div>
`;

// Helper to escape HTML characters
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 1. Task Notification Template
export function getTaskNotificationHtml({
  courseName,
  courseCode,
  taskTitle,
  description,
  deadline,
  taskUrl,
}: {
  courseName: string;
  courseCode: string;
  taskTitle: string;
  description: string;
  deadline: string;
  taskUrl: string;
}) {
  return `
    <div style="background-color: #090d16; color: #f3f4f6; padding: 40px 20px; margin: 0 auto; max-width: 600px; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
        <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(99, 102, 241, 0.3);">Tugas Baru Terbit</div>
      </div>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.4;">${escapeHtml(taskTitle)}</h2>
        <p style="font-size: 14px; color: #9ca3af; margin: 0;">
          Mata Kuliah: <strong style="color: #e5e7eb;">${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</strong>
        </p>
        
        <div style="height: 1px; background-color: #1f2937; margin: 20px 0;"></div>
        
        <div style="font-size: 13px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Deskripsi Tugas:</div>
        <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin: 0 0 24px 0; white-space: pre-wrap;">${escapeHtml(description)}</p>
        
        <div style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: #ef4444; text-transform: uppercase; margin-bottom: 4px;">Batas Pengumpulan (Deadline):</div>
          <div style="font-size: 16px; font-weight: bold; color: #f8fafc;">${escapeHtml(deadline)}</div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${taskUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);" target="_blank" rel="noopener noreferrer">
            Buka Halaman Tugas
          </a>
        </div>
      </div>
      ${baseFooter}
    </div>
  `;
}

// 2. Deadline Reminder Template
export function getDeadlineReminderHtml({
  courseName,
  courseCode,
  taskTitle,
  daysRemaining,
  deadline,
  taskUrl,
}: {
  courseName: string;
  courseCode: string;
  taskTitle: string;
  daysRemaining: 1 | 3;
  deadline: string;
  taskUrl: string;
}) {
  const isCritical = daysRemaining === 1;
  const themeColor = isCritical ? '#ef4444' : '#f59e0b';
  const bgSoft = isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
  const borderSoft = isCritical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';
  const badgeText = isCritical ? 'PENTING: Besok Batas Akhir!' : 'PENGINGAT: H-3 Deadline';

  return `
    <div style="background-color: #090d16; color: #f3f4f6; padding: 40px 20px; margin: 0 auto; max-width: 600px; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
        <div style="display: inline-block; background-color: ${bgSoft}; color: ${themeColor}; border: 1px solid ${borderSoft}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
          ${badgeText}
        </div>
      </div>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.4;">${escapeHtml(taskTitle)}</h2>
        <p style="font-size: 14px; color: #9ca3af; margin: 0;">
          Mata Kuliah: <strong style="color: #e5e7eb;">${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</strong>
        </p>
        
        <div style="height: 1px; background-color: #1f2937; margin: 20px 0;"></div>
        
        <div style="border: 1px solid ${borderSoft}; background-color: ${bgSoft}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${isCritical ? '#fca5a5' : '#fcd34d'};">
            ${isCritical 
              ? 'Tugas ini memiliki tenggat waktu BESOK. Jangan lewatkan waktu pengumpulan agar nilai Anda tidak terpotong!'
              : 'Tugas ini memiliki sisa waktu 3 hari lagi untuk dikerjakan. Ayo selesaikan sebelum batas waktu!'}
          </p>
        </div>
        
        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: ${themeColor}; text-transform: uppercase; margin-bottom: 4px;">Batas Pengumpulan (Deadline):</div>
          <div style="font-size: 16px; font-weight: bold; color: #f8fafc;">${escapeHtml(deadline)}</div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${taskUrl}" style="display: inline-block; background-color: ${themeColor}; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px ${themeColor}66;" target="_blank" rel="noopener noreferrer">
            Kumpulkan Tugas Sekarang
          </a>
        </div>
      </div>
      ${baseFooter}
    </div>
  `;
}

// 3. Grade Notification Template
export function getGradeNotificationHtml({
  courseName,
  courseCode,
  taskTitle,
  grade,
  feedback,
  lecturerName,
  gradeUrl,
}: {
  courseName: string;
  courseCode: string;
  taskTitle: string;
  grade: number;
  feedback?: string;
  lecturerName: string;
  gradeUrl: string;
}) {
  const displayFeedback = feedback 
    ? `<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #d1d5db; white-space: pre-wrap;">"${escapeHtml(feedback)}"</p>`
    : `<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280; font-style: italic;">Tidak ada catatan tambahan yang disertakan.</p>`;

  return `
    <div style="background-color: #090d16; color: #f3f4f6; padding: 40px 20px; margin: 0 auto; max-width: 600px; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
        <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);">Nilai Telah Terbit</div>
      </div>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; line-height: 1.4;">${escapeHtml(taskTitle)}</h2>
        <p style="font-size: 14px; color: #9ca3af; margin: 0 0 6px 0;">
          Mata Kuliah: <strong style="color: #e5e7eb;">${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</strong>
        </p>
        <p style="font-size: 14px; color: #9ca3af; margin: 0 0 6px 0;">
          Dosen Pengampu: <strong style="color: #e5e7eb;">${escapeHtml(lecturerName)}</strong>
        </p>
        
        <div style="height: 1px; background-color: #1f2937; margin: 20px 0;"></div>
        
        <div style="text-align: center; margin: 24px 0;">
          <div style="font-size: 13px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Nilai Anda:</div>
          <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.08); border: 2px solid rgba(16, 185, 129, 0.3); border-radius: 50%; width: 120px; height: 120px; line-height: 116px; text-align: center;">
            <span style="font-size: 36px; font-weight: 800; color: #10b981;">${grade}</span>
            <span style="font-size: 16px; font-weight: 600; color: #047857;">/100</span>
          </div>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">Catatan dari Dosen:</div>
          ${displayFeedback}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${gradeUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);" target="_blank" rel="noopener noreferrer">
            Lihat Detail Penyerahan
          </a>
        </div>
      </div>
      ${baseFooter}
    </div>
  `;
}

// 4. Password Reset Template
export function getPasswordResetHtml({
  resetUrl,
  name,
}: {
  resetUrl: string;
  name: string;
}) {
  return `
    <div style="background-color: #090d16; color: #f3f4f6; padding: 40px 20px; margin: 0 auto; max-width: 600px; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
        <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(99, 102, 241, 0.3);">Atur Ulang Kata Sandi</div>
      </div>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.4;">Halo, ${escapeHtml(name)}!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin: 0;">
          Kami menerima permintaan untuk mengatur ulang kata sandi akun TugasKu Anda. 
          Klik tombol di bawah ini untuk masuk ke halaman pengaturan sandi baru Anda:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);" target="_blank" rel="noopener noreferrer">
            Atur Ulang Kata Sandi
          </a>
        </div>

        <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fcd34d;">
            <strong>Penting:</strong> Tautan ini hanya berlaku selama <strong>1 jam</strong> dari sekarang 
            dan hanya dapat digunakan satu kali.
          </p>
        </div>

        <div style="height: 1px; background-color: #1f2937; margin: 24px 0;"></div>

        <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin: 0;">
          Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini dengan aman. 
          Kata sandi Anda akan tetap aman dan tidak akan diubah.
        </p>
      </div>
      ${baseFooter}
    </div>
  `;
}

// 5. Verification Email Template
export function getVerificationHtml({
  verificationUrl,
  name,
}: {
  verificationUrl: string;
  name: string;
}) {
  return `
    <div style="background-color: #090d16; color: #f3f4f6; padding: 40px 20px; margin: 0 auto; max-width: 600px; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: bold; color: #6366f1; letter-spacing: 1px; margin: 0 0 8px 0;">TugasKu Portal</div>
        <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(99, 102, 241, 0.3);">Aktivasi Akun</div>
      </div>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.4;">Selamat Datang di TugasKu, ${escapeHtml(name)}!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin: 0;">
          Terima kasih telah bergabung di TugasKu Portal. Langkah terakhir untuk mengaktifkan akun Anda 
          dan mengakses dashboard mahasiswa adalah dengan memverifikasi alamat email Anda.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);" target="_blank" rel="noopener noreferrer">
            Verifikasi Akun Saya
          </a>
        </div>

        <div style="background-color: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #818cf8;">
            <strong>Penting:</strong> Tautan aktivasi ini hanya berlaku selama <strong>24 jam</strong> dari sekarang. 
            Jika tautan kadaluarsa, Anda dapat meminta kirim ulang dari halaman login.
          </p>
        </div>

        <div style="height: 1px; background-color: #1f2937; margin: 24px 0;"></div>

        <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin: 0;">
          Jika Anda merasa tidak mendaftar di TugasKu Portal, Anda dapat mengabaikan email ini dengan aman.
        </p>
      </div>
      ${baseFooter}
    </div>
  `;
}
