-- ==============================================================================
-- SKRIP REFRESH DATABASE SUPABASE (BERSIH & KOMPATIBEL 100%)
-- Salin dan jalankan seluruh isi skrip ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Hapus tabel lama jika tipe datanya tidak cocok
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. Buat Tabel Pengaturan Acara (Settings)
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    event_slug TEXT NOT NULL UNIQUE,
    groom_name TEXT NOT NULL DEFAULT '',
    bride_name TEXT NOT NULL DEFAULT '',
    groom_parents TEXT DEFAULT '',
    bride_parents TEXT DEFAULT '',
    groom_instagram TEXT DEFAULT '',
    bride_instagram TEXT DEFAULT '',
    akad_date TEXT DEFAULT '2026-09-20',
    akad_time TEXT DEFAULT '08:00 WIB - Selesai',
    akad_location TEXT DEFAULT 'Lokasi Akad Nikah',
    resepsi_date TEXT DEFAULT '2026-09-20',
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

-- 3. Buat Tabel Tamu & RSVP (Guests)
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    marital_status TEXT NOT NULL DEFAULT 'single',
    food_quota INT NOT NULL DEFAULT 1,
    qr_code_str TEXT NOT NULL UNIQUE,
    food_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    wishes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Nonaktifkan Row Level Security (RLS) agar aplikasi frontend dapat membaca dan menulis data
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;

-- 5. Berikan Hak Akses Penuh ke Public/Anon
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.guests TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
