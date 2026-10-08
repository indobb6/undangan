import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { verifyAdminPassword, setAdminSessionAuthenticated } from '../utils/adminAuth';

export default function AdminAuthModal({
  isOpen,
  onSuccess,
  onClose,
  isClientMode,
  eventSettings,
  eventSlug
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Silakan masukkan password admin.');
      triggerShake();
      return;
    }

    const isValid = verifyAdminPassword({
      password,
      eventSettings
    });

    if (isValid) {
      setErrorMsg('');
      setAdminSessionAuthenticated(true);
      onSuccess();
    } else {
      setErrorMsg('Password salah! Silakan coba lagi.');
      triggerShake();
      inputRef.current?.select();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const coupleTitle = eventSettings?.groom_name && eventSettings?.bride_name
    ? `${eventSettings.groom_name.split(',')[0]} & ${eventSettings.bride_name.split(',')[0]}`
    : (eventSlug || 'Acara Undangan');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md bg-slate-900 border border-rosewood-400/40 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-transform duration-200 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rosewood-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rosewood-600 to-rose-400 p-0.5 shadow-lg shadow-rosewood-900/50">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-rose-300">
                  <Lock className="w-8 h-8 animate-pulse text-rose-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-rose-200 tracking-wide">
                Panel Admin Terkunci
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isClientMode ? (
                  <>Akses dibatasi untuk panitia acara <strong>{coupleTitle}</strong>.</>
                ) : (
                  <>Masukkan kata sandi untuk mengelola data undangan & tamu pernikahan.</>
                )}
              </p>
            </div>
          </div>

          {/* Form Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                <span>Password Admin</span>
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Ketik password di sini..."
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-slate-950 border text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none transition font-sans ${
                    errorMsg
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-lg transition"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error feedback */}
              {errorMsg && (
                <div className="mt-2.5 px-3 py-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Hint default password for first-time use */}
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <span className="text-amber-400 font-bold">💡</span>
              <div className="leading-snug">
                Password bawaan awal adalah <code className="px-1.5 py-0.5 rounded bg-slate-900 text-rose-300 font-mono font-bold">admin123</code>. Anda dapat mengubahnya kapan saja di dalam tab Pengaturan.
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rosewood-600 to-rosewood-500 hover:from-rosewood-500 hover:to-rosewood-400 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rosewood-950/50 transition cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-rose-200" />
                <span>Masuk Panel Admin</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 active:scale-[0.99] text-slate-400 hover:text-slate-200 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Undangan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
