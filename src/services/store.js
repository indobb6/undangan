import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEFAULT_SETTINGS = {
  id: 'default',
  groom_name: 'Rizky Pratama, S.Kom',
  bride_name: 'Anisa Rahmawati, S.E',
  groom_parents: 'Putra dari Bp. H. Ahmad & Ibu Hj. Siti',
  bride_parents: 'Putri dari Bp. H. Budi & Ibu Hj. Dewi',
  akad_date: '2026-09-12',
  akad_time: '08:00 WIB - Selesai',
  akad_location: 'Masjid Agung Al-Azhar, Kebayoran Baru, Jakarta Selatan',
  resepsi_date: '2026-09-12',
  resepsi_time: '11:00 - 14:00 WIB',
  resepsi_location: 'Ballroom Hotel Grand Mahakam, Jakarta Selatan',
  google_maps_url: 'https://maps.google.com',
  music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
};

const DEFAULT_GUESTS = [
  {
    id: 'g-1',
    name: 'Budi Santoso',
    slug: 'budi-santoso',
    status: 'pending',
    marital_status: 'single',
    food_quota: 1,
    qr_code_str: 'WED-BUDI-1234',
    food_redeemed: false,
    redeemed_at: null,
    wishes: '',
    created_at: new Date().toISOString()
  },
  {
    id: 'g-2',
    name: 'Drs. Hendra & Istri',
    slug: 'hendra-istri',
    status: 'hadir',
    marital_status: 'married',
    food_quota: 2,
    qr_code_str: 'WED-HEND-5678',
    food_redeemed: false,
    redeemed_at: null,
    wishes: 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah!',
    created_at: new Date().toISOString()
  }
];

// LocalStorage helpers
const getLocalSettings = () => {
  const data = localStorage.getItem('wedding_settings');
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

const saveLocalSettings = (settings) => {
  localStorage.setItem('wedding_settings', JSON.stringify(settings));
};

const getLocalGuests = () => {
  const data = localStorage.getItem('wedding_guests');
  return data ? JSON.parse(data) : DEFAULT_GUESTS;
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

export const getWeddingSettings = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch settings failed, falling back to local storage', e);
    }
  }
  return getLocalSettings();
};

export const saveWeddingSettings = async (newSettings) => {
  const updated = { ...newSettings, id: 'default', updated_at: new Date().toISOString() };
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
  saveLocalSettings(updated);
  return updated;
};

export const getAllGuests = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch guests failed, using local fallback', e);
    }
  }
  return getLocalGuests();
};

export const addOrUpdateGuest = async (guestData) => {
  const slug = guestData.slug || createSlug(guestData.name);
  const qr_code_str = guestData.qr_code_str || generateQRToken(guestData.name);
  const food_quota = guestData.marital_status === 'married' ? 2 : 1;

  const record = {
    ...guestData,
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
  const index = localList.findIndex((g) => g.id === record.id || g.slug === record.slug);
  if (index >= 0) {
    localList[index] = { ...localList[index], ...record };
  } else {
    if (!record.id) record.id = 'g-' + Date.now();
    localList.unshift(record);
  }
  saveLocalGuests(localList);

  return record;
};

export const submitRSVP = async ({ guestName, slug, status, marital_status, wishes }) => {
  const food_quota = marital_status === 'married' ? 2 : 1;
  const qr_code_str = generateQRToken(guestName);

  let existingGuest = null;
  const guests = await getAllGuests();
  existingGuest = guests.find((g) => g.slug === slug || g.name.toLowerCase() === guestName.toLowerCase());

  const guestPayload = {
    id: existingGuest ? existingGuest.id : undefined,
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

  return await addOrUpdateGuest(guestPayload);
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
