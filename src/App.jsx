import React, { useState, useEffect, useRef } from 'react';
import CoverSection from './components/CoverSection';
import InvitationContent from './components/InvitationContent';
import RsvpSection from './components/RsvpSection';
import AdminPanel from './components/AdminPanel';
import QRScannerModal from './components/QRScannerModal';
import MusicPlayer from './components/MusicPlayer';
import DigitalEnvelope from './components/DigitalEnvelope';
import CountdownSection from './components/CountdownSection';
import confetti from 'canvas-confetti';
import { getWeddingSettings, getAllEvents } from './services/store';
import { Heart, Users, Calendar, Gift, Mail } from 'lucide-react';

export default function App() {
  const scrollContainerRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);
  const [eventSlug, setEventSlug] = useState('');
  const [settings, setSettings] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestSlug, setGuestSlug] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCoverDismissed, setIsCoverDismissed] = useState(false);
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
    setIsOpen(true);
    setStartMusic(true);

    // Efek elegan: semburan lembut kelopak mawar & kilauan emas bertahap
    try {
      confetti({
        particleCount: 45,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#d4a237', '#b85b65', '#8c3842', '#fce7f3', '#fdfbf7'],
        disableForReducedMotion: true
      });

      // Gelombang kedua lembut setelah jeda untuk nuansa magis
      setTimeout(() => {
        confetti({
          particleCount: 25,
          spread: 90,
          origin: { y: 0.65 },
          colors: ['#d4a237', '#fae0a2', '#ffffff'],
          disableForReducedMotion: true
        });
      }, 350);
    } catch { /* ignore */ }

    // Setelah animasi melayang lembut (1250ms) selesai, cover di-unmount permanen
    // sehingga saat di-scroll ke paling atas, hanya mentok sampai Beranda (#home)
    setTimeout(() => {
      setIsCoverDismissed(true);
    }, 1250);
  };

  // ★ SCROLL SPY: Otomatis ubah highlight tombol dock sesuai posisi scroll halaman
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const sections = ['home', 'couple', 'event', 'gift', 'rsvp'];

    const handleScroll = () => {
      if (isScrollingProgrammatically.current) return;

      // 1. Jika sudah di dekat paling bawah, aktifkan rsvp
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (scrollBottom < 80) {
        setActiveTab('rsvp');
        return;
      }

      // 2. Jika masih di paling atas, aktifkan home
      if (container.scrollTop < 80) {
        setActiveTab('home');
        return;
      }

      // 3. Tentukan section yang berada di zona fokus tengah layar (40% viewport height)
      const centerLine = container.scrollTop + (container.clientHeight * 0.4);

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el && centerLine >= el.offsetTop) {
          setActiveTab(id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const scrollToSection = (id) => {
    setActiveTab(id);
    isScrollingProgrammatically.current = true;
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 750);

    const container = scrollContainerRef.current || document.getElementById('main-scroll-container');
    if (id === 'home') {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const element = document.getElementById(id);
    if (container && element) {
      container.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    } else if (element) {
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

          <div className="space-y-3">
            <p className="text-[11px] text-espresso-700 font-medium">
              Tertarik membuat undangan digital serupa? Silakan hubungi kami untuk pemesanan:
            </p>
            <a
              href="https://instagram.com/yaserazaramadhan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rosewood-200 bg-rosewood-50/50 text-rosewood-700 hover:bg-rosewood-50 text-xs font-bold transition shadow-sm w-full"
            >
              <span>📸 Instagram: @yaserazaramadhan</span>
            </a>
          </div>
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
      {/* MOBILE FRAME VIEWPORT CONTAINER */}
      {settings && (
        <div className="w-full max-w-[480px] h-screen sm:h-[92vh] sm:my-4 sm:rounded-[40px] sm:border-[8px] sm:border-rosewood-200 bg-cream-50 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:ring-1 sm:ring-rosewood-300">
          
          {/* COVER SECTION OVERLAY (ANIMASI BUKA AMPLOP MEWAH & MELAYANG HALUS) */}
          {!isCoverDismissed && (
            <div 
              className={`absolute inset-0 z-30 w-full h-full envelope-lift ${
                isOpen 
                  ? '-translate-y-[102%] opacity-0 pointer-events-none scale-[1.03] blur-[1px]' 
                  : 'translate-y-0 opacity-100 scale-100 blur-0'
              }`}
            >
              <CoverSection
                settings={settings}
                guestName={guestName}
                isOpen={isOpen}
                onOpenInvitation={handleOpenInvitation}
              />
            </div>
          )}

          {/* MAIN SCROLL CONTAINER (MEKAR LEMBUT KETIKA COVER DIBUKA) */}
          <div 
            ref={scrollContainerRef}
            id="main-scroll-container"
            className={`relative h-full w-full scroll-smooth content-reveal ${
              isOpen 
                ? 'overflow-y-auto opacity-100 scale-100' 
                : 'overflow-hidden opacity-85 scale-[0.97]'
            }`}
          >
            {/* INVITATION CONTENT:
                Page 1: #home (The Wedding of & Ayat Al-Qur'an)
                Page 2: #couple (Mempelai Pria & Wanita, Foto/Inisial)
                Page 3: #event (Jadwal & Lokasi Acara, Maps)
            */}
            <InvitationContent settings={settings} />

            {/* PAGE 4: DIGITAL ENVELOPE / HADIAH */}
            <DigitalEnvelope settings={settings} />

            {/* HITUNG MUNDUR (DI AKHIR SEBELUM RSVP) */}
            <CountdownSection targetDateStr={settings.akad_date} />

            {/* PAGE 5: RSVP & BUKU TAMU */}
            <RsvpSection eventSlug={eventSlug || settings?.event_slug} defaultGuestName={guestName} guestSlug={guestSlug} />
          </div>

          <MusicPlayer musicUrl={settings.music_url} autoPlayTrigger={startMusic} />

          {/* BOTTOM NAVIGATION DOCK (DENGAN SCROLLSPY AKTIF OTOMATIS) */}
          {isOpen && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 border border-rosewood-200/90 rounded-full p-1.5 flex items-center gap-1 sm:gap-1.5 shadow-2xl backdrop-blur-md animate-fade-in-up">
              {[
                { id: 'home', label: 'Beranda', icon: Heart },
                { id: 'couple', label: 'Mempelai', icon: Users },
                { id: 'event', label: 'Acara', icon: Calendar },
                { id: 'gift', label: 'Hadiah', icon: Gift },
                { id: 'rsvp', label: 'RSVP', icon: Mail },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-rosewood-700 text-white font-bold shadow-md shadow-rosewood-800/30 scale-105'
                        : 'text-espresso-750 hover:text-rosewood-800 hover:bg-rosewood-50/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-[9px] sm:text-[10px] leading-none tracking-tight">{label}</span>
                  </button>
                );
              })}
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
