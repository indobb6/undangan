import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_EVENT_TEMPLATE = {
  id: 'default-event',
  event_slug: 'default-event',
  groom_name: 'Nama Mempelai Pria',
  bride_name: 'Nama Mempelai Wanita',
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
  bank_name: 'Bank BCA',
  bank_account: '',
  bank_owner: '',
  bank_name_2: 'Bank Mandiri',
  bank_account_2: '',
  bank_owner_2: ''
};

// LocalStorage helpers for Multi-Event
const getLocalEventsMap = () => {
  const data = localStorage.getItem('wedding_events_map');
  return data ? JSON.parse(data) : {};
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
        return map;
      }
    } catch (e) {
      console.warn('Supabase fetch events failed', e);
    }
  }
  return getLocalEventsMap();
};

export const getWeddingSettings = async (eventSlug) => {
  const allEvents = await getAllEvents();
  const availableSlugs = Object.keys(allEvents);
  
  const targetSlug = eventSlug || (availableSlugs.length > 0 ? availableSlugs[0] : null);

  if (!targetSlug) {
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .or(`id.eq.${targetSlug},event_slug.eq.${targetSlug}`)
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch settings failed, falling back to local storage', e);
    }
  }

  return allEvents[targetSlug] || null;
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

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('settings').upsert(record, { onConflict: 'id' });
    } catch (e) {
      console.error('Supabase create event failed:', e);
    }
  }

  const eventsMap = getLocalEventsMap();
  eventsMap[event_slug] = record;
  saveLocalEventsMap(eventsMap);
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

  const eventsMap = getLocalEventsMap();
  eventsMap[cleanSlug] = updated;
  saveLocalEventsMap(eventsMap);
  return updated;
};

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
      console.warn('Supabase fetch guests failed, using local fallback', e);
    }
  }
  const localList = getLocalGuests();
  return localList.filter((g) => g.event_slug === eventSlug);
};

export const getAllGuests = async (eventSlug) => {
  return await getGuestsByEvent(eventSlug);
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

  // Update local storage
  const localList = getLocalGuests();
  const index = localList.findIndex((g) => g.id === record.id || (g.event_slug === cleanSlug && g.slug === record.slug));
  if (index >= 0) {
    localList[index] = { ...localList[index], ...record };
  } else {
    if (!record.id) record.id = 'g-' + Date.now();
    localList.unshift(record);
  }
  saveLocalGuests(localList);

  return record;
};

export const submitRSVP = async ({ eventSlug, guestName, slug, status, marital_status, wishes }) => {
  const cleanSlug = eventSlug;
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
