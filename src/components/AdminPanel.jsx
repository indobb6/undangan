import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, QrCode, Save, Plus, Copy, Trash2, CheckCircle2, 
  Database, Music, CreditCard, Check, Search, Share2, Layers, Heart 
} from 'lucide-react';
import { 
  getAllEvents, getWeddingSettings, saveWeddingSettings, createNewEvent,
  getGuestsByEvent, addOrUpdateGuest, deleteGuest, deleteEvent 
} from '../services/store';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AdminPanel({ currentEventSlug, isClientMode, onClose, onOpenScanner, onSwitchEvent }) {
  const [eventsMap, setEventsMap] = useState({});
  const [selectedSlug, setSelectedSlug] = useState(currentEventSlug || '');
  const [activeTab, setActiveTab] = useState('guests');
  const [settings, setSettingsState] = useState(null);
  const [guests, setGuests] = useState([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Event Form State
  const [newEventData, setNewEventData] = useState({
    event_slug: '',
    groom_name: '',
    bride_name: '',
    akad_date: '2026-09-20'
  });

  useEffect(() => {
    loadAllEventsData();
  }, []);

  const loadAllEventsData = async () => {
    const allEvts = await getAllEvents();
    setEventsMap(allEvts);
    const availableSlugs = Object.keys(allEvts);

    if (availableSlugs.length === 0) {
      setActiveTab('new_event');
      setSelectedSlug('');
    } else {
      const active = (selectedSlug && allEvts[selectedSlug]) ? selectedSlug : availableSlugs[0];
      setSelectedSlug(active);
      loadEventSpecificData(active);
    }
  };

  const handleSelectEvent = (slug) => {
    if (slug === 'new') {
      setActiveTab('new_event');
    } else {
      setSelectedSlug(slug);
      setActiveTab('guests');
      loadEventSpecificData(slug);
      if (onSwitchEvent) onSwitchEvent(slug);
    }
  };

  const loadEventSpecificData = async (slug) => {
    if (!slug) return;
    const setRes = await getWeddingSettings(slug);
    const guestRes = await getGuestsByEvent(slug);
    setSettingsState(setRes);
    setGuests(guestRes);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!selectedSlug) return;
    setIsSaving(true);
    const updated = await saveWeddingSettings(selectedSlug, settings);
    setIsSaving(false);
    // ★ Langsung update state React
    setEventsMap((prev) => ({ ...prev, [selectedSlug]: updated }));
    setSettingsState(updated);
    alert(`Pengaturan acara "${settings.groom_name} & ${settings.bride_name}" berhasil disimpan!`);
  };

  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    if (!newEventData.groom_name || !newEventData.bride_name) return;

    const created = await createNewEvent(newEventData);

    // ★ Langsung update state React tanpa menunggu re-fetch async
    setEventsMap((prev) => ({ ...prev, [created.event_slug]: created }));
    setSelectedSlug(created.event_slug);
    setSettingsState(created);
    setGuests([]);
    setActiveTab('guests');
    setNewEventData({ event_slug: '', groom_name: '', bride_name: '', akad_date: '2026-09-20' });
    if (onSwitchEvent) onSwitchEvent(created.event_slug);
    alert(`Acara "${created.groom_name} & ${created.bride_name}" berhasil dibuat!`);
  };

  const handleDeleteEvent = async () => {
    if (!selectedSlug) return;
    const isConfirmed = window.confirm(
      `APAKAH ANDA YAKIN?\n\nIni akan menghapus seluruh data acara "${settings?.groom_name || ''} & ${settings?.bride_name || ''}" beserta semua data tamu, RSVP, dan voucher makan.\n\nTindakan ini tidak dapat dibatalkan!`
    );
    if (!isConfirmed) return;

    await deleteEvent(selectedSlug);
    alert('Acara berhasil dihapus!');

    const allEvts = await getAllEvents();
    setEventsMap(allEvts);
    const availableSlugs = Object.keys(allEvts);

    if (availableSlugs.length === 0) {
      setSelectedSlug('');
      setSettingsState(null);
      setGuests([]);
      setActiveTab('new_event');
      if (onSwitchEvent) onSwitchEvent('');
    } else {
      const nextActive = availableSlugs[0];
      setSelectedSlug(nextActive);
      loadEventSpecificData(nextActive);
      if (onSwitchEvent) onSwitchEvent(nextActive);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuestName.trim() || !selectedSlug) return;

    const added = await addOrUpdateGuest(selectedSlug, {
      name: newGuestName.trim(),
      status: 'pending',
      marital_status: 'single',
      wishes: ''
    });

    setGuests([added, ...guests]);
    setNewGuestName('');
  };

  const handleDeleteGuest = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
      await deleteGuest(id);
      setGuests(guests.filter((g) => g.id !== id));
    }
  };

  const copyInvitationLink = (guest) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?event=${selectedSlug}&to=${encodeURIComponent(guest.name)}`;
    const text = `Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name},\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir pada acara pernikahan kami.\n\nDetail & Konfirmasi Kehadiran dapat diakses pada link berikut:\n${url}\n\nTerima kasih.`;

    navigator.clipboard.writeText(text);
    setCopiedSlug(guest.slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const copyClientAdminLink = () => {
    if (!selectedSlug) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?event=${selectedSlug}&client=true`;
    navigator.clipboard.writeText(url);
    setCopiedAdminLink(true);
    setTimeout(() => setCopiedAdminLink(false), 2500);
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGuests = guests.length;
  const attendingCount = guests.filter((g) => g.status === 'hadir').length;
  const totalQuota = guests
    .filter((g) => g.status === 'hadir')
    .reduce((acc, curr) => acc + (curr.food_quota || 1), 0);
  const totalRedeemed = guests.filter((g) => g.food_redeemed).length;

  const availableSlugs = Object.keys(eventsMap);
  const groomTitle = settings?.groom_name?.split(',')[0] || '';
  const brideTitle = settings?.bride_name?.split(',')[0] || '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 text-slate-100 selection:bg-rosewood-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP HEADER DOCK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-rosewood-300/30">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rose-300">
                {isClientMode
                  ? `Manajemen Tamu — ${groomTitle} & ${brideTitle}`
                  : 'Dashboard Super Admin'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                isSupabaseConfigured() 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <Database className="w-3 h-3" />
                {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode'}
              </span>
            </div>

            {/* EVENT SELECTOR (SUPER ADMIN ONLY) */}
            {!isClientMode && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Pilih Acara:</span>
                </span>
                <select
                  value={selectedSlug}
                  onChange={(e) => handleSelectEvent(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-rosewood-400/40 text-rose-200 text-xs font-bold focus:outline-none focus:border-rose-400"
                >
                  {availableSlugs.length === 0 ? (
                    <option value="">-- Belum ada acara --</option>
                  ) : (
                    availableSlugs.map((slug) => {
                      const evt = eventsMap[slug];
                      return (
                        <option key={slug} value={slug}>
                          💒 {evt.groom_name?.split(',')[0]} & {evt.bride_name?.split(',')[0]} ({slug})
                        </option>
                      );
                    })
                  )}
                  <option value="new">➕ Buat Acara Undangan Baru...</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isClientMode && selectedSlug && (
              <button
                onClick={copyClientAdminLink}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-bold text-xs flex items-center gap-2 transition"
                title="Salin Link Kelola Khusus Klien"
              >
                {copiedAdminLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedAdminLink ? 'Link Klien Tersalin!' : 'Salin Link Klien'}</span>
              </button>
            )}

            <button
              onClick={onOpenScanner}
              className="py-2.5 px-4 rounded-xl bg-rosewood-500 hover:bg-rosewood-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Scanner</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'guests'
                ? 'border-rosewood-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manajemen Tamu ({totalGuests})</span>
          </button>

          {!isClientMode && (
            <>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'settings'
                    ? 'border-rosewood-500 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Acara & Musik</span>
              </button>

              <button
                onClick={() => setActiveTab('new_event')}
                className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'new_event'
                    ? 'border-rosewood-500 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>➕ Buat Acara Baru</span>
              </button>
            </>
          )}
        </div>

        {/* EMPTY STATE IF NO EVENTS EXIST YET */}
        {availableSlugs.length === 0 && activeTab !== 'new_event' && (
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
            <Heart className="w-12 h-12 text-rosewood-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-serif font-bold text-rose-300">Belum Ada Acara Pernikahan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Silakan buat acara pernikahan baru terlebih dahulu untuk mulai menambahkan tamu dan mengatur acara.
            </p>
            <button
              onClick={() => setActiveTab('new_event')}
              className="py-3 px-6 rounded-xl bg-rosewood-500 hover:bg-rosewood-700 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Acara Pertama Sekarang</span>
            </button>
          </div>
        )}

        {/* TAB 1: GUEST MANAGEMENT */}
        {availableSlugs.length > 0 && activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Tamu Diundang</div>
                <div className="text-2xl font-bold font-serif text-slate-100">{totalGuests}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Konfirmasi Hadir</div>
                <div className="text-2xl font-bold font-serif text-emerald-400">{attendingCount}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Kuota Porsi</div>
                <div className="text-2xl font-bold font-serif text-amber-300">{totalQuota} Porsi</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Telah Ditukarkan</div>
                <div className="text-2xl font-bold font-serif text-rose-400">{totalRedeemed} Tamu</div>
              </div>
            </div>

            {/* Add Guest Form */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder={`Masukkan Nama Tamu Baru...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-400 text-xs"
                />
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-rosewood-500 hover:bg-rosewood-700 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tamu</span>
                </button>
              </form>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama tamu..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* Guests Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-rose-300 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nama Tamu</th>
                    <th className="p-4">Status RSVP</th>
                    <th className="p-4">Pernikahan</th>
                    <th className="p-4">Kuota Makan</th>
                    <th className="p-4">Status Makan</th>
                    <th className="p-4 text-right">Aksi & Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        Belum ada tamu di acara ini. Tambahkan tamu pertama di atas!
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-semibold text-slate-100">
                          {guest.name}
                        </td>
                        <td className="p-4">
                          {guest.status === 'hadir' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ Hadir
                            </span>
                          ) : guest.status === 'tidak_hadir' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              × Tidak Hadir
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              Belum Konfirmasi
                            </span>
                          )}
                        </td>
                        <td className="p-4 capitalize">
                          {guest.marital_status === 'married' ? 'Menikah' : 'Single'}
                        </td>
                        <td className="p-4 font-bold text-amber-300">
                          {guest.food_quota || 1} Porsi
                        </td>
                        <td className="p-4">
                          {guest.food_redeemed ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Ditukarkan
                            </span>
                          ) : (
                            <span className="text-amber-400">Belum Ditukarkan</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => copyInvitationLink(guest)}
                            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-semibold inline-flex items-center gap-1 transition"
                          >
                            {copiedSlug === guest.slug ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin WA</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
                            title="Hapus Tamu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SETTINGS FORM */}
        {!isClientMode && availableSlugs.length > 0 && activeTab === 'settings' && settings && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-serif font-bold text-rose-300 border-b border-slate-800 pb-3">
              Pengaturan Acara ({selectedSlug})
            </h2>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-bold">
                <Music className="w-4 h-4 text-rosewood-500" />
                <span>Link Musik YouTube / MP3</span>
              </div>
              <input
                type="text"
                value={settings.music_url || ''}
                onChange={(e) => setSettingsState({ ...settings, music_url: e.target.value })}
                placeholder="Paste link YouTube (misal: https://www.youtube.com/watch?v=...) atau link MP3..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-rose-400">Data Mempelai Pria</h3>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nama Mempelai Pria & Gelar</label>
                  <input
                    type="text"
                    value={settings.groom_name || ''}
                    onChange={(e) => setSettingsState({ ...settings, groom_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nama Orang Tua Mempelai Pria</label>
                  <input
                    type="text"
                    value={settings.groom_parents || ''}
                    onChange={(e) => setSettingsState({ ...settings, groom_parents: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Instagram Mempelai Pria (opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: @fauzi.pratama"
                    value={settings.groom_instagram || ''}
                    onChange={(e) => setSettingsState({ ...settings, groom_instagram: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-rose-400">Data Mempelai Wanita</h3>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nama Mempelai Wanita & Gelar</label>
                  <input
                    type="text"
                    value={settings.bride_name || ''}
                    onChange={(e) => setSettingsState({ ...settings, bride_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nama Orang Tua Mempelai Wanita</label>
                  <input
                    type="text"
                    value={settings.bride_parents || ''}
                    onChange={(e) => setSettingsState({ ...settings, bride_parents: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Instagram Mempelai Wanita (opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: @nadiah.rahma"
                    value={settings.bride_instagram || ''}
                    onChange={(e) => setSettingsState({ ...settings, bride_instagram: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Amplop Digital / Transfer Bank</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300">Bank 1 (BCA)</span>
                  <input
                    type="text"
                    placeholder="Nama Bank"
                    value={settings.bank_name || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={settings.bank_account || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_account: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Nama Pemilik Rekening"
                    value={settings.bank_owner || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300">Bank 2 (Mandiri / E-Wallet)</span>
                  <input
                    type="text"
                    placeholder="Nama Bank"
                    value={settings.bank_name_2 || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_name_2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={settings.bank_account_2 || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_account_2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Nama Pemilik Rekening"
                    value={settings.bank_owner_2 || ''}
                    onChange={(e) => setSettingsState({ ...settings, bank_owner_2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="py-3.5 px-8 rounded-xl bg-rosewood-500 hover:bg-rosewood-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Perubahan</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteEvent}
                className="py-3.5 px-6 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Acara Ini</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CREATE NEW EVENT */}
        {!isClientMode && activeTab === 'new_event' && (
          <form onSubmit={handleCreateNewEvent} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <h2 className="text-xl font-serif font-bold text-rose-300 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                <span>Buat Acara Pernikahan Baru</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nama Mempelai Pria</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fauzi Pratama, S.Kom"
                  value={newEventData.groom_name}
                  onChange={(e) => setNewEventData({ ...newEventData, groom_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Nama Mempelai Wanita</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nadiah Rahmawati, S.E"
                  value={newEventData.bride_name}
                  onChange={(e) => setNewEventData({ ...newEventData, bride_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">URL Slug Acara (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: fauzi-nadiah"
                  value={newEventData.event_slug}
                  onChange={(e) => setNewEventData({ ...newEventData, event_slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Tanggal Pernikahan</label>
                <input
                  type="date"
                  value={newEventData.akad_date}
                  onChange={(e) => setNewEventData({ ...newEventData, akad_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3.5 px-8 rounded-xl bg-rosewood-500 hover:bg-rosewood-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Buat Acara</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
