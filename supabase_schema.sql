-- ==============================================================================
-- SKRIP DATABASE SUPABASE UNTUK APLIKASI UNDANGAN PERNIKAHAN MULTI-ACARA
-- Salin dan jalankan seluruh isi skrip ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Buat Tabel Pengaturan Acara (Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    event_slug TEXT NOT NULL UNIQUE,
    groom_name TEXT NOT NULL DEFAULT '',
    bride_name TEXT NOT NULL DEFAULT '',
    groom_parents TEXT DEFAULT '',
    bride_parents TEXT DEFAULT '',
    groom_instagram TEXT DEFAULT '',
    bride_instagram TEXT DEFAULT '',
    akad_date DATE DEFAULT '2026-09-20',
    akad_time TEXT DEFAULT '08:00 WIB - Selesai',
    akad_location TEXT DEFAULT 'Lokasi Akad Nikah',
    resepsi_date DATE DEFAULT '2026-09-20',
    resepsi_time TEXT DEFAULT '11:00 - 14:00 WIB',
    resepsi_location TEXT DEFAULT 'Lokasi Resepsi Nikah',
    google_maps_url TEXT DEFAULT 'https://maps.google.com',
    music_url TEXT DEFAULT 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    bank_name TEXT DEFAULT '',
    bank_account TEXT DEFAULT '',
    bank_owner TEXT DEFAULT '',
    bank_name_2 TEXT DEFAULT '',
    bank_account_2 TEXT DEFAULT '',
    bank_owner_2 TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom event_slug tersedia jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS event_slug TEXT;

-- 2. Buat Tabel Tamu & RSVP (Guests)
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'hadir', 'tidak_hadir'
    marital_status TEXT NOT NULL DEFAULT 'single', -- 'single', 'married'
    food_quota INT NOT NULL DEFAULT 1, -- 1 jika single, 2 jika married
    qr_code_str TEXT NOT NULL UNIQUE,
    food_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    wishes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom event_slug tersedia pada tabel guests
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS event_slug TEXT;

-- 3. Nonaktifkan Row Level Security (RLS) agar aplikasi frontend dapat membaca dan menulis data
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;

-- 4. Berikan Hak Akses Penuh ke Public/Anon
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.guests TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
