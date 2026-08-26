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

  return (
    <div id="couple" className="space-y-10 py-8 px-4 max-w-xl mx-auto text-espresso-800">
      {/* Surah / Quote Section */}
      <div className="glass-card-romantic p-6 rounded-3xl text-center space-y-3 border border-rosewood-200 shadow-md animate-fade-in-up">
        <p className="font-serif text-base text-rosewood-700 font-bold">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-xs text-espresso-700 italic leading-relaxed">
          "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
        </p>
        <p className="text-[10px] text-rosewood-700 font-bold tracking-wider uppercase">
          — QS. Ar-Rum: 21 —
        </p>
      </div>

      {/* Groom & Bride Section */}
      <div className="space-y-6 text-center animate-fade-in-up">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Mempelai Pernikahan</p>
          <h2 className="font-serif text-2xl font-bold text-rosewood-900">
            Pasangan Mempelai
          </h2>
          <p className="text-xs text-espresso-700 max-w-xs mx-auto">
            Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda dalam perayaan pernikahan kami:
          </p>
        </div>

        <div className="space-y-6">
          {/* Groom Card */}
          <div className="glass-card-romantic p-6 rounded-3xl space-y-3 border border-rosewood-200 shadow-lg relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-200 to-champagne-300 p-1">
              <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-3xl font-bold">
                {settings.groom_name?.charAt(0) || 'F'}
              </div>
            </div>
            <h3 className="font-serif text-xl text-rosewood-900 font-bold">
              {settings.groom_name || 'Fauzi Pratama, S.Kom'}
            </h3>
            <p className="text-xs text-espresso-700">
              {settings.groom_parents || 'Putra dari Bp. H. Ahmad & Ibu Hj. Siti'}
            </p>
            {settings.groom_instagram && (
              <a
                href={`https://instagram.com/${settings.groom_instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-rosewood-700 hover:text-rosewood-900 transition pt-1 font-semibold"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{settings.groom_instagram}</span>
              </a>
            )}
          </div>

          <div className="font-script text-4xl text-rosewood-500">&</div>

          {/* Bride Card */}
          <div className="glass-card-romantic p-6 rounded-3xl space-y-3 border border-rosewood-200 shadow-lg relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-200 to-champagne-300 p-1">
              <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-3xl font-bold">
                {settings.bride_name?.charAt(0) || 'N'}
              </div>
            </div>
            <h3 className="font-serif text-xl text-rosewood-900 font-bold">
              {settings.bride_name || 'Nadiah Rahmawati, S.E'}
            </h3>
            <p className="text-xs text-espresso-700">
              {settings.bride_parents || 'Putri dari Bp. H. Budi & Ibu Hj. Dewi'}
            </p>
            {settings.bride_instagram && (
              <a
                href={`https://instagram.com/${settings.bride_instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-rosewood-700 hover:text-rosewood-900 transition pt-1 font-semibold"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>{settings.bride_instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="glass-card-romantic p-6 rounded-3xl text-center space-y-4 border border-rosewood-200 shadow-md">
        <h3 className="font-serif text-lg text-rosewood-900 font-bold">
          Hitung Mundur Hari Bahagia
        </h3>

        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          <div className="bg-cream-100 p-2.5 rounded-xl border border-rosewood-200">
            <div className="text-xl font-bold font-serif text-rosewood-700">{timeLeft.days}</div>
            <div className="text-[9px] text-espresso-700 uppercase tracking-wider font-semibold">Hari</div>
          </div>
          <div className="bg-cream-100 p-2.5 rounded-xl border border-rosewood-200">
            <div className="text-xl font-bold font-serif text-rosewood-700">{timeLeft.hours}</div>
            <div className="text-[9px] text-espresso-700 uppercase tracking-wider font-semibold">Jam</div>
          </div>
          <div className="bg-cream-100 p-2.5 rounded-xl border border-rosewood-200">
            <div className="text-xl font-bold font-serif text-rosewood-700">{timeLeft.minutes}</div>
            <div className="text-[9px] text-espresso-700 uppercase tracking-wider font-semibold">Menit</div>
          </div>
          <div className="bg-cream-100 p-2.5 rounded-xl border border-rosewood-200">
            <div className="text-xl font-bold font-serif text-rosewood-700">{timeLeft.seconds}</div>
            <div className="text-[9px] text-espresso-700 uppercase tracking-wider font-semibold">Detik</div>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Jadwal & Lokasi</p>
          <h2 className="font-serif text-2xl font-bold text-rosewood-900">
            Rangkaian Acara
          </h2>
        </div>

        <div className="space-y-4">
          {/* Akad Nikah */}
          <div className="glass-card-romantic p-6 rounded-3xl space-y-4 border border-rosewood-200 shadow-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rosewood-100 text-rosewood-700 text-[10px] font-bold uppercase">
              Akad Nikah
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-espresso-800">
                <Calendar className="w-4 h-4 text-rosewood-700 shrink-0" />
                <span className="font-semibold">{formatDate(settings.akad_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-espresso-800">
                <Clock className="w-4 h-4 text-rosewood-700 shrink-0" />
                <span>{settings.akad_time || '08:00 WIB - Selesai'}</span>
              </div>
              <div className="flex items-start gap-2 text-espresso-700">
                <MapPin className="w-4 h-4 text-rosewood-700 shrink-0 mt-0.5" />
                <span>{settings.akad_location}</span>
              </div>
            </div>

            <a
              href={settings.google_maps_url || 'https://maps.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold transition shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Petunjuk Google Maps</span>
            </a>
          </div>

          {/* Resepsi Nikah */}
          <div className="glass-card-romantic p-6 rounded-3xl space-y-4 border border-rosewood-200 shadow-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-200 text-champagne-600 text-[10px] font-bold uppercase">
              Resepsi Nikah
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-espresso-800">
                <Calendar className="w-4 h-4 text-rosewood-700 shrink-0" />
                <span className="font-semibold">{formatDate(settings.resepsi_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-espresso-800">
                <Clock className="w-4 h-4 text-rosewood-700 shrink-0" />
                <span>{settings.resepsi_time || '11:00 - 14:00 WIB'}</span>
              </div>
              <div className="flex items-start gap-2 text-espresso-700">
                <MapPin className="w-4 h-4 text-rosewood-700 shrink-0 mt-0.5" />
                <span>{settings.resepsi_location}</span>
              </div>
            </div>

            <a
              href={settings.google_maps_url || 'https://maps.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-bold transition shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Petunjuk Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
