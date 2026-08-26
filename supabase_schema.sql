-- Supabase SQL Schema untuk Aplikasi Undangan Pernikahan Multi-Acara (Multi-Event)
-- Jalankan perintah ini di Supabase Dashboard -> SQL Editor

-- 1. Tabel Acara / Event Pernikahan (Multi-Event Support)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'fauzi-nadiah',
    event_slug TEXT NOT NULL UNIQUE DEFAULT 'fauzi-nadiah',
    groom_name TEXT NOT NULL DEFAULT 'Fauzi Pratama, S.Kom',
    bride_name TEXT NOT NULL DEFAULT 'Nadiah Rahmawati, S.E',
    groom_parents TEXT DEFAULT 'Putra dari Bp. H. Ahmad & Ibu Hj. Siti',
    bride_parents TEXT DEFAULT 'Putri dari Bp. H. Budi & Ibu Hj. Dewi',
    groom_instagram TEXT DEFAULT '@fauzi',
    bride_instagram TEXT DEFAULT '@nadiah',
    akad_date DATE DEFAULT '2026-08-29',
    akad_time TEXT DEFAULT '08:00 WIB - Selesai',
    akad_location TEXT DEFAULT 'Masjid Agung Al-Azhar, Kebayoran Baru, Jakarta Selatan',
    resepsi_date DATE DEFAULT '2026-08-29',
    resepsi_time TEXT DEFAULT '11:00 - 14:00 WIB',
    resepsi_location TEXT DEFAULT 'Ballroom Hotel Grand Mahakam, Jakarta Selatan',
    google_maps_url TEXT DEFAULT 'https://maps.google.com',
    music_url TEXT DEFAULT 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    bank_name TEXT DEFAULT 'Bank BCA',
    bank_account TEXT DEFAULT '1234567890',
    bank_owner TEXT DEFAULT 'Fauzi Pratama',
    bank_name_2 TEXT DEFAULT 'Bank Mandiri',
    bank_account_2 TEXT DEFAULT '0987654321',
    bank_owner_2 TEXT DEFAULT 'Nadiah Rahmawati',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data awal untuk 2 Acara Default (Fauzi & Nadiah, serta Rizky & Anisa)
INSERT INTO public.settings (id, event_slug, groom_name, bride_name, groom_parents, bride_parents, akad_location, resepsi_location)
VALUES 
(
    'fauzi-nadiah', 
    'fauzi-nadiah',
    'Fauzi Pratama, S.Kom', 
    'Nadiah Rahmawati, S.E', 
    'Putra dari Bp. H. Ahmad & Ibu Hj. Siti', 
    'Putri dari Bp. H. Budi & Ibu Hj. Dewi',
    'Masjid Agung Al-Azhar, Jakarta Selatan',
    'Ballroom Hotel Grand Mahakam, Jakarta Selatan'
),
(
    'rizky-anisa', 
    'rizky-anisa',
    'Rizky Pratama, S.T', 
    'Anisa Rahma, S.Pd', 
    'Putra dari Bp. H. Hendra & Ibu Hj. Maryam', 
    'Putri dari Bp. H. Syarif & Ibu Hj. Nur',
    'Masjid Ramlie Musofa, Jakarta Utara',
    'Balai Kartini, Jakarta Selatan'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabel Data Tamu (Guests) & RSVP Multi-Event
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL DEFAULT 'fauzi-nadiah',
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'hadir', 'tidak_hadir'
    marital_status TEXT NOT NULL DEFAULT 'single', -- 'single', 'married'
    food_quota INT NOT NULL DEFAULT 1, -- 1 jika single, 2 jika married
    qr_code_str TEXT NOT NULL UNIQUE,
    food_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    wishes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Policy
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update settings" ON public.settings FOR ALL USING (true);

CREATE POLICY "Allow anon read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update/delete guests" ON public.guests FOR ALL USING (true);
