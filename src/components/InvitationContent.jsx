import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Instagram, Heart } from 'lucide-react';

export default function InvitationContent({ settings }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(`${settings.akad_date || '2026-08-29'}T08:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.akad_date]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sabtu, 29 Agustus 2026';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  return (
    <>
      {/* PAGE 1: BERANDA / COUPLE PROFILE (FULL PAGE SNAP) */}
      <section id="home" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 snap-start relative">
        <div className="w-full space-y-6 text-center animate-fade-in-up my-auto">
          {/* Header Title */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">The Wedding of</p>
            <h1 className="font-script text-4xl sm:text-5xl text-romantic-gradient py-1 font-bold">
              {groomFirst} & {brideFirst}
            </h1>
            <p className="text-xs text-espresso-700 font-serif font-semibold">
              {formatDate(settings.akad_date)}
            </p>
          </div>

          {/* Surah Quote */}
          <div className="glass-card-romantic p-5 rounded-3xl text-center space-y-2 border border-rosewood-200 shadow-md">
            <p className="font-serif text-sm text-rosewood-700 font-bold">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-[11px] text-espresso-700 italic leading-relaxed">
              "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..."
            </p>
            <p className="text-[9px] text-rosewood-700 font-bold uppercase tracking-wider">
              — QS. Ar-Rum: 21 —
            </p>
          </div>

          {/* Groom & Bride Cards */}
          <div className="grid grid-cols-2 gap-3 items-center pt-2">
            {/* Groom */}
            <div className="glass-card-romantic p-4 rounded-2xl space-y-2 border border-rosewood-200 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-200 to-champagne-300 p-0.5">
                <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-2xl font-bold">
                  {settings.groom_name?.charAt(0) || 'F'}
                </div>
              </div>
              <h3 className="font-serif text-sm text-rosewood-900 font-bold">
                {settings.groom_name || 'Fauzi Pratama'}
              </h3>
              <p className="text-[10px] text-espresso-700 leading-tight">
                {settings.groom_parents}
              </p>
            </div>

            {/* Bride */}
            <div className="glass-card-romantic p-4 rounded-2xl space-y-2 border border-rosewood-200 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-200 to-champagne-300 p-0.5">
                <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-2xl font-bold">
                  {settings.bride_name?.charAt(0) || 'N'}
                </div>
              </div>
              <h3 className="font-serif text-sm text-rosewood-900 font-bold">
                {settings.bride_name || 'Nadiah Rahmawati'}
              </h3>
              <p className="text-[10px] text-espresso-700 leading-tight">
                {settings.bride_parents}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 2: ACARA & SCHEDULE (FULL PAGE SNAP) */}
      <section id="couple" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 snap-start relative">
        <div className="w-full space-y-6 animate-fade-in-up my-auto">
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Jadwal & Lokasi</p>
            <h2 className="font-serif text-2xl font-bold text-rosewood-900">
              Rangkaian Acara
            </h2>
          </div>

          {/* Countdown Timer */}
          <div className="glass-card-romantic p-4 rounded-2xl text-center space-y-2 border border-rosewood-200 shadow-sm">
            <h3 className="font-serif text-xs text-rosewood-900 font-bold uppercase tracking-wider">
              Hitung Mundur Hari Bahagia
            </h3>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              <div className="bg-cream-100 p-2 rounded-xl border border-rosewood-200">
                <div className="text-lg font-bold font-serif text-rosewood-700">{timeLeft.days}</div>
                <div className="text-[8px] text-espresso-700 uppercase font-semibold">Hari</div>
              </div>
              <div className="bg-cream-100 p-2 rounded-xl border border-rosewood-200">
                <div className="text-lg font-bold font-serif text-rosewood-700">{timeLeft.hours}</div>
                <div className="text-[8px] text-espresso-700 uppercase font-semibold">Jam</div>
              </div>
              <div className="bg-cream-100 p-2 rounded-xl border border-rosewood-200">
                <div className="text-lg font-bold font-serif text-rosewood-700">{timeLeft.minutes}</div>
                <div className="text-[8px] text-espresso-700 uppercase font-semibold">Menit</div>
              </div>
              <div className="bg-cream-100 p-2 rounded-xl border border-rosewood-200">
                <div className="text-lg font-bold font-serif text-rosewood-700">{timeLeft.seconds}</div>
                <div className="text-[8px] text-espresso-700 uppercase font-semibold">Detik</div>
              </div>
            </div>
          </div>

          {/* Cards for Akad & Resepsi */}
          <div className="space-y-3">
            {/* Akad Nikah */}
            <div className="glass-card-romantic p-5 rounded-2xl space-y-3 border border-rosewood-200 shadow-md">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rosewood-100 text-rosewood-700 text-[10px] font-bold uppercase">
                Akad Nikah
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-espresso-800">
                  <Calendar className="w-3.5 h-3.5 text-rosewood-700 shrink-0" />
                  <span className="font-semibold">{formatDate(settings.akad_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-espresso-800">
                  <Clock className="w-3.5 h-3.5 text-rosewood-700 shrink-0" />
                  <span>{settings.akad_time || '08:00 WIB - Selesai'}</span>
                </div>
                <div className="flex items-start gap-2 text-espresso-700">
                  <MapPin className="w-3.5 h-3.5 text-rosewood-700 shrink-0 mt-0.5" />
                  <span>{settings.akad_location}</span>
                </div>
              </div>

              <a
                href={settings.google_maps_url || 'https://maps.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
            </div>

            {/* Resepsi Nikah */}
            <div className="glass-card-romantic p-5 rounded-2xl space-y-3 border border-rosewood-200 shadow-md">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-champagne-200 text-champagne-600 text-[10px] font-bold uppercase">
                Resepsi Nikah
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-espresso-800">
                  <Calendar className="w-3.5 h-3.5 text-rosewood-700 shrink-0" />
                  <span className="font-semibold">{formatDate(settings.resepsi_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-espresso-800">
                  <Clock className="w-3.5 h-3.5 text-rosewood-700 shrink-0" />
                  <span>{settings.resepsi_time || '11:00 - 14:00 WIB'}</span>
                </div>
                <div className="flex items-start gap-2 text-espresso-700">
                  <MapPin className="w-3.5 h-3.5 text-rosewood-700 shrink-0 mt-0.5" />
                  <span>{settings.resepsi_location}</span>
                </div>
              </div>

              <a
                href={settings.google_maps_url || 'https://maps.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
