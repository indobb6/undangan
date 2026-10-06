import React from 'react';
import bunga1 from '../assets/images/bunga-1.png';
import bunga2 from '../assets/images/bunga-2.png';
import bunga3 from '../assets/images/bunga-3.png';
import bunga4 from '../assets/images/bunga-4.png';

/**
 * FloralGate Component
 * Gerbang bunga pembuka undangan:
 * - Bunga 1: Sudut kanan atas (Top-Right)
 * - Bunga 2: Sudut kiri atas (Top-Left)
 * - Bunga 3: Sisi kiri (Left-Side)
 * - Bunga 4: Sisi kanan (Right-Side)
 * 
 * Saat `isOpen === true`, bunga-bunga membuka ke luar seperti gerbang istana.
 */
export default function FloralGate({ isOpen }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-30 transition-opacity duration-1000 ${
        isOpen ? 'pointer-events-none' : ''
      }`}
      aria-hidden="true"
    >
      {/* 1. BUNGA 2: SUDUT KIRI ATAS */}
      <div
        className={`absolute top-0 left-0 origin-top-left transition-all duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen
            ? '-translate-x-[115%] -translate-y-[115%] -rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga2}
          alt="Bunga Kiri Atas"
          className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-lg"
          loading="eager"
        />
      </div>

      {/* 2. BUNGA 1: SUDUT KANAN ATAS */}
      <div
        className={`absolute top-0 right-0 origin-top-right transition-all duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen
            ? 'translate-x-[115%] -translate-y-[115%] rotate-12 opacity-0'
            : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga1}
          alt="Bunga Kanan Atas"
          className="w-44 sm:w-56 h-auto max-w-none select-none drop-shadow-lg"
          loading="eager"
        />
      </div>

      {/* 3. BUNGA 3: SISI KIRI */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 origin-left transition-all duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen
            ? '-translate-x-[120%] -rotate-6 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga3}
          alt="Bunga Sisi Kiri"
          className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-lg"
          loading="eager"
        />
      </div>

      {/* 4. BUNGA 4: SISI KANAN */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 origin-right transition-all duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen
            ? 'translate-x-[120%] rotate-6 opacity-0'
            : 'translate-x-0 rotate-0 opacity-100'
        }`}
      >
        <img
          src={bunga4}
          alt="Bunga Sisi Kanan"
          className="w-20 sm:w-28 h-auto max-h-[60vh] object-contain select-none drop-shadow-lg"
          loading="eager"
        />
      </div>
    </div>
  );
}
