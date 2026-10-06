import React, { useState, useEffect } from 'react';
import bunga1 from '../assets/images/bunga-1.png';
import bunga2 from '../assets/images/bunga-2.png';
import bunga3 from '../assets/images/bunga-3.png';
import bunga4 from '../assets/images/bunga-4.png';

/**
 * FloralGate Component
 * Gerbang bunga pembuka undangan:
 * - HANYA MUNCUL setelah tombol 'Buka Undangan' diklik (tidak tampil di awal).
 * - Bunga 1: Sudut kanan atas (Top-Right)
 * - Bunga 2: Sudut kiri atas (Top-Left)
 * - Bunga 3: Sisi kiri (Left-Side)
 * - Bunga 4: Sisi kanan (Right-Side)
 * - Saat aktif, bunga muncul dan langsung membuka ke luar seperti gerbang istana.
 */
export default function FloralGate({ isActive }) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Mulai transisi membuka gerbang setelah render awal
      const timer = setTimeout(() => {
        setIsOpening(true);
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setIsOpening(false);
    }
  }, [isActive]);

  // Jika belum diklik buka undangan, jangan tampilkan bunga sama sekali
  if (!isActive) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-30"
      aria-hidden="true"
    >
      {/* 1. BUNGA 2: SUDUT KIRI ATAS */}
      <div
        className={`absolute top-0 left-0 origin-top-left transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? '-translate-x-[120%] -translate-y-[120%] -rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga2}
          alt="Bunga Kiri Atas"
          className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-xl"
        />
      </div>

      {/* 2. BUNGA 1: SUDUT KANAN ATAS */}
      <div
        className={`absolute top-0 right-0 origin-top-right transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? 'translate-x-[120%] -translate-y-[120%] rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga1}
          alt="Bunga Kanan Atas"
          className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-xl"
        />
      </div>

      {/* 3. BUNGA 3: SISI KIRI */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 origin-left transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? '-translate-x-[130%] -rotate-6 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga3}
          alt="Bunga Sisi Kiri"
          className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-xl"
        />
      </div>

      {/* 4. BUNGA 4: SISI KANAN */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 origin-right transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening
            ? 'translate-x-[130%] rotate-6 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga4}
          alt="Bunga Sisi Kanan"
          className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-xl"
        />
      </div>
    </div>
  );
}
