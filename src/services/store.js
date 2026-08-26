import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_EVENT_TEMPLATE = {
  id: 'fauzi-nadiah',
  event_slug: 'fauzi-nadiah',
  groom_name: 'Fauzi Pratama, S.Kom',
  bride_name: 'Nadiah Rahmawati, S.E',
  groom_parents: 'Putra dari Bp. H. Ahmad & Ibu Hj. Siti',
  bride_parents: 'Putri dari Bp. H. Budi & Ibu Hj. Dewi',
  groom_instagram: '@fauzi',
  bride_instagram: '@nadiah',
  akad_date: '2026-08-29',
  akad_time: '08:00 WIB - Selesai',
  akad_location: 'Masjid Agung Al-Azhar, Kebayoran Baru, Jakarta Selatan',
  resepsi_date: '2026-08-29',
  resepsi_time: '11:00 - 14:00 WIB',
  resepsi_location: 'Ballroom Hotel Grand Mahakam, Jakarta Selatan',
  google_maps_url: 'https://maps.google.com',
  music_url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
  bank_name: 'Bank BCA',
  bank_account: '1234567890',
  bank_owner: 'Fauzi Pratama',
  bank_name_2: 'Bank Mandiri',
  bank_account_2: '0987654321',
  bank_owner_2: 'Nadiah Rahmawati'
};

// LocalStorage helpers for Multi-Event
const getLocalEventsMap = () => {
  const data = localStorage.getItem('wedding_events_map');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return { 'fauzi-nadiah': DEFAULT_EVENT_TEMPLATE };
};

const saveLocalEventsMap = (map) => {
  localStorage.setItem('wedding_events_map', JSON.stringify(map));
};

const getLocalGuests = () => {
  const data = localStorage.getItem('wedding_guests');
  return data ? JSON.parse(data) : [];
};

const saveLocalGuests = (guests) => {
  localStorage.setItem('wedding_guests', JSON.stringify(guests));
};

