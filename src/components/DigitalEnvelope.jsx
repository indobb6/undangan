import React, { useState } from 'react';
import { CreditCard, Copy, Check } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function DigitalEnvelope({ settings }) {
  const [copiedAccount, setCopiedAccount] = useState(null);

  useScrollReveal();

  const copyToClipboard = (accNum, type) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  return (
    <section id="gift" className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 relative">
      <div className="w-full space-y-6 text-espresso-800 my-auto">
        <div className="text-center space-y-1 slide-up">
          <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Tanda Kasih</p>
          <h2 className="font-serif text-2xl font-bold text-rosewood-900">
            Amplop Digital & Hadiah
          </h2>
          <p className="text-xs text-espresso-700 max-w-xs mx-auto">
            Doa Restu Anda merupakan karunia terbesar bagi kami. Namun jika Anda ingin memberikan hadiah cashless, dapat melalui rekening berikut:
          </p>
        </div>

        <div className="space-y-4">
          {/* Bank 1 - Slide Left */}
          {settings.bank_account && (
            <div className="glass-card-romantic p-6 rounded-2xl border border-rosewood-200 shadow-lg space-y-3 relative overflow-hidden slide-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rosewood-700" />
                  <span className="font-bold text-sm text-rosewood-900">{settings.bank_name || 'Bank BCA'}</span>
                </div>
                <span className="text-[9px] text-rosewood-700 font-bold uppercase tracking-widest bg-rosewood-100 px-2 py-0.5 rounded-full">
                  Amplop Digital
                </span>
              </div>

              <div className="space-y-1 py-1">
                <p className="font-mono text-xl font-bold text-rosewood-900 tracking-wider">
                  {settings.bank_account}
                </p>
                <p className="text-xs text-espresso-700 font-medium">
                  a.n {settings.bank_owner || settings.groom_name}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(settings.bank_account, 'bank1')}
                className="w-full py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                {copiedAccount === 'bank1' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Nomor Rekening Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Nomor Rekening</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bank 2 - Slide Right */}
          {settings.bank_account_2 && (
            <div className="glass-card-romantic p-6 rounded-2xl border border-rosewood-200 shadow-lg space-y-3 relative overflow-hidden slide-right">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rosewood-700" />
                  <span className="font-bold text-sm text-rosewood-900">{settings.bank_name_2 || 'Bank Mandiri'}</span>
                </div>
                <span className="text-[9px] text-rosewood-700 font-bold uppercase tracking-widest bg-rosewood-100 px-2 py-0.5 rounded-full">
                  Amplop Digital
                </span>
              </div>

              <div className="space-y-1 py-1">
                <p className="font-mono text-xl font-bold text-rosewood-900 tracking-wider">
                  {settings.bank_account_2}
                </p>
                <p className="text-xs text-espresso-700 font-medium">
                  a.n {settings.bank_owner_2 || settings.bride_name}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(settings.bank_account_2, 'bank2')}
                className="w-full py-2.5 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                {copiedAccount === 'bank2' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Nomor Rekening Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Nomor Rekening</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
