import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Instagram, Heart } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { formatDirectImageUrl } from '../utils/imageUrl';

export default function InvitationContent({ settings }) {
  useScrollReveal();

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
      {/* ========================================================= */}
      {/* HALAMAN 1: THE WEDDING OF & AYAT AL-QUR'AN (FULL PAGE)    */}
      {/* ========================================================= */}
      <section id="home" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-5 relative">
        <div className="w-full max-w-sm mx-auto space-y-7 text-center my-auto">
          {/* Header The Wedding Of - Slide Up */}
          <div className="space-y-2 slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rosewood-100 text-rosewood-800 text-[10px] font-bold uppercase tracking-widest">
              <Heart className="w-3 h-3 text-rosewood-600 fill-rosewood-600" />
              <span>The Wedding of</span>
            </div>

            <h1 className="font-script text-4xl sm:text-5xl text-romantic-gradient py-2 font-bold leading-tight">
              {groomFirst} & {brideFirst}
            </h1>

            <div className="flex items-center justify-center gap-2 text-espresso-700 font-serif text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-rosewood-600" />
              <span>{formatDate(settings.akad_date)}</span>
            </div>
          </div>

          {/* Ornamen Pemisah Emas */}
          <div className="flex items-center justify-center gap-3 opacity-60">
            <div className="h-[1px] w-12 bg-rosewood-300" />
            <div className="w-1.5 h-1.5 rotate-45 bg-rosewood-600" />
            <div className="h-[1px] w-12 bg-rosewood-300" />
          </div>

          {/* Ayat Al-Qur'an (Surah Ar-Rum: 21) - Slide Up */}
          <div className="glass-card-romantic p-6 rounded-3xl text-center space-y-3 border border-rosewood-200 shadow-lg slide-up">
            <p className="font-serif text-base text-rosewood-800 font-bold leading-relaxed">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>

            <p className="text-xs text-espresso-800 italic leading-relaxed font-serif">
              "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."
            </p>

            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-rosewood-50 text-rosewood-700 text-[10px] font-bold uppercase tracking-wider border border-rosewood-200">
                — QS. Ar-Rum: 21 —
              </span>
            </div>
          </div>

          {/* Indikator scroll ke bawah */}
          <div className="pt-2 animate-bounce opacity-70">
            <span className="text-[10px] font-medium text-espresso-700 tracking-wider">
              Gulir ke bawah ↓
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HALAMAN 2: KHUSUS KEDUA MEMPELAI (FULL PAGE)              */}
      {/* ========================================================= */}
      <section id="couple" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 relative">
        <div className="w-full max-w-sm mx-auto space-y-6 text-center my-auto">
          {/* Header Salam & Pengantar - Slide Up */}
          <div className="space-y-2 slide-up">
            <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">
              Sang Mempelai
            </p>
            <h2 className="font-serif text-2xl font-bold text-rosewood-900">
              Mempelai Pria & Wanita
            </h2>
            <p className="text-[11px] text-espresso-700 leading-relaxed max-w-xs mx-auto">
              Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami bermaksud mengikrarkan janji suci pernikahan:
            </p>
          </div>

          {/* Kartu Kedua Mempelai */}
          <div className="space-y-4 pt-1">
            {/* Mempelai Pria - Slide Left */}
            <div className="glass-card-romantic p-5 rounded-3xl space-y-3 border border-rosewood-200 shadow-md text-center slide-left">
              {/* Foto atau Inisial Mempelai Pria */}
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-300 to-champagne-300 p-1 shadow-md relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-3xl font-bold absolute inset-0 m-1">
                  {settings.groom_name?.charAt(0) || 'F'}
                </div>
                {settings.groom_photo && (
                  <img
                    src={formatDirectImageUrl(settings.groom_photo)}
                    alt={settings.groom_name || 'Mempelai Pria'}
                    className="w-full h-full rounded-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base text-rosewood-900 font-bold">
                  {settings.groom_name || 'Mempelai Pria'}
                </h3>
                <p className="text-xs text-espresso-700 leading-relaxed font-medium">
                  {settings.groom_parents}
                </p>
              </div>

              {settings.groom_instagram && (
                <div className="pt-1">
                  <a
                    href={`https://instagram.com/${settings.groom_instagram.replace('@', '').trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rosewood-50 hover:bg-rosewood-100 border border-rosewood-200 text-xs text-rosewood-800 font-semibold transition shadow-sm"
                  >
                    <Instagram className="w-3.5 h-3.5 text-rosewood-600" />
                    <span>@{settings.groom_instagram.replace('@', '').trim()}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Simbol Pemersatu Cinta & */}
            <div className="flex items-center justify-center gap-3 my-1">
              <div className="h-[1px] w-12 bg-rosewood-200" />
              <div className="w-7 h-7 rounded-full bg-rosewood-100 text-rosewood-700 flex items-center justify-center font-serif text-sm font-bold shadow-inner">
                &
              </div>
              <div className="h-[1px] w-12 bg-rosewood-200" />
            </div>

            {/* Mempelai Wanita - Slide Right */}
            <div className="glass-card-romantic p-5 rounded-3xl space-y-3 border border-rosewood-200 shadow-md text-center slide-right">
              {/* Foto atau Inisial Mempelai Wanita */}
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rosewood-500 via-rosewood-300 to-champagne-300 p-1 shadow-md relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-cream-100 flex items-center justify-center text-rosewood-700 font-script text-3xl font-bold absolute inset-0 m-1">
                  {settings.bride_name?.charAt(0) || 'N'}
                </div>
                {settings.bride_photo && (
                  <img
                    src={formatDirectImageUrl(settings.bride_photo)}
                    alt={settings.bride_name || 'Mempelai Wanita'}
                    className="w-full h-full rounded-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base text-rosewood-900 font-bold">
                  {settings.bride_name || 'Mempelai Wanita'}
                </h3>
                <p className="text-xs text-espresso-700 leading-relaxed font-medium">
                  {settings.bride_parents}
                </p>
              </div>

              {settings.bride_instagram && (
                <div className="pt-1">
                  <a
                    href={`https://instagram.com/${settings.bride_instagram.replace('@', '').trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rosewood-50 hover:bg-rosewood-100 border border-rosewood-200 text-xs text-rosewood-800 font-semibold transition shadow-sm"
                  >
                    <Instagram className="w-3.5 h-3.5 text-rosewood-600" />
                    <span>@{settings.bride_instagram.replace('@', '').trim()}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HALAMAN 3: WAKTU & LOKASI ACARA (FULL PAGE)               */}
      {/* ========================================================= */}
      <section id="event" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 relative">
        <div className="w-full max-w-sm mx-auto space-y-6 my-auto">
          <div className="text-center space-y-1 slide-up">
            <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Jadwal & Lokasi</p>
            <h2 className="font-serif text-2xl font-bold text-rosewood-900">
              {settings.package_type === 'intimate' ? 'Akad Nikah' : 'Rangkaian Acara'}
            </h2>
            <p className="text-[11px] text-espresso-700">
              {settings.package_type === 'intimate'
                ? 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir pada acara Akad Nikah kami:'
                : 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir pada acara kami:'}
            </p>
          </div>

          {/* Cards for Akad & Resepsi */}
          <div className="space-y-4">
            {/* Akad Nikah - Slide Left */}
            <div className="glass-card-romantic p-5 rounded-3xl space-y-3 border border-rosewood-200 shadow-md slide-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rosewood-100 text-rosewood-800 text-[10px] font-bold uppercase tracking-wider">
                Akad Nikah
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-espresso-800">
                  <Calendar className="w-4 h-4 text-rosewood-700 shrink-0" />
                  <span className="font-semibold text-sm">{formatDate(settings.akad_date)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-espresso-800">
                  <Clock className="w-4 h-4 text-rosewood-700 shrink-0" />
                  <span>{settings.akad_time || '08:00 WIB - Selesai'}</span>
                </div>
                <div className="flex items-start gap-2.5 text-espresso-700 pt-1">
                  <MapPin className="w-4 h-4 text-rosewood-700 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line leading-relaxed">{settings.akad_location}</span>
                </div>
              </div>

              <a
                href={settings.google_maps_url || 'https://maps.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 active:scale-95 text-white text-xs font-bold transition shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Google Maps</span>
              </a>
            </div>

            {/* Resepsi Nikah - Hanya tampil jika paket Biasa (bukan Intimate) */}
            {settings.package_type !== 'intimate' && (
              <div className="glass-card-romantic p-5 rounded-3xl space-y-3 border border-rosewood-200 shadow-md slide-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-200 text-champagne-700 text-[10px] font-bold uppercase tracking-wider">
                  Resepsi Nikah
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-espresso-800">
                    <Calendar className="w-4 h-4 text-rosewood-700 shrink-0" />
                    <span className="font-semibold text-sm">{formatDate(settings.resepsi_date)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-espresso-800">
                    <Clock className="w-4 h-4 text-rosewood-700 shrink-0" />
                    <span>{settings.resepsi_time || '11:00 - 14:00 WIB'}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-espresso-700 pt-1">
                    <MapPin className="w-4 h-4 text-rosewood-700 shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-relaxed">{settings.resepsi_location}</span>
                  </div>
                </div>

                <a
                  href={settings.resepsi_maps_url || settings.google_maps_url || 'https://maps.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 active:scale-95 text-white text-xs font-bold transition shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Google Maps</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
