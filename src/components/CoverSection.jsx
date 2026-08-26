import React from 'react';
import { MailOpen, Heart, Sparkles } from 'lucide-react';

export default function CoverSection({ settings, guestName, onOpenInvitation }) {
  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  return (
    <div className="relative min-h-screen sm:min-h-[90vh] flex flex-col items-center justify-between py-10 px-4 text-center bg-slate-950 text-slate-100 selection:bg-gold-500 selection:text-slate-900 overflow-hidden">
      {/* Background Arch Ornament & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[400px] sm:h-[500px] bg-gradient-to-b from-gold-500/20 via-rose-500/10 to-transparent rounded-t-full blur-3xl pointer-events-none" />

      {/* Inviglory Arch Border Frame */}
      <div className="absolute inset-4 sm:inset-6 border-2 border-gold-500/30 rounded-t-[160px] rounded-b-3xl pointer-events-none flex flex-col justify-between p-4">
        <div className="text-center text-gold-400 opacity-60 text-[10px] tracking-widest font-serif pt-4">
          ❖ THE WEDDING OF ❖
        </div>
        <div className="text-center text-gold-400 opacity-60 text-[10px] tracking-widest font-serif pb-2">
          INVIGLORY DIGITAL INVITATION
        </div>
      </div>

      {/* Top Tagline */}
      <div className="relative z-10 mt-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[11px] tracking-widest uppercase">
          <Sparkles className="w-3 h-3" />
          <span>Walimatul 'Ursy</span>
          <Sparkles className="w-3 h-3" />
        </span>
      </div>

      {/* Center Couple Names & Arch Photo/Ornament */}
      <div className="relative z-10 my-auto py-6 space-y-5 max-w-sm mx-auto">
        <p className="text-gold-300/80 font-serif tracking-widest text-xs uppercase">
          Undangan Pernikahan
        </p>

        {/* Couple Names */}
        <h1 className="font-script text-5xl sm:text-6xl text-gold-gradient py-2 leading-snug">
          {groomFirst} & {brideFirst}
        </h1>

        <div className="flex items-center justify-center gap-3 text-gold-400/80">
          <span className="h-[1px] w-10 bg-gold-500/30" />
          <Heart className="w-4 h-4 text-gold-400 fill-gold-400/30 animate-pulse" />
          <span className="h-[1px] w-10 bg-gold-500/30" />
        </div>

        <p className="text-xs text-slate-300 font-serif">
          {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 29 Agustus 2026'}
        </p>

        {/* Personalized Guest Box (Inviglory Style) */}
        <div className="glass-card-gold p-5 rounded-2xl border border-gold-500/40 shadow-2xl space-y-2 transform transition hover:scale-[1.02] mt-4">
          <p className="text-[11px] text-slate-300 font-sans uppercase tracking-wider">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <div className="py-0.5">
            <h3 className="text-xl font-bold font-serif text-gold-200 tracking-wide">
              {guestName || 'M Yaser'}
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            *Mohon maaf bila ada kesalahan penulisan nama & gelar
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 mb-6">
        <button
          onClick={onOpenInvitation}
          className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-slate-950 font-bold tracking-wide shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transform transition hover:-translate-y-1 active:translate-y-0 text-sm"
        >
          <MailOpen className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
          <span>Buka Undangan</span>
        </button>
      </div>
    </div>
  );
}
