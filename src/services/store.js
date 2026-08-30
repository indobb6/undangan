import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GENERIC_EVENT_TEMPLATE = {
  groom_name: 'Mempelai Pria',
  bride_name: 'Mempelai Wanita',
  groom_parents: 'Putra dari Bapak & Ibu...',
  bride_parents: 'Putri dari Bapak & Ibu...',
  groom_instagram: '',
  bride_instagram: '',
  akad_date: '2026-09-20',
  akad_time: '08:00 WIB - Selesai',
  akad_location: 'Lokasi Akad Nikah',
  resepsi_date: '2026-09-20',
  resepsi_time: '11:00 - 14:00 WIB',
  resepsi_location: 'Lokasi Resepsi Nikah',
  google_maps_url: 'https://maps.google.com',
  music_url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
  bank_name: '',
  bank_account: '',
  bank_owner: '',
  bank_name_2: '',
  bank_account_2: '',
  bank_owner_2: ''
};

// ──────────────────────────────────────────────────
// LocalStorage helpers (SINGLE SOURCE OF TRUTH)
// ──────────────────────────────────────────────────
const getLocalEventsMap = () => {
  try {
    const raw = localStorage.getItem('wedding_events_map');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
};

const saveLocalEventsMap = (map) => {
  localStorage.setItem('wedding_events_map', JSON.stringify(map));
};

const getLocalGuests = () => {
  try {
    const raw = localStorage.getItem('wedding_guests');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
};

const saveLocalGuests = (guests) => {
  localStorage.setItem('wedding_guests', JSON.stringify(guests));
};

// ──────────────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────────────
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateQRToken = (name) => {
  const prefix = 'WED';
  const clean = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'GUEST';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${clean}-${rand}`;
};

// ──────────────────────────────────────────────────
// EVENTS CRUD
// ──────────────────────────────────────────────────

/**
 * Returns a merged map of events from localStorage + Supabase.
 * localStorage is always treated as authoritative for recently-created events.
 */
export const getAllEvents = async () => {
  // Start from whatever is in localStorage (includes freshly created events)
  const localMap = getLocalEventsMap();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        // Merge Supabase data INTO local map (local wins on conflicts)
        const merged = { ...localMap };
        data.forEach((evt) => {
          const key = evt.event_slug || evt.id;
          if (!merged[key]) {
            merged[key] = evt;
          }
        });
        saveLocalEventsMap(merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch events failed, using local data', e);
    }
  }

  return localMap;
};

export const getWeddingSettings = async (eventSlug) => {
  // 1. Quick local lookup first (0ms)
  const localMap = getLocalEventsMap();
  const availableSlugs = Object.keys(localMap);

  const targetSlug = eventSlug || (availableSlugs.length > 0 ? availableSlugs[0] : null);

  if (targetSlug && localMap[targetSlug]) {
    return localMap[targetSlug];
  }

  // 2. Try Supabase if not found locally
  if (targetSlug && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('event_slug', targetSlug)
        .maybeSingle();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch settings error:', e);
    }
  }

  // 3. Return a generic placeholder so the UI never gets stuck on null
  return {
    ...GENERIC_EVENT_TEMPLATE,
    id: targetSlug || 'sample',
    event_slug: targetSlug || 'sample'
  };
};

export const createNewEvent = async (eventData) => {
  const event_slug = createSlug(
    eventData.event_slug || `${eventData.groom_name}-${eventData.bride_name}`
  );

  const record = {
    ...GENERIC_EVENT_TEMPLATE,
    ...eventData,
    id: event_slug,
    event_slug,
    akad_date: eventData.akad_date || '2026-09-20',
    resepsi_date: eventData.akad_date || '2026-09-20',
    updated_at: new Date().toISOString()
  };

  // ★ Save to localStorage FIRST so getAllEvents sees it immediately
  const eventsMap = getLocalEventsMap();
  eventsMap[event_slug] = record;
  saveLocalEventsMap(eventsMap);

  // Then attempt Supabase (non-blocking for UI)
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('settings').upsert(record, { onConflict: 'id' });
    } catch (e) {
      console.error('Supabase create event failed (local still saved):', e);
    }
  }

  return record;
};

export const saveWeddingSettings = async (eventSlug, newSettings) => {
  const cleanSlug = eventSlug || newSettings.event_slug;
  const updated = {
    ...newSettings,
    id: cleanSlug,
    event_slug: cleanSlug,
    updated_at: new Date().toISOString()
  };

  // Save locally first
  const eventsMap = getLocalEventsMap();
  eventsMap[cleanSlug] = updated;
  saveLocalEventsMap(eventsMap);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('settings').upsert(updated, { onConflict: 'id' });
    } catch (e) {
      console.error('Supabase save settings failed:', e);
    }
  }

  return updated;
};

export const deleteEvent = async (eventSlug) => {
  if (!eventSlug) return false;

  // 1. Delete from local storage
  const eventsMap = getLocalEventsMap();
  delete eventsMap[eventSlug];
  saveLocalEventsMap(eventsMap);

  // 2. Delete guests of this event from local storage
  const localGuests = getLocalGuests();
  const remainingGuests = localGuests.filter((g) => g.event_slug !== eventSlug);
  saveLocalGuests(remainingGuests);

  // 3. Delete from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      // Delete guests first
      await supabase.from('guests').delete().eq('event_slug', eventSlug);
      // Delete event settings
      await supabase.from('settings').delete().eq('event_slug', eventSlug);
      await supabase.from('settings').delete().eq('id', eventSlug);
    } catch (e) {
      console.error('Supabase delete event failed:', e);
    }
  }

  return true;
};

// ──────────────────────────────────────────────────
// GUESTS CRUD
// ──────────────────────────────────────────────────

export const getGuestsByEvent = async (eventSlug) => {
  if (!eventSlug) return [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_slug', eventSlug)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch guests failed', e);
    }
  }

  return getLocalGuests().filter((g) => g.event_slug === eventSlug);
};

export const getAllGuests = async (eventSlug) => {
  return getGuestsByEvent(eventSlug);
};

export const addOrUpdateGuest = async (eventSlug, guestData) => {
  const cleanSlug = eventSlug || guestData.event_slug;
  const slug = guestData.slug || createSlug(guestData.name);
  const qr_code_str = guestData.qr_code_str || generateQRToken(guestData.name);
  const food_quota = guestData.marital_status === 'married' ? 2 : 1;

  const record = {
    ...guestData,
    event_slug: cleanSlug,
    slug,
    qr_code_str,
    food_quota,
    food_redeemed: guestData.food_redeemed ?? false,
    created_at: guestData.created_at || new Date().toISOString()
  };

  // Save local first
  const localList = getLocalGuests();
  const idx = localList.findIndex(
    (g) => g.id === record.id || (g.event_slug === cleanSlug && g.slug === record.slug)
  );
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...record };
  } else {
    if (!record.id) record.id = 'g-' + Date.now();
    localList.unshift(record);
  }
  saveLocalGuests(localList);

  if (isSupabaseConfigured()) {
    try {
      if (record.id && !record.id.startsWith('g-')) {
        await supabase.from('guests').upsert(record);
      } else {
        const { id, ...newRec } = record;
        const { data } = await supabase.from('guests').insert(newRec).select().single();
        if (data) record.id = data.id;
      }
    } catch (e) {
      console.error('Supabase guest save failed:', e);
    }
  }

  return record;
};

export const submitRSVP = async ({ eventSlug, guestName, slug, status, marital_status, wishes }) => {
  let cleanSlug = eventSlug;
  if (!cleanSlug) {
    const localMap = getLocalEventsMap();
    const available = Object.keys(localMap);
    cleanSlug = available.length > 0 ? available[0] : 'default-event';
  }
  const qr_code_str = generateQRToken(guestName);

  const guests = await getGuestsByEvent(cleanSlug);
  const existing = guests.find(
    (g) => g.slug === slug || g.name.toLowerCase() === guestName.toLowerCase()
  );

  return addOrUpdateGuest(cleanSlug, {
    id: existing?.id,
    event_slug: cleanSlug,
    name: guestName,
    slug: slug || createSlug(guestName),
    status,
    marital_status,
    food_quota: marital_status === 'married' ? 2 : 1,
    qr_code_str: existing?.qr_code_str || qr_code_str,
    food_redeemed: existing?.food_redeemed || false,
    wishes: wishes || '',
    created_at: existing?.created_at || new Date().toISOString()
  });
};

export const getGuestByQR = async (qrToken) => {
  const clean = qrToken.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('guests')
        .select('*')
        .ilike('qr_code_str', clean)
        .single();
      if (data) return data;
    } catch { /* fallback */ }
  }

  return getLocalGuests().find((g) => g.qr_code_str.toUpperCase() === clean) || null;
};

export const redeemFoodVoucher = async (guestId) => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('guests')
        .update({ food_redeemed: true, redeemed_at: now })
        .eq('id', guestId)
        .select()
        .single();
      if (data) return data;
    } catch { /* fallback */ }
  }

  const list = getLocalGuests();
  const idx = list.findIndex((g) => g.id === guestId);
  if (idx >= 0) {
    list[idx].food_redeemed = true;
    list[idx].redeemed_at = now;
    saveLocalGuests(list);
    return list[idx];
  }
  return null;
};

export const deleteGuest = async (guestId) => {
  if (isSupabaseConfigured()) {
    try { await supabase.from('guests').delete().eq('id', guestId); } catch { /* ignore */ }
  }
  saveLocalGuests(getLocalGuests().filter((g) => g.id !== guestId));
  return true;
};
