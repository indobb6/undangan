import React, { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import FloralPetals from './FloralPetals';

export default function MotionIntro({ settings, onComplete }) {
  const [phase, setPhase] = useState(1); // 1: Monogram, 2: Names & Date, 3: Transition Out

  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  useEffect(() => {
    // Phase 1 -> Phase 2 after 1.5s
    const timer1 = setTimeout(() => {
      setPhase(2);
    }, 1600);

    // Phase 2 -> Complete after 3.8s
    const timer2 = setTimeout(() => {
      setPhase(3);
    }, 3600);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-cream-100 via-rosewood-100 to-cream-200 text-rosewood-900 transition-opacity duration-700 ${
        phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <FloralPetals count={35} />

      {/* Pulsing Light Glow */}
      <div className="absolute w-[300px] h-[300px] bg-rosewood-300/30 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* PHASE 1: ANIMATED MONOGRAM */}
      {phase === 1 && (
        <div className="relative z-10 flex flex-col items-center space-y-4 animate-fade-in-up">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-rosewood-400 p-1 flex items-center justify-center bg-white/80 shadow-2xl animate-spin-slow">
            <span className="font-script text-4xl sm:text-5xl text-romantic-gradient font-bold">
              {groomFirst.charAt(0)}&{brideFirst.charAt(0)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-rosewood-600 text-xs font-serif tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-champagne-500 animate-bounce" />
            <span>Official Motion Invitation</span>
            <Sparkles className="w-3.5 h-3.5 text-champagne-500 animate-bounce" />
          </div>
        </div>
      )}

      {/* PHASE 2: ANIMATED WEDDING TITLE */}
      {phase >= 2 && (
        <div className="relative z-10 text-center space-y-4 px-6 animate-fade-in-up">
          <p className="text-xs uppercase tracking-widest text-rosewood-700 font-serif font-bold">
            Walimatul 'Ursy
          </p>

          <h1 className="font-script text-5xl sm:text-6xl text-romantic-gradient py-2 font-bold leading-tight">
            {groomFirst} & {brideFirst}
          </h1>

          <div className="flex items-center justify-center gap-3 text-rosewood-400">
            <span className="h-[1px] w-12 bg-rosewood-300" />
            <Heart className="w-4 h-4 text-rosewood-600 fill-rosewood-500 animate-ping" />
            <span className="h-[1px] w-12 bg-rosewood-300" />
          </div>

          <p className="text-xs text-espresso-800 font-serif font-semibold tracking-wider">
            {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 29 Agustus 2026'}
          </p>
        </div>
      )}
    </div>
  );
}