// Generate helper slug
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate random QR token
export const generateQRToken = (name) => {
  const prefix = 'WED';
  const clean = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'GUEST';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${clean}-${rand}`;
};

// --- STORE SERVICE API ---

export const getAllEvents = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        const map = {};
        data.forEach((evt) => {
          map[evt.event_slug || evt.id] = evt;
        });
        // Also sync local storage
        saveLocalEventsMap(map);
        return map;
      }
    } catch (e) {
      console.warn('Supabase fetch events failed', e);
    }
  }
  return getLocalEventsMap();
};

export const getWeddingSettings = async (eventSlug = 'fauzi-nadiah') => {
  const cleanSlug = eventSlug || 'fauzi-nadiah';

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('event_slug', cleanSlug)
        .maybeSingle();
      if (!error && data) return data;

      const { data: dataId, error: errorId } = await supabase
        .from('settings')
        .select('*')
        .eq('id', cleanSlug)
        .maybeSingle();
      if (!errorId && dataId) return dataId;
    } catch (e) {
      console.warn('Supabase fetch settings error:', e);
    }
  }

  // 2. Check local storage
  const eventsMap = getLocalEventsMap();
  if (eventsMap[cleanSlug]) return eventsMap[cleanSlug];

  // 3. Fallback to clean template with cleanSlug (NEVER return null)
  return {
    ...DEFAULT_EVENT_TEMPLATE,
    id: cleanSlug,
    event_slug: cleanSlug,
    groom_name: 'Mempelai Pria',
    bride_name: 'Mempelai Wanita'
  };
};

export const createNewEvent = async (eventData) => {
  const event_slug = createSlug(eventData.event_slug || `${eventData.groom_name}-${eventData.bride_name}`);
  const record = {
    ...DEFAULT_EVENT_TEMPLATE,
    ...eventData,
    id: event_slug,
    event_slug: event_slug,
    updated_at: new Date().toISOString()
  };

  // 1. Save to LocalStorage IMMEDIATELY so UI updates with 0 latency
  const eventsMap = getLocalEventsMap();
  eventsMap[event_slug] = record;
  saveLocalEventsMap(eventsMap);

  // 2. Save to Supabase in background
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('settings').upsert(record, { onConflict: 'id' });
    } catch (e) {
      console.error('Supabase create event failed:', e);
    }
  }

  return record;
};

export const saveWeddingSettings = async (eventSlug, newSettings) => {
  const cleanSlug = eventSlug || newSettings.event_slug || 'fauzi-nadiah';
  const updated = {
    ...newSettings,
    id: cleanSlug,
    event_slug: cleanSlug,
    updated_at: new Date().toISOString()
  };

  // 1. Save locally immediately
  const eventsMap = getLocalEventsMap();
  eventsMap[cleanSlug] = updated;
  saveLocalEventsMap(eventsMap);

  // 2. Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(updated, { onConflict: 'id' });
      if (error) console.error('Error saving settings to Supabase:', error);
    } catch (e) {
      console.error('Supabase save settings failed:', e);
    }
  }

  return updated;
};

export const getGuestsByEvent = async (eventSlug = 'fauzi-nadiah') => {
  const cleanSlug = eventSlug || 'fauzi-nadiah';
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_slug', cleanSlug)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch guests failed, using local fallback', e);
    }
  }
  const localList = getLocalGuests();
  return localList.filter((g) => (g.event_slug || 'fauzi-nadiah') === cleanSlug);
};

export const getAllGuests = async (eventSlug = 'fauzi-nadiah') => {
  return await getGuestsByEvent(eventSlug);
};

export const addOrUpdateGuest = async (eventSlug, guestData) => {
  const cleanSlug = eventSlug || guestData.event_slug || 'fauzi-nadiah';
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

  // Local storage save first
  const localList = getLocalGuests();
  const index = localList.findIndex((g) => g.id === record.id || (g.event_slug === cleanSlug && g.slug === record.slug));
  if (index >= 0) {
    localList[index] = { ...localList[index], ...record };
  } else {
    if (!record.id) record.id = 'g-' + Date.now();
    localList.unshift(record);
  }
  saveLocalGuests(localList);

  if (isSupabaseConfigured()) {
    try {
      if (record.id && !record.id.startsWith('g-')) {
        const { error } = await supabase.from('guests').upsert(record);
        if (error) console.error('Supabase guest upsert error:', error);
      } else {
        const { id, ...newRecord } = record;
        const { data, error } = await supabase.from('guests').insert(newRecord).select().single();
        if (!error && data) {
          record.id = data.id;
        }
      }
    } catch (e) {
      console.error('Supabase guest save failed:', e);
    }
  }

  return record;
};

export const submitRSVP = async ({ eventSlug, guestName, slug, status, marital_status, wishes }) => {
  const cleanSlug = eventSlug || 'fauzi-nadiah';
  const food_quota = marital_status === 'married' ? 2 : 1;
  const qr_code_str = generateQRToken(guestName);

  const guests = await getGuestsByEvent(cleanSlug);
  const existingGuest = guests.find((g) => g.slug === slug || g.name.toLowerCase() === guestName.toLowerCase());

  const guestPayload = {
    id: existingGuest ? existingGuest.id : undefined,
    event_slug: cleanSlug,
    name: guestName,
    slug: slug || createSlug(guestName),
    status: status,
    marital_status: marital_status,
    food_quota: food_quota,
    qr_code_str: existingGuest?.qr_code_str || qr_code_str,
    food_redeemed: existingGuest?.food_redeemed || false,
    wishes: wishes || '',
    created_at: existingGuest?.created_at || new Date().toISOString()
  };

  return await addOrUpdateGuest(cleanSlug, guestPayload);
};

export const getGuestByQR = async (qrToken) => {
  const cleanToken = qrToken.trim().toUpperCase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .ilike('qr_code_str', cleanToken)
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch guest by QR error', e);
    }
  }
  const guests = getLocalGuests();
  return guests.find((g) => g.qr_code_str.toUpperCase() === cleanToken) || null;
};

export const redeemFoodVoucher = async (guestId) => {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ food_redeemed: true, redeemed_at: now })
        .eq('id', guestId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase redeem voucher error:', e);
    }
  }

  const localGuests = getLocalGuests();
  const index = localGuests.findIndex((g) => g.id === guestId);
  if (index >= 0) {
    localGuests[index].food_redeemed = true;
    localGuests[index].redeemed_at = now;
    saveLocalGuests(localGuests);
    return localGuests[index];
  }
  return null;
};

export const deleteGuest = async (guestId) => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('guests').delete().eq('id', guestId);
    } catch (e) {
      console.error('Supabase delete guest failed', e);
    }
  }
  const localGuests = getLocalGuests().filter((g) => g.id !== guestId);
  saveLocalGuests(localGuests);
  return true;
};
