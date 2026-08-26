import React, { useState, useEffect } from 'react';
import CoverSection from './components/CoverSection';
import InvitationContent from './components/InvitationContent';
import RsvpSection from './components/RsvpSection';
import AdminPanel from './components/AdminPanel';
import QRScannerModal from './components/QRScannerModal';
import MusicPlayer from './components/MusicPlayer';
import DigitalEnvelope from './components/DigitalEnvelope';
import FloralPetals from './components/FloralPetals';
import { getWeddingSettings } from './services/store';
import { Heart, Calendar, Gift, Mail, Lock } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSlug, setGuestSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [startMusic, setStartMusic] = useState(false);
  const [showPetals, setShowPetals] = useState(false);
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

    // Admin panel accessible via ?admin=true
    if (params.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setStartMusic(true);
    setShowPetals(true);
    // Hide petals after 10 seconds to keep UI clean
    setTimeout(() => setShowPetals(false), 10000);
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
      <div className="min-h-screen flex items-center justify-center bg-cream-100 text-rosewood-900 font-serif text-lg font-bold">
        Memuat Undangan Romantis...
      </div>
    );
  }

  const groomFirst = settings.groom_name?.split(',')[0] || 'Fauzi';
  const brideFirst = settings.bride_name?.split(',')[0] || 'Nadiah';

  return (
    <div className="min-h-screen bg-cream-100 text-espresso-800 flex items-center justify-center relative overflow-x-hidden">
      {/* FALLING PETALS ANIMATION WHEN INVITATION OPENS */}
      {showPetals && <FloralPetals count={30} />}

      {/* DESKTOP BACKGROUND BACKDROP */}
      <div 
        className="fixed inset-0 bg-cover bg-center filter blur-xl opacity-20 pointer-events-none transform scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80')`
        }}
      />
      <div className="fixed inset-0 bg-cream-100/70 pointer-events-none" />

      {/* MOBILE FRAME VIEWPORT CONTAINER (BRIGHT ROMANTIC THEME) */}
      <div className="w-full max-w-[480px] min-h-screen sm:min-h-[92vh] sm:my-4 sm:rounded-[40px] sm:border-[8px] sm:border-rosewood-200 bg-cream-50 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:ring-1 sm:ring-rosewood-300">
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
            <div id="home" className="py-10 text-center space-y-2 bg-gradient-to-b from-rosewood-50 via-cream-100 to-cream-50 border-b border-rosewood-200 px-4">
              <p className="text-[10px] uppercase tracking-widest text-rosewood-700 font-bold">The Wedding of</p>
              <h1 className="font-script text-4xl sm:text-5xl text-romantic-gradient py-1">
                {groomFirst} & {brideFirst}
              </h1>
              <p className="text-xs text-espresso-700 font-serif">
                {settings.akad_date ? new Date(settings.akad_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 29 Agustus 2026'}
              </p>
            </div>

            <InvitationContent settings={settings} />

            <DigitalEnvelope settings={settings} />

            <RsvpSection defaultGuestName={guestName} guestSlug={guestSlug} />

            <MusicPlayer musicUrl={settings.music_url} autoPlayTrigger={startMusic} />

            {/* Subtle Footer Admin Trigger */}
            <div className="py-8 text-center">
              <button
                onClick={() => setShowAdmin(true)}
                className="text-[10px] text-rosewood-300 hover:text-rosewood-500 inline-flex items-center gap-1 transition"
                title="Buka Admin Panel"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            </div>

            {/* BOTTOM NAVIGATION DOCK */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 border border-rosewood-200 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-xl backdrop-blur-md">
              <button
                onClick={() => scrollToSection('home')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${activeTab === 'home' ? 'text-rosewood-700 font-bold' : 'text-espresso-700/60'}`}
              >
                <Heart className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => scrollToSection('couple')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${activeTab === 'couple' ? 'text-rosewood-700 font-bold' : 'text-espresso-700/60'}`}
              >
                <Calendar className="w-4 h-4" />
                <span>Acara</span>
              </button>
              <button
                onClick={() => scrollToSection('gift')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${activeTab === 'gift' ? 'text-rosewood-700 font-bold' : 'text-espresso-700/60'}`}
              >
                <Gift className="w-4 h-4" />
                <span>Hadiah</span>
              </button>
              <button
                onClick={() => scrollToSection('rsvp')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${activeTab === 'rsvp' ? 'text-rosewood-700 font-bold' : 'text-espresso-700/60'}`}
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
