# 💍 Aplikasi Undangan Pernikahan Digital

Aplikasi undangan pernikahan digital interaktif dan responsif berbasis **React**, **Vite**, **Tailwind CSS**, dan **Supabase**. Dilengkapi dengan sistem personalisasi nama tamu, konfirmasi kehadiran (RSVP) otomatis, perhitungan kuota voucher makanan berbasis status pernikahan (**Single** = 1 Voucher, **Sudah Menikah** = 2 Voucher), QR Code generator, **Panel Admin**, serta **Pemindai (Scanner) QR Code** berbasis kamera untuk panitia/resepsionis di lokasi acara.

![Preview Aplikasi](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Tailwind%20%7C%20Supabase-gold?style=for-the-badge)

---

## ✨ Fitur-Fitur Utama

### 1. 💌 Halaman Pertama (Cover Undangan & Personalisasi Tamu)
- Menampilkan nama kedua mempelai dengan desain mewah.
- **Personalisasi Otomatis**: Menampilkan nama tamu secara otomatis sesuai URL (contoh: `https://undangan-kamu.vercel.app/?to=Budi+Santoso`).
- **Tombol Buka Undangan**: Membuka halaman utama undangan disertai musik latar.

### 2. 💒 Detail Acara Pernikahan
- Kutipan Surah Ar-Rum: 21 & Salam Pembuka.
- Profil Mempelai Laki-laki & Perempuan.
- **Rangkaian Acara**: Kartu terpisah untuk **Akad Nikah** & **Resepsi Nikah** lengkap dengan tombol lokasi Google Maps.
- **Hitung Mundur (Countdown Timer)**: Menghitung waktu secara real-time menuju hari H.

### 3. 🎫 Konfirmasi Kehadiran (RSVP) & Voucher Konsumsi QR
- Form kehadiran (Hadir / Tidak Hadir) & Papan Ucapan Restu.
- **Pilihan Status Pernikahan**:
  - 👤 **Single**: Mendapatkan **1 Voucher Makan** (1 Porsi).
  - 👥 **Sudah Menikah**: Mendapatkan **2 Voucher Makan** (2 Porsi).
- **QR Code Voucher**: Dihasilkan secara otomatis dan dapat diunduh (format PNG) oleh tamu untuk ditunjukkan kepada panitia di lokasi acara.

### 4. ⚙️ Panel Admin
- **Pengaturan Acara**: Form edit nama mempelai, nama orang tua, tanggal/waktu akad, resepsi, alamat, link maps, dan musik.
- **Manajemen Tamu**:
  - Tambah nama tamu undangan baru.
  - **Generator Link WA**: Tombol 1-klik untuk menyalin pesan WhatsApp undangan yang dipersonalisasi.
  - Rekap statistik: Total Tamu, Hadir, Total Porsi Voucher, dan Status Penukaran.

### 5. 📷 Pemindai (QR Scanner) Resepsionis
- Pemindai kamera live (`html5-qrcode`) yang dapat memindai QR Code di HP tamu secara instant.
- Fitur pencarian manual berdasarkan kode QR.
- Menampilkan Nama Tamu, Status, dan Hak Porsi Konsumsi (1 atau 2 Porsi).
- Tombol **"Tukarkan Voucher Makan"** untuk memperbarui status penukaran secara real-time dan mencegah penukaran ganda.

---

## 🛠️ Cara Menjalankan Secara Lokal

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/indobb6/undangan.git
   cd undangan
   ```

2. **Install dependency**:
   ```bash
   npm install
   ```

3. **Jalankan server lokal**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5173/?to=Budi+Santoso`

---

## 🌐 Deploy ke Vercel & Supabase

### 1. Database Supabase
1. Buat project baru di [Supabase](https://supabase.com).
2. Salin seluruh isi file [`supabase_schema.sql`](./supabase_schema.sql) dan jalankan di **SQL Editor** Supabase.

### 2. Deployment Vercel
1. Hubungkan repository GitHub ini ke [Vercel](https://vercel.com).
2. Tambahkan **Environment Variables** di Vercel:
   - `VITE_SUPABASE_URL` = *(URL Project Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon API Key Supabase Anda)*
3. Klik **Deploy**!
