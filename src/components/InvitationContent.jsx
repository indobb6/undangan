import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Heart, Gift } from 'lucide-react';

export default function InvitationContent({ settings }) {
  // Countdown calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(`${settings.akad_date || '2026-09-12'}T08:00:00`).getTime();

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
    if (!dateStr) return 'Sabtu, 12 September 2026';
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

  return (
    <div className="space-y-16 py-12 px-4 max-w-4xl mx-auto text-slate-100">
      {/* Surah / Quote Section */}
      <div className="glass-card p-8 rounded-3xl text-center space-y-6 border border-gold-500/30">
        <p className="font-serif text-lg text-gold-300">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-sm sm:text-base text-slate-300 italic leading-relaxed max-w-2xl mx-auto">
          "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
        </p>
        <p className="text-xs text-gold-400 font-semibold tracking-wider uppercase">
          — QS. Ar-Rum: 21 —
        </p>
      </div>

      {/* Groom & Bride Section */}
      <div className="space-y-10 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Mempelai Pernikahan</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-100 font-bold">
            Mempelai Laki-Laki & Perempuan
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga berkenan memelihara hubungan pernikahan kami.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Groom */}
          <div className="glass-card-gold p-8 rounded-3xl space-y-4 border border-gold-500/30">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-gold-500 to-amber-200 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-gold-300 font-script text-4xl">
                {settings.groom_name?.charAt(0) || 'R'}
              </div>
            </div>
            <h3 className="font-serif text-2xl text-gold-200 font-bold">
              {settings.groom_name}
            </h3>
            <p className="text-xs text-slate-300">
              {settings.groom_parents}
            </p>
          </div>

          {/* Bride */}
          <div className="glass-card-gold p-8 rounded-3xl space-y-4 border border-gold-500/30">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-gold-500 to-amber-200 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-gold-300 font-script text-4xl">
                {settings.bride_name?.charAt(0) || 'A'}
              </div>
            </div>
            <h3 className="font-serif text-2xl text-gold-200 font-bold">
              {settings.bride_name}
            </h3>
            <p className="text-xs text-slate-300">
              {settings.bride_parents}
            </p>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="glass-card p-8 rounded-3xl text-center space-y-6 border border-gold-500/30">
        <h3 className="font-serif text-xl sm:text-2xl text-gold-300 font-bold">
          Hitung Mundur Acara Pernikahan
        </h3>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-gold-500/20">
            <div className="text-2xl sm:text-4xl font-bold font-serif text-gold-400">{timeLeft.days}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Hari</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-gold-500/20">
            <div className="text-2xl sm:text-4xl font-bold font-serif text-gold-400">{timeLeft.hours}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Jam</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-gold-500/20">
            <div className="text-2xl sm:text-4xl font-bold font-serif text-gold-400">{timeLeft.minutes}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Menit</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-gold-500/20">
            <div className="text-2xl sm:text-4xl font-bold font-serif text-gold-400">{timeLeft.seconds}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Detik</div>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Jadwal & Lokasi</p>
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            Rangkaian Acara
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Akad Nikah */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-gold-500/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold uppercase">
                Akad Nikah
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-200 text-sm">
                  <Calendar className="w-5 h-5 text-gold-400 shrink-0" />
                  <span>{formatDate(settings.akad_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 text-sm">
                  <Clock className="w-5 h-5 text-gold-400 shrink-0" />
                  <span>{settings.akad_time || '08:00 WIB - Selesai'}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <span>{settings.akad_location}</span>
                </div>
              </div>
            </div>

            <a
              href={settings.google_maps_url || 'https://maps.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold-300 text-xs font-semibold border border-gold-500/30 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Google Maps</span>
            </a>
          </div>

          {/* Resepsi Nikah */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-gold-500/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase">
                Resepsi Nikah
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-200 text-sm">
                  <Calendar className="w-5 h-5 text-gold-400 shrink-0" />
                  <span>{formatDate(settings.resepsi_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 text-sm">
                  <Clock className="w-5 h-5 text-gold-400 shrink-0" />
                  <span>{settings.resepsi_time || '11:00 - 14:00 WIB'}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <span>{settings.resepsi_location}</span>
                </div>
              </div>
            </div>

            <a
              href={settings.google_maps_url || 'https://maps.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold-300 text-xs font-semibold border border-gold-500/30 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
