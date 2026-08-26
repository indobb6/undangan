import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, QrCode, Download, Send, User, Users, HeartHandshake, RefreshCw } from 'lucide-react';
import { submitRSVP, getAllGuests } from '../services/store';

export default function RsvpSection({ defaultGuestName, guestSlug }) {
  const [guestName, setGuestName] = useState(defaultGuestName || '');
  const [status, setStatus] = useState('hadir'); // 'hadir' | 'tidak_hadir'
  const [maritalStatus, setMaritalStatus] = useState('single'); // 'single' | 'married'
  const [wishes, setWishes] = useState('');
  
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allWishes, setAllWishes] = useState([]);

  useEffect(() => {
    if (defaultGuestName) {
      setGuestName(defaultGuestName);
    }
    loadWishes();
  }, [defaultGuestName]);

  const loadWishes = async () => {
    const guests = await getAllGuests();
    const wishesList = guests.filter((g) => g.wishes && g.wishes.trim().length > 0);
    setAllWishes(wishesList);

    // Check if current guest already submitted
    if (guestSlug || defaultGuestName) {
      const existing = guests.find((g) => g.slug === guestSlug || g.name.toLowerCase() === defaultGuestName.toLowerCase());
      if (existing && existing.status !== 'pending') {
        setSubmittedData(existing);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await submitRSVP({
        guestName: guestName.trim(),
        slug: guestSlug,
        status,
        marital_status: maritalStatus,
        wishes: wishes.trim()
      });

      setSubmittedData(result);
      loadWishes();

      // Trigger Celebration Confetti if attending
      if (status === 'hadir') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submit RSVP error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        downloadLink.download = `Voucher-Makan-${submittedData.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div id="rsvp" className="space-y-12 py-12 px-4 max-w-4xl mx-auto text-slate-100">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Konfirmasi Kehadiran</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          RSVP & Voucher Konsumsi
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
      </div>

      <div className="glass-card-gold p-6 sm:p-10 rounded-3xl border border-gold-500/40 shadow-2xl">
        {!submittedData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Nama */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block">
                Nama Lengkap Tamu
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-gold-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-400 transition"
              />
            </div>

            {/* Konfirmasi Kehadiran */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStatus('hadir')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    status === 'hadir'
                      ? 'bg-gold-500 text-slate-950 border-gold-400 font-bold shadow-lg shadow-gold-500/20'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-gold-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ya, Saya Hadir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('tidak_hadir')}
                  className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    status === 'tidak_hadir'
                      ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-lg shadow-rose-600/20'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-rose-500/40'
                  }`}
                >
                  <span>Maaf, Tidak Bisa Hadir</span>
                </button>
              </div>
            </div>

            {/* Status Pernikahan (Single vs Sudah Menikah) */}
            {status === 'hadir' && (
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Status Pernikahan / Jumlah Konsumsi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMaritalStatus('single')}
                    className={`p-4 rounded-xl border text-left space-y-1 transition ${
                      maritalStatus === 'single'
                        ? 'bg-amber-500/20 border-gold-400 text-gold-200 shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <User className="w-4 h-4 text-gold-400" />
                      <span>Single / Sendiri</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Mendapatkan <strong className="text-gold-300">1 Voucher Makan</strong>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaritalStatus('married')}
                    className={`p-4 rounded-xl border text-left space-y-1 transition ${
                      maritalStatus === 'married'
                        ? 'bg-amber-500/20 border-gold-400 text-gold-200 shadow-md'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Users className="w-4 h-4 text-gold-400" />
                      <span>Sudah Menikah</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Mendapatkan <strong className="text-gold-300">2 Voucher Makan</strong>
                    </p>
                  </button>
                </div>

                {/* Badge Penjelas Kuota */}
                <div className="bg-slate-900/90 border border-gold-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-gold-300">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gold-400" />
                    <span>Kuota Voucher Makan Anda:</span>
                  </div>
                  <span className="font-bold text-sm bg-gold-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {maritalStatus === 'married' ? '2 Porsi (Menikah)' : '1 Porsi (Single)'}
                  </span>
                </div>
              </div>
            )}

            {/* Ucapan & Doa */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block">
                Ucapan & Doa Restu
              </label>
              <textarea
                rows={3}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Tuliskan ucapan selamat dan doa untuk kedua mempelai..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-gold-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-400 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-slate-950 font-bold text-base shadow-lg shadow-gold-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Konfirmasi & Dapatkan QR Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* RESULT AFTER SUBMISSION (DISPLAY QR CODE & SUMMARY) */
          <div className="space-y-8 text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Konfirmasi Kehadiran Berhasil Disimpan</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-gold-200">
                Terima Kasih, {submittedData.name}!
              </h3>
              <p className="text-xs text-slate-300">
                {submittedData.status === 'hadir'
                  ? 'Berikut adalah QR Code Voucher Makan Anda. Tunjukkan QR Code ini kepada panitia/resepsionis di lokasi acara.'
                  : 'Terima kasih telah memberitahukan konfirmasi kehadiran Anda.'}
              </p>
            </div>

            {submittedData.status === 'hadir' && (
              <div className="space-y-6 max-w-sm mx-auto">
                {/* QR Box */}
                <div className="bg-white p-6 rounded-2xl shadow-xl inline-block border-4 border-gold-400">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={submittedData.qr_code_str}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="mt-3 text-xs font-mono font-bold text-slate-800 tracking-wider">
                    {submittedData.qr_code_str}
                  </p>
                </div>

                {/* Quota Summary Card */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-gold-500/30 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Status Pernikahan:</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {submittedData.marital_status === 'married' ? 'Sudah Menikah' : 'Single'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Hak Konsumsi / Makan:</span>
                    <span className="font-bold text-gold-300 bg-gold-500/20 px-2 py-0.5 rounded">
                      {submittedData.food_quota} Voucher Porsi
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Status Penukaran:</span>
                    <span className={`font-semibold ${submittedData.food_redeemed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {submittedData.food_redeemed ? '✓ Sudah Ditukarkan' : '⏳ Belum Ditukarkan'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadQR}
                    className="flex-1 py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh QR Voucher</span>
                  </button>
                  <button
                    onClick={() => setSubmittedData(null)}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Ubah Konfirmasi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest Wishes Board */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-1">
          <h3 className="font-serif text-2xl font-bold text-gold-300">
            Doa & Ucapan Dari Tamu Undangan
          </h3>
          <p className="text-xs text-slate-400">
            ({allWishes.length} Ucapan Terkirim)
          </p>
        </div>

        <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
          {allWishes.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6 italic">
              Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
            </p>
          ) : (
            allWishes.map((item, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl space-y-2 border border-gold-500/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gold-200">{item.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {item.status === 'hadir' ? '✓ Hadir' : '× Tidak Hadir'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{item.wishes}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
