import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Download, Send, User, Users, RefreshCw } from 'lucide-react';
import { submitRSVP, getAllGuests } from '../services/store';

export default function RsvpSection({ defaultGuestName, guestSlug }) {
  const [guestName, setGuestName] = useState(defaultGuestName || '');
  const [status, setStatus] = useState('hadir');
  const [maritalStatus, setMaritalStatus] = useState('single');
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

      if (status === 'hadir') {
        confetti({
          particleCount: 90,
          spread: 80,
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
    <div id="rsvp" className="space-y-8 py-8 px-4 max-w-xl mx-auto text-espresso-800 animate-fade-in-up">
      <div className="text-center space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">Konfirmasi Kehadiran</p>
        <h2 className="font-serif text-2xl font-bold text-rosewood-900">
          RSVP & Voucher Makan
        </h2>
        <p className="text-xs text-espresso-700 max-w-xs mx-auto">
          Mohon isi konfirmasi kehadiran Anda di bawah ini untuk mendapatkan Kode QR Voucher Makan.
        </p>
      </div>

      <div className="glass-card-romantic p-6 sm:p-8 rounded-3xl border border-rosewood-200 shadow-xl">
        {!submittedData ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rosewood-900 block">
                Nama Lengkap Tamu
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewood-200 text-espresso-800 placeholder-slate-400 focus:outline-none focus:border-rosewood-500 text-xs font-medium"
              />
            </div>

            {/* Konfirmasi Kehadiran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rosewood-900 block">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('hadir')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    status === 'hadir'
                      ? 'bg-rosewood-700 text-white border-rosewood-700 shadow-md'
                      : 'bg-white border-rose-200 text-espresso-700 hover:border-rosewood-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ya, Saya Hadir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('tidak_hadir')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    status === 'tidak_hadir'
                      ? 'bg-rose-800 text-white border-rose-800 shadow-md'
                      : 'bg-white border-rose-200 text-espresso-700 hover:border-rose-300'
                  }`}
                >
                  <span>Maaf, Tidak Hadir</span>
                </button>
              </div>
            </div>

            {/* Status Pernikahan (Single vs Sudah Menikah) */}
            {status === 'hadir' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-rosewood-900 block">
                  Status Pernikahan / Jumlah Porsi Makan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMaritalStatus('single')}
                    className={`p-3 rounded-xl border text-left space-y-0.5 transition ${
                      maritalStatus === 'single'
                        ? 'bg-rosewood-50 border-rosewood-500 text-rosewood-900 shadow-sm'
                        : 'bg-white border-rose-200 text-espresso-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <User className="w-3.5 h-3.5 text-rosewood-700" />
                      <span>Single / Sendiri</span>
                    </div>
                    <p className="text-[10px] text-rosewood-700 font-medium">
                      Mendapatkan <strong>1 Voucher Makan</strong>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaritalStatus('married')}
                    className={`p-3 rounded-xl border text-left space-y-0.5 transition ${
                      maritalStatus === 'married'
                        ? 'bg-rosewood-50 border-rosewood-500 text-rosewood-900 shadow-sm'
                        : 'bg-white border-rose-200 text-espresso-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Users className="w-3.5 h-3.5 text-rosewood-700" />
                      <span>Sudah Menikah</span>
                    </div>
                    <p className="text-[10px] text-rosewood-700 font-medium">
                      Mendapatkan <strong>2 Voucher Makan</strong>
                    </p>
                  </button>
                </div>

                <div className="bg-rosewood-50 border border-rosewood-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-rosewood-900 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-rosewood-700" />
                    <span>Kuota Voucher Makan:</span>
                  </div>
                  <span className="font-bold text-xs bg-rosewood-700 text-white px-2.5 py-0.5 rounded-full">
                    {maritalStatus === 'married' ? '2 Porsi (Menikah)' : '1 Porsi (Single)'}
                  </span>
                </div>
              </div>
            )}

            {/* Ucapan & Doa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rosewood-900 block">
                Ucapan & Doa Restu
              </label>
              <textarea
                rows={3}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewood-200 text-espresso-800 placeholder-slate-400 focus:outline-none focus:border-rosewood-500 text-xs font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rosewood-700 via-rosewood-500 to-rosewood-700 text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim RSVP & Dapatkan QR Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* RESULT AFTER SUBMISSION */
          <div className="space-y-6 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Konfirmasi Kehadiran Berhasil</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-rosewood-900">
                Terima Kasih, {submittedData.name}!
              </h3>
              <p className="text-xs text-espresso-700">
                {submittedData.status === 'hadir'
                  ? 'Berikut adalah QR Code Voucher Makan Anda. Tunjukkan QR Code ini kepada panitia/resepsionis di lokasi acara.'
                  : 'Terima kasih telah memberitahukan konfirmasi kehadiran Anda.'}
              </p>
            </div>

            {submittedData.status === 'hadir' && (
              <div className="space-y-4 max-w-xs mx-auto">
                {/* QR Box */}
                <div className="bg-white p-5 rounded-2xl shadow-lg inline-block border-2 border-rosewood-300">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={submittedData.qr_code_str}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="mt-2 text-xs font-mono font-bold text-rosewood-900 tracking-wider">
                    {submittedData.qr_code_str}
                  </p>
                </div>

                {/* Quota Summary Card */}
                <div className="bg-cream-100 p-4 rounded-xl border border-rosewood-200 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-espresso-700 font-medium">Status Pernikahan:</span>
                    <span className="font-bold text-rosewood-900 capitalize">
                      {submittedData.marital_status === 'married' ? 'Sudah Menikah' : 'Single'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-espresso-700 font-medium">Hak Porsi Konsumsi:</span>
                    <span className="font-bold text-rosewood-700 bg-rosewood-100 px-2 py-0.5 rounded-full">
                      {submittedData.food_quota} Voucher Porsi
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-espresso-700 font-medium">Status Penukaran:</span>
                    <span className={`font-bold ${submittedData.food_redeemed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {submittedData.food_redeemed ? '✓ Sudah Ditukarkan' : '⏳ Belum Ditukarkan'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadQR}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh QR Voucher</span>
                  </button>
                  <button
                    onClick={() => setSubmittedData(null)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-cream-200 text-espresso-800 border border-rosewood-200 text-xs font-bold transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Ubah</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest Wishes Board */}
      <div className="space-y-4 pt-4">
        <div className="text-center space-y-0.5">
          <h3 className="font-serif text-xl font-bold text-rosewood-900">
            Doa & Ucapan Tamu Undangan
          </h3>
          <p className="text-[11px] text-rosewood-700 font-semibold">
            ({allWishes.length} Ucapan Terkirim)
          </p>
        </div>

        <div className="grid gap-3 max-h-80 overflow-y-auto pr-1">
          {allWishes.length === 0 ? (
            <p className="text-center text-xs text-espresso-700/60 py-4 italic">
              Belum ada ucapan. Berikan doa restu Anda pertama kali!
            </p>
          ) : (
            allWishes.map((item, idx) => (
              <div key={idx} className="glass-card-romantic p-4 rounded-2xl space-y-1.5 border border-rosewood-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rosewood-900">{item.name}</span>
                  <span className="text-[9px] font-semibold text-rosewood-700 bg-rosewood-100 px-2 py-0.5 rounded-full">
                    {item.status === 'hadir' ? '✓ Hadir' : '× Tidak Hadir'}
                  </span>
                </div>
                <p className="text-xs text-espresso-700 italic leading-relaxed">
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
