import { PrismaClient, Role, TaskStatus, EnrollmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Database Universitas Perwira Purbalingga (UNPERBA) ---');

  // 1. Membersihkan data lama
  console.log('Pembersihan database...');
  await prisma.submission.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash Password
  console.log('Mempersiapkan enkripsi password...');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const dosenPasswordHash = bcrypt.hashSync('dosen123', 10);
  const mhsPasswordHash = bcrypt.hashSync('mahasiswa123', 10);

  // 3. Membuat Admin
  console.log('Membuat akun Super Admin...');
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@unperba.ac.id',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // 4. Membuat 12 Akun Dosen
  console.log('Membuat 12 akun Dosen Informatika...');
  const lecturersData = [
    { name: 'Titi Safitri Maharani, S.Kom., M.Kom.', email: 'titi@unperba.ac.id' },
    { name: 'Siska Irma Budianti, S.Si., M.Sc.', email: 'siska@unperba.ac.id' },
    { name: 'Dr. Jeffri Prayitno, S.Kom, M.MSI.', email: 'jeffri@unperba.ac.id' },
    { name: 'Siti Nasiroh, S.Kom., M.Kom.', email: 'siti.nasiroh@unperba.ac.id' },
    { name: 'Muhammad Reza Setiawan, S.Kom., M.Kom.', email: 'reza@unperba.ac.id' },
    { name: 'Hasirun, S.Kom., M.Kom.', email: 'hasirun@unperba.ac.id' },
    { name: 'Herjuna Ardi Prakosa, S.Kom., M.Kom.', email: 'herjuna@unperba.ac.id' },
    { name: 'Melia Dwi Renovriska, S.Pd., M.Pd.', email: 'melia@unperba.ac.id' },
    { name: 'Ari Budi Riyanto, S.T., M.Pd.', email: 'ari.budi@unperba.ac.id' },
    // 3 Dosen tambahan untuk mencukupi kebutuhan program studi
    { name: 'Eko Prasetyo, S.Kom., M.Cs.', email: 'eko@unperba.ac.id' },
    { name: 'Tri Wahyuni, S.Kom., M.T.', email: 'tri@unperba.ac.id' },
    { name: 'Roni Wijaya, S.T., M.Eng.', email: 'roni@unperba.ac.id' },
  ];

  const lecturers: Record<string, string> = {};

  for (const doc of lecturersData) {
    const user = await prisma.user.create({
      data: {
        name: doc.name,
        email: doc.email,
        password: dosenPasswordHash,
        role: Role.DOSEN,
        emailVerified: new Date(), // Dosen terbuat otomatis terverifikasi
      },
    });
    // Simpan id dosen dipetakan dengan nama singkat untuk mempermudah relasi mata kuliah
    const shortName = doc.name.split(',')[0].trim();
    lecturers[shortName] = user.id;
  }

  // 5. Membuat Mata Kuliah Informatika Semester Genap 2025/2026
  console.log('Membuat daftar Mata Kuliah Informatika (Semester Genap)...');
  const coursesData = [
    // Semester 2
    { code: 'C005213', name: 'Teori Bahasa dan Automata', semester: 2, lecturerShortName: 'Titi Safitri Maharani' },
    { code: 'C005214', name: 'Statistik', semester: 2, lecturerShortName: 'Siska Irma Budianti' },
    { code: 'C005215', name: 'Sistem Digital', semester: 2, lecturerShortName: 'Dr. Jeffri Prayitno' },
    { code: 'C005216', name: 'Pengantar Sistem Informasi', semester: 2, lecturerShortName: 'Siti Nasiroh' },
    { code: 'C005217', name: 'Komunikasi Data', semester: 2, lecturerShortName: 'Muhammad Reza Setiawan' },
    { code: 'C005218', name: 'Aljabar Linier dan Matriks', semester: 2, lecturerShortName: 'Ari Budi Riyanto' },

    // Semester 4
    { code: 'B05216', name: 'Struktur Data', semester: 4, lecturerShortName: 'Muhammad Reza Setiawan' },
    { code: 'B05210', name: 'Algoritma dan Pemrograman Lanjut', semester: 4, lecturerShortName: 'Hasirun' },
    { code: 'B05208', name: 'Data Mining', semester: 4, lecturerShortName: 'Herjuna Ardi Prakosa' },
    { code: 'B05209', name: 'Rekayasa Perangkat Lunak', semester: 4, lecturerShortName: 'Titi Safitri Maharani' }, // Diubah dari B05208 ke B05209 agar kode unik
    { code: 'B05403', name: 'Komputer dan Masyarakat', semester: 4, lecturerShortName: 'Siti Nasiroh' },

    // Semester 6
    { code: 'B05302', name: 'IT Audit', semester: 6, lecturerShortName: 'Herjuna Ardi Prakosa' },
    { code: 'B05304', name: 'Interaksi Manusia dan Komputer', semester: 6, lecturerShortName: 'Melia Dwi Renovriska' },
    { code: 'A05305', name: 'Keamanan Komputer', semester: 6, lecturerShortName: 'Siti Nasiroh' },
    { code: 'A05312', name: 'Sistem Pendukung Keputusan', semester: 6, lecturerShortName: 'Hasirun' },
    { code: 'B05421', name: 'Kecerdasan Buatan', semester: 6, lecturerShortName: 'Titi Safitri Maharani' },

    // Semester 8
    { code: 'A05401', name: 'Seminar Proposal', semester: 8, lecturerShortName: 'Siti Nasiroh' },
    { code: 'A05402', name: 'Seminar Hasil', semester: 8, lecturerShortName: 'Siti Nasiroh' },
    { code: 'A05404', name: 'Skripsi', semester: 8, lecturerShortName: 'Herjuna Ardi Prakosa' },
    { code: 'A05406', name: 'Pendadaran', semester: 8, lecturerShortName: 'Ari Budi Riyanto' },
  ];

  const courses: Record<string, string> = {};

  for (const c of coursesData) {
    const lecturerId = lecturers[c.lecturerShortName];
    if (!lecturerId) {
      throw new Error(`Dosen dengan nama ${c.lecturerShortName} tidak ditemukan untuk mata kuliah ${c.name}`);
    }

    const course = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        semester: c.semester,
        lecturerId: lecturerId,
      },
    });
    courses[c.code] = course.id;
  }

  // 6. Membuat 50 Akun Mahasiswa
  console.log('Membuat 50 akun Mahasiswa Informatika...');
  const studentsRaw = [
    // Semester 2 (15)
    { name: 'Aditya Pratama', email: 'aditya@unperba.ac.id', sem: 2 },
    { name: 'Siti Aminah', email: 'aminah@unperba.ac.id', sem: 2 },
    { name: 'Rian Hidayat', email: 'rian@unperba.ac.id', sem: 2 },
    { name: 'Eka Saputri', email: 'eka.saputri@unperba.ac.id', sem: 2 },
    { name: 'Rizky Ramadhan', email: 'rizky@unperba.ac.id', sem: 2 },
    { name: 'Mega Lestari', email: 'mega@unperba.ac.id', sem: 2 },
    { name: 'Gilang Dirga', email: 'gilang@unperba.ac.id', sem: 2 },
    { name: 'Indah Permatasari', email: 'indah@unperba.ac.id', sem: 2 },
    { name: 'Budi Cahyono', email: 'budi.c@unperba.ac.id', sem: 2 },
    { name: 'Agus Setiawan', email: 'agus@unperba.ac.id', sem: 2 },
    { name: 'Andi Wijaya', email: 'andi@unperba.ac.id', sem: 2 },
    { name: 'Sri Wahyuni', email: 'sri@unperba.ac.id', sem: 2 },
    { name: 'Dwi Kartika', email: 'dwi@unperba.ac.id', sem: 2 },
    { name: 'Hendra Wijaya', email: 'hendra@unperba.ac.id', sem: 2 },
    { name: 'Fitri Handayani', email: 'fitri@unperba.ac.id', sem: 2 },

    // Semester 4 (15)
    { name: 'Bambang Pamungkas', email: 'bambang@unperba.ac.id', sem: 4 },
    { name: 'Dewi Lestari', email: 'dewi@unperba.ac.id', sem: 4 },
    { name: 'Fajar Nugraha', email: 'fajar@unperba.ac.id', sem: 4 },
    { name: 'Diana Puspita', email: 'diana@unperba.ac.id', sem: 4 },
    { name: 'Heri Susanto', email: 'heri@unperba.ac.id', sem: 4 },
    { name: 'Yuni Astuti', email: 'yuni@unperba.ac.id', sem: 4 },
    { name: 'Eko Sulistyo', email: 'eko.s@unperba.ac.id', sem: 4 },
    { name: 'Rini Anggraini', email: 'rini@unperba.ac.id', sem: 4 },
    { name: 'Taufik Hidayat', email: 'taufik@unperba.ac.id', sem: 4 },
    { name: 'Larasati Putri', email: 'larasati@unperba.ac.id', sem: 4 },
    { name: 'Wawan Hermawan', email: 'wawan@unperba.ac.id', sem: 4 },
    { name: 'Novianti Safitri', email: 'novi@unperba.ac.id', sem: 4 },
    { name: 'Rudi Tabuti', email: 'rudi@unperba.ac.id', sem: 4 },
    { name: 'Sari Indah', email: 'sari@unperba.ac.id', sem: 4 },
    { name: 'Joko Widodo', email: 'joko@unperba.ac.id', sem: 4 },

    // Semester 6 (15)
    { name: 'Prabowo Subianto', email: 'prabowo@unperba.ac.id', sem: 6 },
    { name: 'Megawati Soekarnoputri', email: 'mega.s@unperba.ac.id', sem: 6 },
    { name: 'Susilo Bambang Yudhoyono', email: 'sby@unperba.ac.id', sem: 6 },
    { name: 'Abdurrahman Wahid', email: 'gusdur@unperba.ac.id', sem: 6 },
    { name: 'Habibie Bacharuddin', email: 'habibie@unperba.ac.id', sem: 6 },
    { name: 'Soeharto Cendana', email: 'harto@unperba.ac.id', sem: 6 },
    { name: 'Soekarno Hatta', email: 'karno@unperba.ac.id', sem: 6 },
    { name: 'Anies Baswedan', email: 'anies@unperba.ac.id', sem: 6 },
    { name: 'Ganjar Pranowo', email: 'ganjar@unperba.ac.id', sem: 6 },
    { name: 'Gibran Rakabuming', email: 'gibran@unperba.ac.id', sem: 6 },
    { name: 'Mahfud Mohammad', email: 'mahfud@unperba.ac.id', sem: 6 },
    { name: 'Muhaimin Iskandar', email: 'cakimin@unperba.ac.id', sem: 6 },
    { name: 'Ridwan Kamil', email: 'kangemil@unperba.ac.id', sem: 6 },
    { name: 'Sandiaga Uno', email: 'sandi@unperba.ac.id', sem: 6 },
    { name: 'Agus Harimurti', email: 'ahy@unperba.ac.id', sem: 6 },

    // Semester 8 (5)
    { name: 'Basuki Tjahaja Purnama', email: 'ahok@unperba.ac.id', sem: 8 },
    { name: 'Sri Mulyani Indrawati', email: 'sri.mul@unperba.ac.id', sem: 8 },
    { name: 'Retno Marsudi', email: 'retno@unperba.ac.id', sem: 8 },
    { name: 'Erick Thohir', email: 'erick@unperba.ac.id', sem: 8 },
    { name: 'Luhut Binsar Pandjaitan', email: 'luhut@unperba.ac.id', sem: 8 },
  ];

  const students: Array<{ id: string; name: string; sem: number }> = [];

  for (const std of studentsRaw) {
    const user = await prisma.user.create({
      data: {
        name: std.name,
        email: std.email,
        password: mhsPasswordHash,
        role: Role.MAHASISWA,
        semester: std.sem,
        emailVerified: new Date(), // Mahasiswa seeding otomatis aktif
      },
    });
    students.push({ id: user.id, name: std.name, sem: std.sem });
  }

  // 7. Membuat Pendaftaran Mata Kuliah (Enrollment) & Matkul terkait
  console.log('Mendaftarkan Mahasiswa ke Kelas Mata Kuliah (Enrollment)...');
  
  for (const std of students) {
    // Cari mata kuliah yang semester-nya cocok dengan semester berjalan mahasiswa
    const eligibleCourses = coursesData.filter(c => c.semester === std.sem);
    
    for (const ec of eligibleCourses) {
      const courseId = courses[ec.code];
      if (courseId) {
        await prisma.enrollment.create({
          data: {
            studentId: std.id,
            courseId: courseId,
            status: EnrollmentStatus.AKTIF,
          },
        });
      }
    }
  }

  // 8. Membuat 2 Tugas per Mata Kuliah (UTS - 1 Mei 2026 & UAS - 30 Juni 2026)
  console.log('Membuat 2 Tugas per Mata Kuliah (UTS & UAS)...');
  
  const taskTemplates: Record<string, Array<{ title: string; description: string }>> = {
    C005213: [
      { title: 'Analisis Finite State Automata (FSA)', description: 'Buatlah rancangan DFA dan NFA untuk mengenali pola string biner tertentu, lalu tuangkan dalam bentuk tabel transisi dan diagram transisi.' },
      { title: 'Penyederhanaan Context-Free Grammar (CFG)', description: 'Lakukan penyederhanaan pada CFG berikut dengan menghilangkan aturan produksi kosong, unit, dan tidak menghasilkan.' }
    ],
    C005214: [
      { title: 'Uji Hipotesis Deskriptif & Distribusi Normal', description: 'Gunakan SPSS atau Excel untuk melakukan uji signifikansi hipotesis satu arah pada data nilai ujian informatika.' },
      { title: 'Korelasi & Regresi Linier Berganda', description: 'Hitunglah koefisien korelasi Pearson dan rumuskan persamaan regresi linier berganda untuk memperkirakan lama belajar terhadap IPK mahasiswa.' }
    ],
    C005215: [
      { title: 'Perancangan Rangkaian Kombinasional Logika', description: 'Buatlah rancangan rangkaian Full Adder dan Full Subtractor menggunakan gerbang logika dasar NAND/NOR.' },
      { title: 'Penyederhanaan Peta Karnaugh (K-Map)', description: 'Sederhanakan persamaan logika empat variabel berikut menggunakan metode Peta Karnaugh dan gambarkan rangkaian logikanya.' }
    ],
    C005216: [
      { title: 'Analisis Sistem Informasi E-Commerce', description: 'Lakukan analisis komponen input, proses, output, dan penyimpanan pada salah satu e-commerce besar di Indonesia.' },
      { title: 'Perancangan Data Flow Diagram (DFD) Toko Online', description: 'Gambarkan DFD Level 0 (Context Diagram) dan DFD Level 1 untuk sistem informasi penjualan barang di toko kelontong.' }
    ],
    C005217: [
      { title: 'Modulasi Analog dan Digital', description: 'Jelaskan perbedaan antara ASK, FSK, dan PSK serta buatlah visualisasi bentuk gelombang sinyal untuk deretan bit tertentu.' },
      { title: 'Perhitungan Subnetting CIDR IPv4', description: 'Sebuah jaringan dengan IP 192.168.10.0/24 akan dibagi menjadi 4 subnet baru. Tentukan range IP, subnet mask, dan broadcast IP masing-masing.' }
    ],
    C005218: [
      { title: 'Penyelesaian SPL dengan Eliminasi Gauss-Jordan', description: 'Selesaikan sistem persamaan linier tiga variabel berikut menggunakan metode eliminasi matriks Gauss-Jordan.' },
      { title: 'Perhitungan Nilai Eigen dan Vektor Eigen', description: 'Tentukan nilai eigen dan vektor eigen dari matriks persegi 3x3 yang terlampir.' }
    ],
    B05216: [
      { title: 'Implementasi Stack & Queue pada Array', description: 'Tuliskan modul program dalam bahasa C++ lengkap untuk melakukan push, pop, enqueue, dan dequeue lengkap dengan penanganan overflow.' },
      { title: 'Studi Kasus Penelusuran Binary Search Tree (BST)', description: 'Lakukan penyisipan angka-angka berikut ke dalam BST, kemudian lakukan penelusuran secara Pre-order, In-order, dan Post-order.' }
    ],
    B05210: [
      { title: 'Analisis Kompleksitas Algoritma Rekursif', description: 'Hitung kompleksitas waktu (Big-O Notation) pada algoritma rekursif Fibonacci dan jelaskan cara optimasi dengan Dynamic Programming.' },
      { title: 'Penerapan Algoritma Quicksort dan Mergesort', description: 'Buatlah visualisasi perbandingan jumlah langkah operasi swap antara metode Quicksort dan Mergesort untuk data tidak beraturan.' }
    ],
    B05208: [
      { title: 'Klasifikasi Data dengan K-Nearest Neighbors (KNN)', description: 'Gunakan Jupyter Notebook atau Python (Scikit-Learn) untuk melakukan klasifikasi klas terhadap dataset bunga Iris menggunakan algoritma KNN.' },
      { title: 'Analisis Klastering Asosiasi Apriori', description: 'Tentukan aturan asosiasi (Association Rules) dari data transaksi supermarket berikut menggunakan metode perhitungan support dan confidence.' }
    ],
    B05209: [
      { title: 'Perancangan Software Requirement Specification (SRS)', description: 'Susun dokumen SRS standar IEEE 830 untuk proyek aplikasi manajemen klinik kesehatan yang mencakup Functional & Non-Functional Requirements.' },
      { title: 'Desain Class Diagram dan Use Case Diagram', description: 'Gambarkan Use Case Diagram lengkap dengan skenario use case serta Class Diagram relasional untuk sistem reservasi tiket bioskop.' }
    ],
    B05403: [
      { title: 'Analisis Dampak Etis AI di Masyarakat', description: 'Tulis esai sepanjang 1000 kata mengenai ancaman hilangnya lapangan pekerjaan akibat kecerdasan buatan dan bagaimana regulasi pemerintah menyikapinya.' },
      { title: 'Studi Kasus Pelanggaran Hak Cipta Digital (Copyright)', description: 'Lakukan analisis kasus pembajakan kode software berlisensi komersial dan diskusikan aspek hukum UU ITE di Indonesia.' }
    ],
    B05302: [
      { title: 'Penyusunan Kertas Kerja Audit Sistem Informasi', description: 'Buatlah lembar kertas kerja audit SI pada fungsi manajemen password user menggunakan kerangka kerja COBIT 5.' },
      { title: 'Analisis Manajemen Risiko Keamanan dengan COBIT', description: 'Lakukan penilaian tingkat kematangan (maturity level) proses DSS05 (Manage Security Services) di instansi tempat Anda magang.' }
    ],
    B05304: [
      { title: 'Perancangan Wireframe High-Fidelity Figma', description: 'Buatlah desain UI antarmuka aplikasi pemesanan makanan berbasis mobile menggunakan Figma yang rapi dan user-friendly.' },
      { title: 'Evaluasi Heuristik pada Aplikasi Mobile', description: 'Lakukan pengujian kegunaan (usability testing) pada salah satu aplikasi mobile dinas pemerintahan menggunakan 10 prinsip evaluasi heuristik Jakob Nielsen.' }
    ],
    A05305: [
      { title: 'Analisis Kerentanan Website dengan OWASP Top 10', description: 'Simulasikan deteksi celah keamanan SQL Injection dan Cross-Site Scripting (XSS) pada server web lokal yang rentan.' },
      { title: 'Konfigurasi Enkripsi Kriptografi Simetris & Asimetris', description: 'Tulis skrip program sederhana untuk melakukan enkripsi dan dekripsi pesan teks menggunakan algoritma AES-256 dan RSA.' }
    ],
    A05312: [
      { title: 'Perhitungan Manual Metode Analytical Hierarchy Process (AHP)', description: 'Tentukan prioritas pemilihan supplier terbaik dengan menghitung matriks perbandingan berpasangan, nilai konsistensi (CI/CR) menggunakan AHP.' },
      { title: 'Penerapan Metode Simple Additive Weighting (SAW)', description: 'Gunakan spreadsheet untuk menghitung perangkingan penerima beasiswa prestasi menggunakan metode SAW berdasarkan 5 kriteria.' }
    ],
    B05421: [
      { title: 'Perancangan Pohon Keputusan (Decision Tree ID3)', description: 'Lakukan perhitungan entropi dan information gain secara manual dari tabel cuaca terlampir untuk membangun pohon keputusan ID3.' },
      { title: 'Implementasi Jaringan Saraf Tiruan (Backpropagation)', description: 'Lakukan training sederhana menggunakan library Tensorflow/Keras untuk klasifikasi citra angka tulisan tangan (MNIST).' }
    ],
    A05401: [
      { title: 'Draft Bab I Pendahuluan Proposal Skripsi', description: 'Tuliskan draf Bab I (Latar Belakang, Rumusan Masalah, Tujuan, dan Manfaat Penelitian) untuk rencana topik skripsi Anda.' },
      { title: 'Penyusunan Bab II Tinjauan Pustaka & State of the Art', description: 'Buatlah tabel matriks penelitian terdahulu (minimal 10 jurnal nasional/internasional terakreditasi) yang relevan dengan skripsi Anda.' }
    ],
    A05402: [
      { title: 'Draft Bab IV Hasil dan Pembahasan Skripsi', description: 'Sajikan grafik analisis data hasil pengujian performa sistem beserta pembahasan kualitatif dan kuantitatifnya.' },
      { title: 'Penyusunan Draft Artikel Ilmiah (Jurnal)', description: 'Konversikan hasil penelitian skripsi Anda ke dalam format template jurnal ilmiah Universitas Perwira Purbalingga.' }
    ],
    A05404: [
      { title: 'Pengumpulan Laporan Skripsi Lengkap (Bab I - V)', description: 'Kumpulkan file naskah skripsi lengkap dalam format PDF yang telah disetujui oleh kedua dosen pembimbing skripsi.' },
      { title: 'Persiapan Slide Presentasi Sidang Skripsi', description: 'Buatlah slide presentasi sidang akhir skripsi maksimal 15 slide yang mencakup metodologi, hasil, dan kesimpulan.' }
    ],
    A05406: [
      { title: 'Review Materi Kuliah Core Informatika', description: 'Jelaskan konsep dasar Object-Oriented Programming, Normalisasi Basis Data, dan SDLC sebagai bahan ujian pendadaran.' },
      { title: 'Studi Kasus Ujian Komprehensif Lisan', description: 'Jawablah studi kasus pemecahan masalah algoritma pencarian rute terpendek (Dijkstra) dan analisis waktu eksekusinya.' }
    ]
  };

  const tasks: Array<{ id: string; code: string; deadline: Date }> = [];

  for (const code of Object.keys(courses)) {
    const courseId = courses[code];
    const templates = taskTemplates[code];
    if (courseId && templates) {
      // Tugas 1 (UTS - 1 Mei 2026)
      const t1 = await prisma.task.create({
        data: {
          title: templates[0].title,
          description: templates[0].description,
          deadline: new Date('2026-05-01T23:59:59'),
          courseId: courseId,
        },
      });
      tasks.push({ id: t1.id, code, deadline: t1.deadline });

      // Tugas 2 (UAS - 30 Juni 2026)
      const t2 = await prisma.task.create({
        data: {
          title: templates[1].title,
          description: templates[1].description,
          deadline: new Date('2026-06-30T23:59:59'),
          courseId: courseId,
        },
      });
      tasks.push({ id: t2.id, code, deadline: t2.deadline });
    }
  }

  // 9. Membuat Pengumpulan Tugas (Submission) - 70% mahasiswa sudah mengumpulkan, bernilai & bermasukan
  console.log('Membuat Pengumpulan Tugas Mahasiswa (Submissions) sebesar 70%...');
  
  const feedbacks = [
    'Kerja bagus, pertahankan kualitas tugas seperti ini!',
    'Penjelasan sangat terperinci dan rapi. Struktur program diimplementasikan dengan sangat baik.',
    'Implementasi kodenya sudah benar, namun pastikan lagi untuk memperhatikan efisiensi algoritma.',
    'Perhatikan lagi penulisan tanda baca dan kerapihan tata letak dokumentasi laporan proyek Anda.',
    'Struktur data yang dipilih sudah tepat, namun kodingan Anda perlu diberi komentar penjelasan.',
  ];

  let submissionCount = 0;

  for (const t of tasks) {
    // Dapatkan data mata kuliah untuk dicari mahasiswanya yang terdaftar
    const course = coursesData.find(c => c.code === t.code);
    if (!course) continue;

    // Ambil mahasiswa yang terdaftar di kelas semester terkait
    const enrolledStudents = students.filter(s => s.sem === course.semester);

    for (const std of enrolledStudents) {
      // 70% probability to submit
      if (Math.random() < 0.70) {
        const grade = Math.floor(Math.random() * 31) + 65; // Nilai random antara 65 sampai 95
        const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        
        // Buat tanggal submit random sebelum deadline (1 sampai 5 hari sebelum deadline)
        const daysBefore = Math.floor(Math.random() * 5) + 1;
        const submittedAt = new Date(t.deadline.getTime() - daysBefore * 24 * 60 * 60 * 1000);

        await prisma.submission.create({
          data: {
            taskId: t.id,
            studentId: std.id,
            fileUrl: `/uploads/tugas_${t.code}_${std.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
            status: TaskStatus.SELESAI,
            grade: grade,
            feedback: feedback,
            submittedAt: submittedAt,
          },
        });
        submissionCount++;
      }
    }
  }

  console.log(`Berhasil membuat ${submissionCount} submission data mahasiswa.`);
  console.log('--- Database Seeding UNPERBA Selesai dengan Sukses! ---');
}

main()
  .catch((e) => {
    console.error('Error saat melakukan database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
