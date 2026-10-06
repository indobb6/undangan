import React, { useState, useEffect } from 'react';
import bunga1 from '../assets/images/bunga-1.png';
import bunga2 from '../assets/images/bunga-2.png';
import bunga3 from '../assets/images/bunga-3.png';
import bunga4 from '../assets/images/bunga-4.png';

/**
 * FloralGate Component
 * Gerbang bunga pembuka undangan:
 * 1. Tidak muncul di tampilan awal (hanya aktif setelah klik "Buka Undangan").
 * 2. Fase 1 ('swaying'): Bergerak-gerak kecil selama ~2 detik di posisinya masing-masing.
 * 3. Fase 2 ('opening'): Membuka ke luar secara anggun seperti gerbang terbuka.
 */
export default function FloralGate({ isActive }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'swaying' | 'opening' | 'done'

  useEffect(() => {
    if (isActive) {
      // Fase 1: Muncul dan langsung bergerak-gerak kecil
      setPhase('swaying');

      // Fase 2: Setelah 2.2 detik, mulai membuka ke luar seperti gerbang
      const openTimer = setTimeout(() => {
        setPhase('opening');
      }, 2200);

      // Fase 3: Selesai setelah transisi membuka tuntas
      const doneTimer = setTimeout(() => {
        setPhase('done');
      }, 4200);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(doneTimer);
      };
    } else {
      setPhase('idle');
    }
  }, [isActive]);

  // Jika belum diklik buka undangan, jangan tampilkan bunga sama sekali
  if (phase === 'idle' || !isActive) return null;

  const isOpening = phase === 'opening' || phase === 'done';

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-30"
      aria-hidden="true"
    >
      {/* 1. BUNGA 2: SUDUT KIRI ATAS */}
      <div
        className={`absolute top-0 left-0 origin-top-left transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? '-translate-x-[125%] -translate-y-[125%] -rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <div className={!isOpening ? 'animate-sway-tl' : ''}>
          <img
            src={bunga2}
            alt="Bunga Kiri Atas"
            className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-xl"
          />
        </div>
      </div>

      {/* 2. BUNGA 1: SUDUT KANAN ATAS */}
      <div
        className={`absolute top-0 right-0 origin-top-right transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? 'translate-x-[125%] -translate-y-[125%] rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <div className={!isOpening ? 'animate-sway-tr' : ''}>
          <img
            src={bunga1}
            alt="Bunga Kanan Atas"
            className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-xl"
          />
        </div>
      </div>

      {/* 3. BUNGA 3: SISI KIRI */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 origin-left transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? '-translate-x-[135%] -rotate-8 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <div className={!isOpening ? 'animate-sway-l' : ''}>
          <img
            src={bunga3}
            alt="Bunga Sisi Kiri"
            className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-xl"
          />
        </div>
      </div>

      {/* 4. BUNGA 4: SISI KANAN */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 origin-right transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? 'translate-x-[135%] rotate-8 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <div className={!isOpening ? 'animate-sway-r' : ''}>
          <img
            src={bunga4}
            alt="Bunga Sisi Kanan"
            className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
