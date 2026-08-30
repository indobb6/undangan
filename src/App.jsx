import React, { useState, useEffect } from 'react';
import CoverSection from './components/CoverSection';
import InvitationContent from './components/InvitationContent';
import RsvpSection from './components/RsvpSection';
import AdminPanel from './components/AdminPanel';
import QRScannerModal from './components/QRScannerModal';
import MusicPlayer from './components/MusicPlayer';
import DigitalEnvelope from './components/DigitalEnvelope';
import MotionIntro from './components/MotionIntro';
import { getWeddingSettings, getAllEvents } from './services/store';
import { Heart, Calendar, Gift, Mail } from 'lucide-react';

export default function App() {
  const [eventSlug, setEventSlug] = useState('');
  const [settings, setSettings] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSlug, setGuestSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showMotionIntro, setShowMotionIntro] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [startMusic, setStartMusic] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isLandingPage, setIsLandingPage] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const params = new URLSearchParams(window.location.search);
    const evtParam = params.get('event') || params.get('acara');
    const toParam = params.get('to') || params.get('nama') || params.get('guest');
    const slugParam = params.get('slug');
    const adminParam = params.get('admin') === 'true';
    const clientParam = params.get('client') === 'true' || params.get('mode') === 'client';

    // 1. If no query parameters at all, show clean portal/landing page
    if (!evtParam && !adminParam && !clientParam) {
      setIsLandingPage(true);
      return;
    }

    let activeEventSlug = evtParam;

    if (!activeEventSlug) {
      const allEvts = await getAllEvents();
      const availableSlugs = Object.keys(allEvts);
      if (availableSlugs.length > 0) {
        activeEventSlug = availableSlugs[0];
      }
    }

    setEventSlug(activeEventSlug || '');

    if (activeEventSlug) {
      const currentSettings = await getWeddingSettings(activeEventSlug);
      setSettings(currentSettings);
    }

    if (toParam) {
      setGuestName(toParam);
    } else if (slugParam) {
      setGuestSlug(slugParam);
      const formatted = slugParam.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setGuestName(formatted);
    } else {
      setGuestName('Tamu Undangan');
    }

    // Admin panel modes: ?admin=true (Super Admin) or ?client=true (Client Guest-Only Admin)
    if (params.get('admin') === 'true') {
      setShowAdmin(true);
      setIsClientMode(false);
    } else if (params.get('client') === 'true' || params.get('mode') === 'client') {
      setShowAdmin(true);
      setIsClientMode(true);
    }
  };

  const reloadEventSettings = async (slug) => {
    const targetSlug = slug || eventSlug;
    if (!targetSlug) {
      setSettings(null);
      return;
    }
    setEventSlug(targetSlug);
    const res = await getWeddingSettings(targetSlug);
    setSettings(res);
  };

  const handleOpenInvitation = () => {
    setShowMotionIntro(true);
    setStartMusic(true);
  };

  const handleMotionComplete = () => {
    setShowMotionIntro(false);
    setIsOpen(true);
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 2. Render clean landing page on root URL
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-4 selection:bg-rosewood-500 selection:text-white">
        <div className="w-full max-w-md bg-white/95 border border-rosewood-200/60 rounded-[32px] p-8 text-center shadow-xl space-y-6 animate-fade-in-up backdrop-blur-md">
          <div className="w-16 h-16 bg-rosewood-50 rounded-full flex items-center justify-center mx-auto text-rosewood-700">
            <Heart className="w-8 h-8 fill-rosewood-200" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-rosewood-900">
              Portal Undangan Digital
            </h1>
            <p className="text-xs text-espresso-750 leading-relaxed font-medium">
              Silakan periksa kembali tautan undangan pernikahan personal yang Anda terima untuk membuka halaman undangan.
            </p>
          </div>

          <div className="h-[1px] bg-rosewood-100/60" />

          <p className="text-[11px] text-espresso-500 italic">
            Hubungi calon mempelai atau keluarga jika Anda belum menerima tautan undangan lengkap.
          </p>

          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('admin', 'true');
              window.location.href = url.toString();
            }}
            className="w-full py-3 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white font-bold text-xs shadow-md transition"
          >
            Masuk ke Dashboard Admin
          </button>
        </div>
      </div>
    );
  }

  // 3. Prevent stuck loading screen if settings is empty but we are showing AdminPanel
  if (!settings && !showAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 text-rosewood-900 font-serif text-lg font-bold">
        Memuat Undangan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 text-espresso-800 flex items-center justify-center relative overflow-x-hidden">
      {/* MOTION GRAPHICS INTRO OVERLAY */}
      {showMotionIntro && (
        <MotionIntro settings={settings} onComplete={handleMotionComplete} />
      )}

      {/* DESKTOP BACKGROUND BACKDROP */}
      <div 
        className="fixed inset-0 bg-cover bg-center filter blur-xl opacity-20 pointer-events-none transform scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80')`
        }}
      />
      <div className="fixed inset-0 bg-cream-100/70 pointer-events-none" />

      {/* MOBILE FRAME VIEWPORT CONTAINER */}
      {settings && (
        <div className="w-full max-w-[480px] h-screen sm:h-[92vh] sm:my-4 sm:rounded-[40px] sm:border-[8px] sm:border-rosewood-200 bg-cream-50 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:ring-1 sm:ring-rosewood-300">
          {!isOpen ? (
            /* COVER SECTION */
            <CoverSection
              settings={settings}
              guestName={guestName}
              onOpenInvitation={handleOpenInvitation}
            />
          ) : (
            /* INVITATION CONTENT BODY (FULL PAGE SNAP CONTAINER) */
            <div className="relative h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
              <InvitationContent settings={settings} />

              <DigitalEnvelope settings={settings} />

              <RsvpSection eventSlug={eventSlug || settings?.event_slug} defaultGuestName={guestName} guestSlug={guestSlug} />

              <MusicPlayer musicUrl={settings.music_url} autoPlayTrigger={startMusic} />

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
      )}

      {/* ADMIN PANEL MODAL */}
      {showAdmin && (
        <AdminPanel
          currentEventSlug={eventSlug}
          isClientMode={isClientMode}
          onClose={() => {
            setShowAdmin(false);
            reloadEventSettings(eventSlug);
          }}
          onSwitchEvent={(newSlug) => {
            reloadEventSettings(newSlug);
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
