import React from 'react';
import { MailOpen, Heart, Sparkles } from 'lucide-react';

export default function CoverSection({ settings, guestName, onOpenInvitation }) {
  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  return (
    <div className="relative min-h-screen sm:min-h-[92vh] flex flex-col items-center justify-between py-10 px-4 text-center bg-gradient-to-b from-cream-100 via-rosewood-50 to-cream-100 text-espresso-800 selection:bg-rosewood-200 overflow-hidden">
      {/* Soft Romantic Glow & Floral Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] h-[440px] sm:h-[540px] bg-gradient-to-b from-rosewood-100/50 via-champagne-200/40 to-transparent rounded-t-full blur-3xl pointer-events-none" />

      {/* Romantic Floral Border Frame */}
      <div className="absolute inset-4 sm:inset-6 border-2 border-rosewood-300/40 rounded-t-[170px] rounded-b-[40px] pointer-events-none flex flex-col justify-between p-4 shadow-inner">
        <div className="text-center text-rosewood-700/70 text-[10px] tracking-widest font-serif pt-3">
          ❀ THE WEDDING CELEBRATION ❀
        </div>
        <div className="text-center text-rosewood-700/70 text-[10px] tracking-widest font-serif pb-2">
          SAVE THE DATE
        </div>
      </div>

      {/* Top Header Tag */}
      <div className="relative z-10 mt-6 animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-rosewood-200 text-rosewood-700 text-[11px] font-semibold tracking-widest uppercase shadow-sm backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-champagne-500" />
          <span>Walimatul 'Ursy</span>
          <Sparkles className="w-3 h-3 text-champagne-500" />
        </span>
      </div>

      {/* Center Names & Personalized Guest Card */}
      <div className="relative z-10 my-auto py-4 space-y-4 max-w-sm mx-auto">
        <p className="text-rosewood-700 font-serif tracking-widest text-xs uppercase">
          Undangan Pernikahan
        </p>

        {/* Couple Names */}
        <h1 className="font-script text-5xl sm:text-6xl text-romantic-gradient py-1 leading-snug">
          {groomFirst} & {brideFirst}
        </h1>

        <div className="flex items-center justify-center gap-3 text-rosewood-500/70">
          <span className="h-[1px] w-10 bg-rosewood-300/60" />
          <Heart className="w-4 h-4 text-rosewood-500 fill-rosewood-500/40 animate-pulse" />
          <span className="h-[1px] w-10 bg-rosewood-300/60" />
        </div>

        <p className="text-xs text-espresso-700 font-serif font-medium">
          {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 29 Agustus 2026'}
        </p>

        {/* Personalized Guest Box */}
        <div className="glass-card-romantic p-5 rounded-2xl border border-rosewood-200 shadow-xl space-y-2 transform transition hover:scale-[1.02] mt-4">
          <p className="text-[11px] text-rosewood-700/80 font-sans uppercase tracking-wider font-semibold">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <div className="py-0.5">
            <h3 className="text-xl font-bold font-serif text-rosewood-900 tracking-wide">
              {guestName || 'M Yaser'}
            </h3>
          </div>
          <p className="text-[10px] text-espresso-700/60 italic">
            *Mohon maaf apabila ada kesalahan penulisan nama & gelar
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 mb-6">
        <button
          onClick={onOpenInvitation}
          className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-rosewood-700 via-rosewood-500 to-rosewood-700 text-white font-bold tracking-wide shadow-lg shadow-rosewood-500/30 hover:shadow-rosewood-500/50 transform transition hover:-translate-y-1 active:translate-y-0 text-sm"
        >
          <MailOpen className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
          <span>Buka Undangan</span>
        </button>
      </div>
    </div>
  );
}
