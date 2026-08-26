import React, { useState, useEffect } from 'react';
import CoverSection from './components/CoverSection';
import InvitationContent from './components/InvitationContent';
import RsvpSection from './components/RsvpSection';
import AdminPanel from './components/AdminPanel';
import QRScannerModal from './components/QRScannerModal';
import MusicPlayer from './components/MusicPlayer';
import { getWeddingSettings } from './services/store';
import { Settings, QrCode } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSlug, setGuestSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [startMusic, setStartMusic] = useState(false);

  useEffect(() => {
    // 1. Fetch wedding settings
    getWeddingSettings().then(setSettings);

    // 2. Extract guest name or slug from URL query params
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || params.get('nama') || params.get('guest');
    const slugParam = params.get('slug');

    if (toParam) {
      setGuestName(toParam);
    } else if (slugParam) {
      setGuestSlug(slugParam);
      // Format slug back to title case name fallback
      const formatted = slugParam.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setGuestName(formatted);
    } else {
      setGuestName('Tamu Undangan');
    }

    // Auto open admin if URL contains ?admin=true
    if (params.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setStartMusic(true);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gold-300 font-serif text-lg">
        Memuat Undangan Pernikahan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-gold-500 selection:text-slate-900 font-sans">
      {/* Top Floating Admin & Scanner Toggle Buttons */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowScanner(true)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-gold-400 border border-gold-500/30 backdrop-blur-md transition shadow-lg"
          title="Buka QR Scanner"
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-gold-400 border border-gold-500/30 backdrop-blur-md transition shadow-lg"
          title="Buka Panel Admin"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {!isOpen ? (
        /* FIRST SECTION (COVER PAGE) */
        <CoverSection
          settings={settings}
          guestName={guestName}
          onOpenInvitation={handleOpenInvitation}
        />
      ) : (
        /* MAIN INVITATION BODY & RSVP */
        <div className="relative pb-24 animate-fadeIn">
          {/* Hero Header Banner */}
          <div className="py-16 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-gold-500/20 px-4">
            <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">The Wedding of</p>
            <h1 className="font-script text-5xl sm:text-6xl text-gold-gradient py-1">
              {settings.groom_name?.split(',')[0]} & {settings.bride_name?.split(',')[0]}
            </h1>
            <p className="text-xs text-slate-400">
              {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '12 September 2026'}
            </p>
          </div>

          <InvitationContent settings={settings} />

          <RsvpSection defaultGuestName={guestName} guestSlug={guestSlug} />

          <MusicPlayer musicUrl={settings.music_url} autoPlayTrigger={startMusic} />
        </div>
      )}

      {/* ADMIN PANEL MODAL */}
      {showAdmin && (
        <AdminPanel
          onClose={() => {
            setShowAdmin(false);
            getWeddingSettings().then(setSettings);
          }}
          onOpenScanner={() => {
            setShowAdmin(false);
            setShowScanner(true);
          }}
        />
      )}

      {/* QR SCANNER MODAL */}
      {showScanner && (
        <QRScannerModal onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
