import React from 'react';
import { MailOpen, Heart, Sparkles } from 'lucide-react';

export default function CoverSection({ settings, guestName, onOpenInvitation }) {
  const groomFirst = settings.groom_name?.split(',')[0] || 'Rizky';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Anisa';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between py-12 px-4 text-center bg-slate-950 text-slate-100 overflow-hidden selection:bg-gold-500 selection:text-slate-900">
      {/* Background Decorative Rings & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-10 left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Frame Border Decorative Overlay */}
      <div className="absolute inset-4 sm:inset-8 border border-gold-500/30 rounded-3xl pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-between items-center text-gold-400 opacity-60 text-xs sm:text-sm font-serif">
          <span>❖ UNDANGAN PERNIKAHAN ❖</span>
          <span>THE WEDDING OF</span>
        </div>
        <div className="flex justify-between items-center text-gold-400 opacity-60 text-xs sm:text-sm font-serif">
          <span>❖ SAVE THE DATE ❖</span>
          <span>{settings.akad_date ? new Date(settings.akad_date).getFullYear() : '2026'}</span>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 mt-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs sm:text-sm tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Wedding Celebration</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Center Couple Names & Title */}
      <div className="relative z-10 my-auto py-8 space-y-6 max-w-xl mx-auto">
        <p className="text-gold-300/80 font-serif tracking-widest text-sm uppercase">
          Kami Mengundang Anda Ke Pernikahan
        </p>

        <h1 className="font-script text-5xl sm:text-7xl md:text-8xl text-gold-gradient py-2 leading-relaxed">
          {groomFirst} & {brideFirst}
        </h1>

        <div className="flex items-center justify-center gap-4 text-gold-400/80">
          <span className="h-[1px] w-12 bg-gold-500/30" />
          <Heart className="w-4 h-4 text-gold-400 fill-gold-400/30 animate-bounce" />
          <span className="h-[1px] w-12 bg-gold-500/30" />
        </div>

        {/* Personalized Guest Box */}
        <div className="mt-8 glass-card-gold p-6 rounded-2xl border border-gold-500/40 shadow-2xl max-w-md mx-auto space-y-3 transform transition hover:scale-[1.02]">
          <p className="text-xs text-slate-300 font-sans uppercase tracking-wider">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <div className="py-1">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 tracking-wide">
              {guestName || 'Tamu Undangan'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 mb-6">
        <button
          onClick={onOpenInvitation}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-slate-950 font-bold tracking-wide shadow-lg shadow-gold-500/2 hover:shadow-gold-500/40 transform transition hover:-translate-y-1 active:translate-y-0 text-base"
        >
          <MailOpen className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
          <span>Buka Undangan</span>
        </button>
      </div>
    </div>
  );
}
