import React, { useState } from 'react';
import { Gift, CreditCard, Copy, Check, Heart } from 'lucide-react';

export default function DigitalEnvelope({ settings }) {
  const [copiedAccount, setCopiedAccount] = useState(null);

  const copyToClipboard = (accNum, type) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  return (
    <div id="gift" className="space-y-8 py-12 px-4 max-w-xl mx-auto text-slate-100">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Tanda Kasih</p>
        <h2 className="font-serif text-3xl font-bold text-slate-100">
          Amplop Digital & Hadiah
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Doa Restu Anda merupakan karunia yang sangat berharga bagi kami. Namun jika Anda ingin memberikan hadiah, Anda dapat mengunduh voucher cashless / transfer di bawah ini:
        </p>
      </div>

      <div className="space-y-4">
        {/* Bank 1 */}
        {settings.bank_account && (
          <div className="glass-card-gold p-6 rounded-2xl border border-gold-500/40 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-400" />
                <span className="font-bold text-sm text-gold-200">{settings.bank_name || 'Bank BCA'}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Digital Envelope</span>
            </div>

            <div className="space-y-1 py-1">
              <p className="font-mono text-xl font-bold text-slate-100 tracking-wider">
                {settings.bank_account}
              </p>
              <p className="text-xs text-slate-300">
                a.n {settings.bank_owner || settings.groom_name}
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(settings.bank_account, 'bank1')}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {copiedAccount === 'bank1' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
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

        {/* Bank 2 */}
        {settings.bank_account_2 && (
          <div className="glass-card-gold p-6 rounded-2xl border border-gold-500/40 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-400" />
                <span className="font-bold text-sm text-gold-200">{settings.bank_name_2 || 'Bank Mandiri'}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Digital Envelope</span>
            </div>

            <div className="space-y-1 py-1">
              <p className="font-mono text-xl font-bold text-slate-100 tracking-wider">
                {settings.bank_account_2}
              </p>
              <p className="text-xs text-slate-300">
                a.n {settings.bank_owner_2 || settings.bride_name}
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(settings.bank_account_2, 'bank2')}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {copiedAccount === 'bank2' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
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
  );
}
