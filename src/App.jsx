import React, { useState, useEffect } from 'react';
import CoverSection from './components/CoverSection';
import InvitationContent from './components/InvitationContent';
import RsvpSection from './components/RsvpSection';
import AdminPanel from './components/AdminPanel';
import QRScannerModal from './components/QRScannerModal';
import MusicPlayer from './components/MusicPlayer';
import DigitalEnvelope from './components/DigitalEnvelope';
import { getWeddingSettings } from './services/store';
import { Settings, QrCode, Heart, Calendar, MapPin, Gift, Mail } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSlug, setGuestSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [startMusic, setStartMusic] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    getWeddingSettings().then(setSettings);

    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || params.get('nama') || params.get('guest');
    const slugParam = params.get('slug');

    if (toParam) {
      setGuestName(toParam);
    } else if (slugParam) {
      setGuestSlug(slugParam);
      const formatted = slugParam.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setGuestName(formatted);
    } else {
      setGuestName('M Yaser');
    }

    if (params.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setStartMusic(true);
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gold-300 font-serif text-lg">
        Memuat Undangan Inviglory...
      </div>
    );
  }

  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-x-hidden">
      {/* DESKTOP BACKGROUND BACKDROP */}
      <div 
        className="fixed inset-0 bg-cover bg-center filter blur-xl opacity-30 pointer-events-none transform scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80')`
        }}
      />
      <div className="fixed inset-0 bg-slate-950/80 pointer-events-none" />

      {/* TOP FLOATING ADMIN & SCANNER BUTTONS */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowScanner(true)}
          className="p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-gold-400 border border-gold-500/40 shadow-2xl backdrop-blur-md transition"
          title="Buka QR Scanner"
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className="p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-gold-400 border border-gold-500/40 shadow-2xl backdrop-blur-md transition"
          title="Buka Panel Admin"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* MOBILE FRAME VIEWPORT CONTAINER (INVIGLORY STYLE) */}
      <div className="w-full max-w-[480px] min-h-screen sm:min-h-[92vh] sm:my-4 sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 bg-slate-950 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:ring-1 sm:ring-gold-500/30">
        {!isOpen ? (
          /* COVER SECTION */
          <CoverSection
            settings={settings}
            guestName={guestName}
            onOpenInvitation={handleOpenInvitation}
          />
        ) : (
          /* INVITATION CONTENT BODY */
          <div className="relative pb-24 overflow-y-auto max-h-screen scroll-smooth">
            {/* Header Banner */}
            <div id="home" className="py-12 text-center space-y-2 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-gold-500/20 px-4">
              <p className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold">The Wedding of</p>
              <h1 className="font-script text-4xl sm:text-5xl text-gold-gradient py-1">
                {groomFirst} & {brideFirst}
              </h1>
              <p className="text-xs text-slate-400 font-serif">
                {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 29 Agustus 2026'}
              </p>
            </div>

            <InvitationContent settings={settings} />

            <DigitalEnvelope settings={settings} />

            <RsvpSection defaultGuestName={guestName} guestSlug={guestSlug} />

            <MusicPlayer musicUrl={settings.music_url} autoPlayTrigger={startMusic} />

            {/* INVIGLORY BOTTOM NAVIGATION DOCK */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-gold-500/40 rounded-full px-4 py-2 flex items-center gap-6 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => scrollToSection('home')}
                className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'home' ? 'text-gold-300 font-bold' : 'text-slate-400'}`}
              >
                <Heart className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => scrollToSection('couple')}
                className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'couple' ? 'text-gold-300 font-bold' : 'text-slate-400'}`}
              >
                <Calendar className="w-4 h-4" />
                <span>Acara</span>
              </button>
              <button
                onClick={() => scrollToSection('gift')}
                className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'gift' ? 'text-gold-300 font-bold' : 'text-slate-400'}`}
              >
                <Gift className="w-4 h-4" />
                <span>Hadiah</span>
              </button>
              <button
                onClick={() => scrollToSection('rsvp')}
                className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'rsvp' ? 'text-gold-300 font-bold' : 'text-slate-400'}`}
              >
                <Mail className="w-4 h-4" />
                <span>RSVP</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
