import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { QrCode, X, Search, CheckCircle2, AlertTriangle, RefreshCw, Utensils, Ticket, Camera, SwitchCamera } from 'lucide-react';
import { getGuestByQR, redeemFoodVoucher } from '../services/store';

export default function QRScannerModal({ onClose }) {
  const [manualCode, setManualCode] = useState('');
  const [scannedGuest, setScannedGuest] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

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

  const handleRedeem = async () => {
    if (!scannedGuest) return;
    setIsRedeeming(true);

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
      setIsRedeeming(false);
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 selection:bg-gold-500 selection:text-slate-900">
      <div className="glass-card-gold w-full max-w-lg rounded-3xl border border-gold-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold uppercase">
            <QrCode className="w-3.5 h-3.5" />
            <span>Pemindai QR Code Resepsionis</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Penukaran Voucher Makan
          </h2>
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
                Atau Masukkan Kode QR Manual:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Contoh: WED-BUDI-1234..."
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

        {/* SCANNED GUEST RESULT & VOUCHER REDEMPTION CARD */}
        {scannedGuest && (
          <div className="glass-card p-6 rounded-2xl border border-gold-500/40 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center mx-auto text-gold-300">
              <Utensils className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Data Tamu Undangan</span>
              <h3 className="font-serif text-2xl font-bold text-gold-200">
                {scannedGuest.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Kode: {scannedGuest.qr_code_str}
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl space-y-2 text-left text-xs border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status Kehadiran:</span>
                <span className="font-semibold text-emerald-400 capitalize">
                  {scannedGuest.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status Pernikahan:</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {scannedGuest.marital_status === 'married' ? 'Sudah Menikah' : 'Single'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                <span className="text-slate-300 font-semibold">Hak Porsi Konsumsi:</span>
                <span className="font-bold text-sm text-gold-300 bg-gold-500/20 px-2.5 py-0.5 rounded-full">
                  {scannedGuest.food_quota || 1} Voucher Porsi
                </span>
              </div>
            </div>

            {/* Redemption Status */}
            {scannedGuest.food_redeemed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-1">
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Voucher Sudah Ditukarkan</span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  Ditukarkan pada: {new Date(scannedGuest.redeemed_at).toLocaleTimeString('id-ID')}
                </p>
              </div>
            ) : (
              <button
                onClick={handleRedeem}
                disabled={isRedeeming}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isRedeeming ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    <span>Tukarkan {scannedGuest.food_quota || 1} Voucher Makan</span>
                  </>
                )}
              </button>
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
