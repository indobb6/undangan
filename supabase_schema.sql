-- Supabase SQL Schema untuk Aplikasi Undangan Pernikahan Digital
-- Jalankan perintah ini di Supabase Dashboard -> SQL Editor

-- 1. Tabel Pengaturan Acara (Wedding Settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    groom_name TEXT NOT NULL DEFAULT 'Rizky Pratama, S.Kom',
    bride_name TEXT NOT NULL DEFAULT 'Anisa Rahmawati, S.E',
    groom_parents TEXT DEFAULT 'Putra dari Bapak Ahmad & Ibu Siti',
    bride_parents TEXT DEFAULT 'Putri dari Bapak Budi & Ibu Dewi',
    akad_date DATE DEFAULT '2026-09-12',
    akad_time TEXT DEFAULT '08:00 WIB - Selesai',
    akad_location TEXT DEFAULT 'Masjid Agung Al-Azhar, Jakarta Selatan',
    resepsi_date DATE DEFAULT '2026-09-12',
    resepsi_time TEXT DEFAULT '11:00 - 14:00 WIB',
    resepsi_location TEXT DEFAULT 'Ballroom Hotel Grand Mahakam, Jakarta',
    google_maps_url TEXT DEFAULT 'https://maps.google.com',
    music_url TEXT DEFAULT 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data awal (default settings) jika belum ada
INSERT INTO public.settings (id, groom_name, bride_name, groom_parents, bride_parents, akad_location, resepsi_location)
VALUES (
    'default', 
    'Rizky Pratama, S.Kom', 
    'Anisa Rahmawati, S.E', 
    'Putra dari Bp. H. Ahmad & Ibu Hj. Siti', 
    'Putri dari Bp. H. Budi & Ibu Hj. Dewi',
    'Masjid Agung Al-Azhar, Jakarta Selatan',
    'Ballroom Hotel Grand Mahakam, Jakarta Selatan'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabel Data Tamu (Guests) & RSVP
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'hadir', 'tidak_hadir'
    marital_status TEXT NOT NULL DEFAULT 'single', -- 'single', 'married'
    food_quota INT NOT NULL DEFAULT 1, -- 1 jika single, 2 jika married
    qr_code_str TEXT NOT NULL UNIQUE,
    food_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    wishes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable/Configure Row Level Security agar API anon (Vite Client) bisa membaca dan menulis data
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik (Anon Key)
CREATE POLICY "Allow anon read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow anon update settings" ON public.settings FOR ALL USING (true);

CREATE POLICY "Allow anon read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Allow anon insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete guests" ON public.guests FOR DELETE USING (true);
