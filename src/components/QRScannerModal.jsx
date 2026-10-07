import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  QrCode, X, Search, CheckCircle2, AlertTriangle, RefreshCw, 
  Utensils, Ticket, Camera, BookOpen, UserCheck, Users, Calendar
} from 'lucide-react';
import { getGuestByQR, redeemFoodVoucher, checkInGuest } from '../services/store';

export default function QRScannerModal({ onClose, eventSlug, settings }) {
  const [manualCode, setManualCode] = useState('');
  const [scannedGuest, setScannedGuest] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Default mode sesuai paket acara yang dipilih di pengaturan acara
  const initialMode = settings?.package_type || 'biasa';
  const [scannerMode, setScannerMode] = useState(initialMode); // 'biasa' (Buku Tamu) | 'intimate' (Voucher Makan)

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Discover available cameras
    Html5Qrcode.getCameras()
      .then((deviceList) => {
        if (!isMounted) return;
        if (deviceList && deviceList.length > 0) {
          setCameras(deviceList);
          // Prefer back/environment camera if available
          const backCam = deviceList.find(
            (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear') || c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : deviceList[0].id);
        } else {
          setCameraError('Tidak ada kamera yang terdeteksi di perangkat Anda.');
        }
      })
      .catch((err) => {
        console.error('Camera discovery error:', err);
        if (isMounted) {
          setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser dan situs diakses via HTTPS / localhost.');
        }
      });

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraId) => {
    setCameraError(null);
    setErrorMessage('');

    // Stop existing instance if any
    await stopScanner();

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleVerifyQR(decodedText);
          stopScanner();
        },
        (error) => {
          // Ignore scanning frame errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setCameraError(`Gagal membuka kamera (${err?.message || err}). Silakan coba pilih kamera lain atau gunakan input manual.`);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Stop scanner warning:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleVerifyQR = async (code) => {
    setErrorMessage('');
    setScannedGuest(null);

    const guest = await getGuestByQR(code);
    if (guest) {
      setScannedGuest(guest);
    } else {
      setErrorMessage(`Kode QR "${code}" tidak ditemukan dalam sistem!`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleVerifyQR(manualCode.trim());
  };

  // 1. Aksi Check-in Kehadiran / Buku Tamu (Paket Biasa)
  const handleCheckIn = async () => {
    if (!scannedGuest) return;
    setIsProcessing(true);
    try {
      const updated = await checkInGuest(scannedGuest.id);
      if (updated) {
        setScannedGuest(updated);
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6']
        });
      }
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Aksi Penukaran Voucher Makan (Paket Intimate)
  const handleRedeem = async () => {
    if (!scannedGuest) return;
    setIsProcessing(true);

    try {
      const updated = await redeemFoodVoucher(scannedGuest.id);
      if (updated) {
        setScannedGuest(updated);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      console.error('Redeem error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedGuest(null);
    setErrorMessage('');
    setManualCode('');
    if (selectedCameraId) {
      startScanner(selectedCameraId);
    }
  };

  const isIntimateMode = scannerMode === 'intimate';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 selection:bg-rosewood-500 selection:text-slate-900">
      <div className="glass-card-gold w-full max-w-lg rounded-3xl border border-gold-500/40 p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold uppercase">
            <QrCode className="w-3.5 h-3.5" />
            <span>Pemindai QR Resepsionis</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            {isIntimateMode ? 'Penukaran Voucher Makan' : 'Scan Kehadiran / Buku Tamu'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {isIntimateMode 
              ? 'Mode Acara Intimate: Penukaran kupon konsumsi hidangan'
              : 'Mode Acara Biasa: Pencatatan kehadiran digital tamu di lokasi'}
          </p>
        </div>

        {/* Toggle Mode Scanner (Biasa vs Intimate) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setScannerMode('biasa');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              scannerMode === 'biasa'
                ? 'bg-rosewood-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mode Biasa (Buku Tamu)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScannerMode('intimate');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              scannerMode === 'intimate'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Mode Intimate (Voucher)</span>
          </button>
        </div>

        {/* CAMERA SCANNER DISPLAY */}
        {!scannedGuest && (
          <div className="space-y-4">
            {/* Camera Select Dropdown / Trigger */}
            {cameras.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startScanner(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-gold-500"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      📷 {cam.label || `Kamera ${cam.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => startScanner(selectedCameraId)}
                  className="py-2 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Mulai Ulang' : 'Buka Kamera'}</span>
                </button>
              </div>
            )}

            {/* Video Viewport Container */}
            <div className="bg-slate-900 p-2 rounded-2xl border border-gold-500/20 overflow-hidden min-h-[260px] relative flex flex-col items-center justify-center">
              <div id="qr-reader" className="w-full text-xs text-slate-300" />

              {!isScanning && !cameraError && (
                <div className="text-center p-6 space-y-3">
                  <Camera className="w-12 h-12 text-gold-400 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-300">
                    Klik tombol di bawah ini untuk mengaktifkan kamera scanner QR.
                  </p>
                  <button
                    onClick={() => startScanner(selectedCameraId)}
                    className="py-2.5 px-6 rounded-xl bg-gold-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Izinkan & Buka Kamera</span>
                  </button>
                </div>
              )}

              {cameraError && (
                <div className="p-4 text-center text-xs text-amber-300 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p>{cameraError}</p>
                </div>
              )}
            </div>

            {/* Manual Code Input */}
            <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-300 block font-semibold">
                Atau Masukkan Kode QR Tamu Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Contoh: WED-FAUZ-1234..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 uppercase placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ERROR MSG */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs space-y-2 text-center">
            <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
            <p className="font-semibold">{errorMessage}</p>
            <button
              onClick={resetScanner}
              className="text-[11px] underline text-rose-300 hover:text-rose-100"
            >
              Coba Pindai Lagi
            </button>
          </div>
        )}

        {/* SCANNED GUEST RESULT CARD */}
        {scannedGuest && (
          <div className="glass-card p-6 rounded-2xl border border-gold-500/40 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center mx-auto text-gold-300">
              {isIntimateMode ? (
                <Utensils className="w-8 h-8" />
              ) : (
                <UserCheck className="w-8 h-8 text-emerald-400" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                Data Tamu Terverifikasi
              </span>
              <h3 className="font-serif text-2xl font-bold text-gold-200">
                {scannedGuest.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Kode: {scannedGuest.qr_code_str}
              </p>
            </div>

            {/* DETAILS CONTAINER */}
            <div className="bg-slate-900/90 p-4 rounded-xl space-y-2 text-left text-xs border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status RSVP:</span>
                <span className={`font-semibold capitalize ${
                  scannedGuest.status === 'hadir' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {scannedGuest.status === 'hadir' ? '✓ Konfirmasi Hadir' : scannedGuest.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  {isIntimateMode ? 'Status Pernikahan:' : 'Kapasitas Kehadiran:'}
                </span>
                <span className="font-semibold text-slate-200 capitalize">
                  {scannedGuest.marital_status === 'married' 
                    ? (isIntimateMode ? 'Sudah Menikah (2 Porsi)' : '2 Orang (Pasangan)')
                    : (isIntimateMode ? 'Single (1 Porsi)' : '1 Orang')}
                </span>
              </div>

              {isIntimateMode ? (
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-slate-300 font-semibold">Hak Porsi Konsumsi:</span>
                  <span className="font-bold text-sm text-gold-300 bg-gold-500/20 px-2.5 py-0.5 rounded-full">
                    {scannedGuest.food_quota || 1} Voucher Porsi
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-slate-300 font-semibold">Status Buku Tamu:</span>
                  <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                    scannedGuest.checkin 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {scannedGuest.checkin ? '✓ Sudah Check-in Hadir' : 'Belum Check-in'}
                  </span>
                </div>
              )}

              {scannedGuest.wishes && (
                <div className="border-t border-slate-800 pt-2 mt-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Ucapan Tamu:</span>
                  <p className="text-[11px] text-slate-300 italic bg-slate-950 p-2 rounded-lg border border-slate-800">
                    "{scannedGuest.wishes}"
                  </p>
                </div>
              )}
            </div>

            {/* ACTION SECTION: INTIMATE (REDEEM FOOD) VS BIASA (CHECK-IN GUEST BOOK) */}
            {isIntimateMode ? (
              /* INTIMATE MODE: PENUKARAN VOUCHER MAKAN */
              scannedGuest.food_redeemed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Voucher Makanan Sudah Ditukarkan</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Ditukarkan pada: {scannedGuest.redeemed_at ? new Date(scannedGuest.redeemed_at).toLocaleTimeString('id-ID') : 'Hari ini'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRedeem}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" />
                      <span>Tukarkan {scannedGuest.food_quota || 1} Voucher Makan</span>
                    </>
                  )}
                </button>
              )
            ) : (
              /* BIASA MODE: SCAN KEHADIRAN / BUKU TAMU */
              scannedGuest.checkin ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Kehadiran Sudah Tercatat di Buku Tamu</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Waktu Kedatangan: {scannedGuest.checkin_at ? new Date(scannedGuest.checkin_at).toLocaleTimeString('id-ID') : 'Hari ini'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Konfirmasi Check-in Kehadiran (Buku Tamu)</span>
                    </>
                  )}
                </button>
              )
            )}

            <button
              onClick={resetScanner}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Pindai Tamu Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

