import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Heart } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function CountdownSection({ targetDateStr }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useScrollReveal();

  useEffect(() => {
    const targetDate = new Date(`${targetDateStr || '2026-09-20'}T08:00:00`).getTime();

    const calculateTime = () => {
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
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <section className="w-full px-4 pt-8 pb-4 relative">
      <div className="w-full max-w-sm mx-auto space-y-3 text-center">
        {/* Header Countdown */}
        <div className="space-y-1 slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rosewood-100 text-rosewood-800 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-rosewood-600 animate-spin-slow" />
            <span>Menghitung Hari Bahagia</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-rosewood-900">
            Waktu Menuju Hari Pernikahan
          </h3>
          <p className="text-[11px] text-espresso-700">
            Tiada yang lebih berharga selain doa restu dan kehadiran Anda di hari istimewa kami.
          </p>
        </div>

        {/* 4 Counter Boxes */}
        <div className="grid grid-cols-4 gap-2.5 pt-1 slide-up">
          <div className="glass-card-romantic p-3 rounded-2xl border border-rosewood-200/90 shadow-md text-center transform hover:scale-105 transition">
            <div className="text-xl sm:text-2xl font-bold font-serif text-rosewood-800">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-espresso-700 uppercase font-bold tracking-wider mt-0.5">
              Hari
            </div>
          </div>

          <div className="glass-card-romantic p-3 rounded-2xl border border-rosewood-200/90 shadow-md text-center transform hover:scale-105 transition">
            <div className="text-xl sm:text-2xl font-bold font-serif text-rosewood-800">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-espresso-700 uppercase font-bold tracking-wider mt-0.5">
              Jam
            </div>
          </div>

          <div className="glass-card-romantic p-3 rounded-2xl border border-rosewood-200/90 shadow-md text-center transform hover:scale-105 transition">
            <div className="text-xl sm:text-2xl font-bold font-serif text-rosewood-800">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-espresso-700 uppercase font-bold tracking-wider mt-0.5">
              Menit
            </div>
          </div>

          <div className="glass-card-romantic p-3 rounded-2xl border border-rosewood-200/90 shadow-md text-center transform hover:scale-105 transition">
            <div className="text-xl sm:text-2xl font-bold font-serif text-rosewood-800">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-espresso-700 uppercase font-bold tracking-wider mt-0.5">
              Detik
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
