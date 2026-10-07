import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Download, Send, User, Users, RefreshCw, MessageSquareQuote, Heart } from 'lucide-react';
import { submitRSVP, getAllGuests } from '../services/store';
import useScrollReveal from '../hooks/useScrollReveal';

export default function RsvpSection({ eventSlug, defaultGuestName, guestSlug, packageType = 'biasa', settings }) {
  const [guestName, setGuestName] = useState(defaultGuestName || '');
  const [status, setStatus] = useState('hadir');
  const [maritalStatus, setMaritalStatus] = useState('single');
  const [wishes, setWishes] = useState('');

  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allWishes, setAllWishes] = useState([]);

  useScrollReveal();

  const isIntimate = packageType === 'intimate';
  const groomName = settings?.groom_name?.split(',')[0]?.trim() || 'Mempelai Pria';
  const brideName = settings?.bride_name?.split(',')[0]?.trim() || 'Mempelai Wanita';

  useEffect(() => {
    if (defaultGuestName) {
      setGuestName(defaultGuestName);
    }
    loadWishes();
  }, [defaultGuestName, eventSlug]);

  const loadWishes = async () => {
    const guests = await getAllGuests(eventSlug);
    const wishesList = guests.filter((g) => g.wishes && g.wishes.trim().length > 0);
    // Tampilkan ucapan terbaru di paling atas
    setAllWishes([...wishesList].reverse());

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
        eventSlug,
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
        const prefix = isIntimate ? 'Voucher-Makan' : 'QR-Kehadiran';
        downloadLink.download = `${prefix}-${submittedData.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <section id="rsvp" className="min-h-screen w-full flex flex-col justify-center items-center py-12 pb-28 sm:pb-32 px-4 relative">
      <div className="w-full space-y-6 text-espresso-800 my-auto">
        <div className="text-center space-y-0.5 slide-up">
          <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">
            {isIntimate ? 'Konfirmasi Kehadiran' : 'Buku Tamu & Kehadiran'}
          </p>
          <h2 className="font-serif text-2xl font-bold text-rosewood-900">
            {isIntimate ? 'RSVP & Voucher Makan' : 'Konfirmasi Kehadiran (RSVP)'}
          </h2>
          <p className="text-[11px] text-espresso-700">
            {isIntimate
              ? 'Konfirmasi kehadiran Anda dan dapatkan QR Voucher penukaran hidangan.'
              : 'Konfirmasi kehadiran Anda dan dapatkan QR Pass Buku Tamu Digital.'}
          </p>
        </div>

        <div className="glass-card-romantic p-5 rounded-3xl border border-rosewood-200 shadow-xl slide-up">
          {!submittedData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-rosewood-900 block">
                  Nama Lengkap Tamu
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rosewood-200 text-espresso-800 placeholder-slate-400 focus:outline-none focus:border-rosewood-500 text-xs font-medium"
                />
              </div>

              {/* Konfirmasi Kehadiran */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-rosewood-900 block">
                  Konfirmasi Kehadiran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('hadir')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition ${
                      status === 'hadir'
                        ? 'bg-rosewood-700 text-white border-rosewood-700 shadow-md'
                        : 'bg-white border-rose-200 text-espresso-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ya, Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('tidak_hadir')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition ${
                      status === 'tidak_hadir'
                        ? 'bg-rose-800 text-white border-rose-800 shadow-md'
                        : 'bg-white border-rose-200 text-espresso-700'
                    }`}
                  >
                    <span>Tidak Hadir</span>
                  </button>
                </div>
              </div>

              {/* Status Pernikahan (Single vs Sudah Menikah) */}
              {status === 'hadir' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rosewood-900 block">
                    {isIntimate ? 'Status Pernikahan (Porsi Makan)' : 'Jumlah Kehadiran'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMaritalStatus('single')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        maritalStatus === 'single'
                          ? 'bg-rosewood-50 border-rosewood-500 text-rosewood-900 shadow-sm'
                          : 'bg-white border-rose-200 text-espresso-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <User className="w-3.5 h-3.5 text-rosewood-700" />
                        <span>Single</span>
                      </div>
                      <p className="text-[9px] text-rosewood-700 font-medium">
                        {isIntimate ? '1 Voucher Makan' : '1 Orang'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaritalStatus('married')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        maritalStatus === 'married'
                          ? 'bg-rosewood-50 border-rosewood-500 text-rosewood-900 shadow-sm'
                          : 'bg-white border-rose-200 text-espresso-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <Users className="w-3.5 h-3.5 text-rosewood-700" />
                        <span>Sudah Menikah</span>
                      </div>
                      <p className="text-[9px] text-rosewood-700 font-medium">
                        {isIntimate ? '2 Voucher Makan' : '2 Orang (Pasangan)'}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Ucapan & Doa */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-rosewood-900 block">
                  Ucapan & Doa Restu
                </label>
                <textarea
                  rows={2}
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Tuliskan ucapan..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rosewood-200 text-espresso-800 placeholder-slate-400 focus:outline-none focus:border-rosewood-500 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rosewood-700 via-rosewood-500 to-rosewood-700 text-white font-bold text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {isIntimate ? 'Kirim RSVP & Dapatkan Kupon Makan' : 'Kirim RSVP & Dapatkan QR Kehadiran'}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* RESULT AFTER SUBMISSION */
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>RSVP Berhasil</span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-lg font-serif font-bold text-rosewood-900">
                  Terima Kasih, {submittedData.name}!
                </h3>
              </div>

              {submittedData.status === 'hadir' && (
                <div className="space-y-3 max-w-xs mx-auto">
                  <div className="bg-white p-4 rounded-2xl shadow-md inline-block border-2 border-rosewood-300">
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={submittedData.qr_code_str}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                    <p className="mt-1 text-[10px] font-mono font-bold text-rosewood-900 tracking-wider">
                      {submittedData.qr_code_str}
                    </p>
                  </div>

                  <div className="bg-cream-100 p-3 rounded-xl border border-rosewood-200 text-left space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-espresso-700">Tipe Acara:</span>
                      <span className="font-bold text-rosewood-900">
                        {isIntimate ? 'Intimate (Akad Saja)' : 'Biasa (Akad & Resepsi)'}
                      </span>
                    </div>
                    {isIntimate ? (
                      <div className="flex justify-between items-center">
                        <span className="text-espresso-700">Hak Porsi Konsumsi:</span>
                        <span className="font-bold text-rosewood-700 bg-rosewood-100 px-2 py-0.5 rounded-full">
                          {submittedData.food_quota} Voucher Porsi
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-espresso-700">Fungsi QR Code:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Scan Kehadiran (Buku Tamu)
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-espresso-700 italic">
                    {isIntimate
                      ? '*Tunjukkan QR ini kepada petugas katering / penerima tamu untuk penukaran hidangan.'
                      : '*Tunjukkan kode QR ini kepada penerima tamu saat tiba di lokasi untuk pencatatan buku tamu.'}
                  </p>

                  <button
                    onClick={downloadQR}
                    className="w-full py-2.5 px-3 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isIntimate ? 'Unduh QR Voucher Makan' : 'Unduh QR Buku Tamu'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DAFTAR UCAPAN & DOA RESTU DARI TAMU UNDANGAN */}
        <div className="glass-card-romantic p-5 sm:p-6 rounded-3xl border border-rosewood-200 shadow-xl space-y-4 slide-up">
          <div className="flex items-center justify-between border-b border-rosewood-100 pb-3">
            <div className="flex items-center gap-2 text-rosewood-900 font-serif font-bold text-sm sm:text-base">
              <MessageSquareQuote className="w-4 h-4 text-rosewood-700" />
              <span>Ucapan & Doa Restu</span>
            </div>
            <span className="text-[11px] font-bold text-rosewood-700 bg-rosewood-100 px-2.5 py-0.5 rounded-full border border-rosewood-200">
              {allWishes.length} Pesan
            </span>
          </div>

          {/* Daftar Pesan Scrollable */}
          <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-3 pr-1 divide-y divide-rosewood-100/60">
            {allWishes.length === 0 ? (
              <div className="text-center py-6 text-espresso-700/70 space-y-1">
                <Heart className="w-7 h-7 text-rosewood-300 mx-auto animate-pulse" />
                <p className="text-xs font-semibold text-rosewood-900">Belum Ada Ucapan</p>
                <p className="text-[11px] text-espresso-600">
                  Jadilah yang pertama mengirimkan ucapan & doa restu untuk kedua mempelai di atas.
                </p>
              </div>
            ) : (
              allWishes.map((item, idx) => (
                <div key={item.id || idx} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rosewood-500 to-champagne-400 text-white flex items-center justify-center font-bold text-xs font-serif shrink-0 shadow-sm">
                        {item.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <span className="font-bold text-xs text-rosewood-950 font-serif">
                        {item.name}
                      </span>
                    </div>

                    {item.status === 'hadir' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Hadir</span>
                      </span>
                    ) : item.status === 'tidak_hadir' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <span>Berhalangan</span>
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-espresso-800 leading-relaxed font-normal bg-cream-50/70 p-3 rounded-xl border border-rosewood-100/80 whitespace-pre-line">
                    "{item.wishes}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* UCAPAN PENUTUP HANGAT & TERIMA KASIH DARI MEMPELAI        */}
        {/* ========================================================= */}
        <div className="glass-card-romantic p-6 sm:p-7 rounded-3xl border border-rosewood-200 shadow-xl space-y-4 text-center slide-up">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rosewood-300"></div>
            <Heart className="w-4 h-4 text-rosewood-500 fill-rosewood-400" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rosewood-300"></div>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-rosewood-900">
              Ungkapan Terima Kasih
            </h3>
            <p className="text-xs text-espresso-700 leading-relaxed max-w-xs mx-auto">
              Merupakan suatu kehormatan dan kebahagiaan yang tak terhingga bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu bagi langkah awal kehidupan pernikahan kami.
            </p>
            <p className="text-xs text-espresso-700 leading-relaxed max-w-xs mx-auto pt-1">
              Atas kehadiran, doa restu, dan ketulusan hati Bapak/Ibu/Saudara/i sekalian, kami mengucapkan terima kasih yang setulus-tulusnya. Semoga Allah SWT senantiasa melimpahkan berkah dan kebaikan untuk kita semua.
            </p>
          </div>

          <div className="pt-3 border-t border-rosewood-100/80 space-y-2">
            <p className="text-[11px] font-medium text-rosewood-800 italic">
              Wassalamu'alaikum Warahmatullahi Wabarakatuh
            </p>
            <div className="pt-1">
              <p className="text-[10px] uppercase tracking-widest text-rosewood-600 font-semibold">
                Kami Yang Berbahagia,
              </p>
              <h4 className="font-script text-2xl sm:text-3xl text-rosewood-800 font-bold pt-1">
                {groomName} &amp; {brideName}
              </h4>
              <p className="text-[10px] text-espresso-600 pt-0.5">
                Beserta Seluruh Keluarga Besar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
