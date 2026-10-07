import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GENERIC_EVENT_TEMPLATE = {
  package_type: 'biasa', // 'biasa' (Akad & Resepsi, QR Guest Book) | 'intimate' (Hanya Akad, QR Penukaran Makanan)
  groom_name: 'Mempelai Pria',
  bride_name: 'Mempelai Wanita',
  groom_parents: 'Putra dari Bapak & Ibu...',
  bride_parents: 'Putri dari Bapak & Ibu...',
  groom_instagram: '',
  bride_instagram: '',
  groom_photo: '',
  bride_photo: '',
  akad_date: '2026-09-20',
  akad_time: '08:00 WIB - Selesai',
  akad_location: 'Lokasi Akad Nikah',
  resepsi_date: '2026-09-20',
  resepsi_time: '11:00 - 14:00 WIB',
  resepsi_location: 'Lokasi Resepsi Nikah',
  google_maps_url: 'https://maps.google.com',
  resepsi_maps_url: '',
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

export const getAllEvents = async () => {
  const localMap = getLocalEventsMap();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) {
        console.error('Supabase getAllEvents error:', error);
      }
      if (!error && data && data.length > 0) {
        const merged = { ...localMap };
        data.forEach((evt) => {
          const key = evt.event_slug || evt.id;
          if (key) {
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
  const localMap = getLocalEventsMap();
  const availableSlugs = Object.keys(localMap);

  const targetSlug = eventSlug || (availableSlugs.length > 0 ? availableSlugs[0] : null);

  // 1. Try Supabase first if configured, to ensure cross-device sync
  if (targetSlug && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .or(`event_slug.eq.${targetSlug},id.eq.${targetSlug}`)
        .maybeSingle();

      if (!error && data) {
        const localCurrent = localMap[targetSlug] || {};
        const merged = {
          ...GENERIC_EVENT_TEMPLATE,
          ...localCurrent,
          ...data
        };
        // Pertahankan foto jika di database Supabase kolom belum ada atau bernilai null
        if (data.groom_photo !== undefined && data.groom_photo !== null && data.groom_photo !== '') {
          merged.groom_photo = data.groom_photo;
        } else if (localCurrent.groom_photo) {
          merged.groom_photo = localCurrent.groom_photo;
        }
        if (data.bride_photo !== undefined && data.bride_photo !== null && data.bride_photo !== '') {
          merged.bride_photo = data.bride_photo;
        } else if (localCurrent.bride_photo) {
          merged.bride_photo = localCurrent.bride_photo;
        }
        if (data.package_type) {
          merged.package_type = data.package_type;
        } else if (localCurrent.package_type) {
          merged.package_type = localCurrent.package_type;
        }
        if (data.resepsi_maps_url !== undefined && data.resepsi_maps_url !== null) {
          merged.resepsi_maps_url = data.resepsi_maps_url;
        } else if (localCurrent.resepsi_maps_url) {
          merged.resepsi_maps_url = localCurrent.resepsi_maps_url;
        }

        localMap[targetSlug] = merged;
        saveLocalEventsMap(localMap);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase fetch settings error:', e);
    }
  }

  // 2. Local storage lookup fallback
  if (targetSlug && localMap[targetSlug]) {
    return localMap[targetSlug];
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
    package_type: eventData.package_type || 'biasa',
    ...eventData,
    id: event_slug,
    event_slug,
    akad_date: eventData.akad_date || '2026-09-20',
    resepsi_date: eventData.resepsi_date || eventData.akad_date || '2026-09-20',
    updated_at: new Date().toISOString()
  };

  // 1. Save to localStorage FIRST
  const eventsMap = getLocalEventsMap();
  eventsMap[event_slug] = record;
  saveLocalEventsMap(eventsMap);

  // 2. Save to Supabase (with multi-strategy fallback)
  if (isSupabaseConfigured()) {
    try {
      let { error } = await supabase.from('settings').upsert(record, { onConflict: 'event_slug' });
      
      // If error (e.g. conflict on id vs event_slug), try standard upsert
      if (error) {
        console.warn('First upsert strategy failed, trying alternative:', error);
        const { error: err2 } = await supabase.from('settings').upsert(record);
        if (!err2) {
          error = null;
        } else {
          // Try inserting without explicit id if Supabase uses auto-generated UUID/BigInt
          const { id, ...recordWithoutId } = record;
          const { error: err3 } = await supabase.from('settings').insert(recordWithoutId);
          if (!err3) {
            error = null;
          }
        }
      }

      if (error) {
        console.error('Supabase settings insert error:', error);
        alert('⚠️ Supabase Error: Gagal menyimpan ke database online.\n\nPesan Error: ' + (error.message || JSON.stringify(error)) + '\n\nPetunjuk: Silakan jalankan ulang skrip SQL di Supabase SQL Editor.');
      }
    } catch (e) {
      console.error('Supabase create event failed:', e);
      alert('⚠️ Gagal menghubungi Supabase: ' + e.message);
    }
  }

  return record;
};

export const saveWeddingSettings = async (eventSlug, newSettings) => {
  const cleanSlug = eventSlug || newSettings.event_slug;
  const updated = {
    ...GENERIC_EVENT_TEMPLATE,
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
      // 1. Try update by event_slug
      const { data, error: updateError } = await supabase
        .from('settings')
        .update(updated)
        .eq('event_slug', cleanSlug)
        .select();

      // 2. If row did not exist yet, upsert it
      if (!updateError && (!data || data.length === 0)) {
        const { error: upsertError } = await supabase.from('settings').upsert(updated, { onConflict: 'event_slug' });
        if (upsertError) {
          console.warn('Supabase settings upsert error:', upsertError);
          if (upsertError.message?.includes('column') || upsertError.code === 'PGRST204' || upsertError.code === '42703') {
            const { groom_photo, bride_photo, package_type, resepsi_maps_url, ...safeRecord } = updated;
            await supabase.from('settings').upsert(safeRecord, { onConflict: 'event_slug' });
          }
        }
      } else if (updateError) {
        console.warn('Supabase settings update error:', updateError);
        // Fallback jika database Supabase belum memiliki kolom foto atau package_type
        if (updateError.message?.includes('column') || updateError.code === 'PGRST204' || updateError.code === '42703') {
          const { groom_photo, bride_photo, package_type, resepsi_maps_url, ...safeRecord } = updated;
          await supabase.from('settings').update(safeRecord).eq('event_slug', cleanSlug);
        } else {
          alert('⚠️ Supabase Info: ' + (updateError.message || JSON.stringify(updateError)));
        }
      }
    } catch (e) {
      console.error('Supabase save settings failed:', e);
      alert('⚠️ Gagal menghubungi Supabase: ' + e.message);
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
      await supabase.from('guests').delete().eq('event_slug', eventSlug);
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
  const food_quota = guestData.food_quota !== undefined ? guestData.food_quota : (guestData.marital_status === 'married' ? 2 : 1);

  const record = {
    ...guestData,
    event_slug: cleanSlug,
    slug,
    qr_code_str,
    food_quota,
    food_redeemed: guestData.food_redeemed ?? false,
    redeemed_at: guestData.redeemed_at || null,
    checkin: guestData.checkin ?? false,
    checkin_at: guestData.checkin_at || null,
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
        const { error } = await supabase.from('guests').upsert(record);
        if (error) {
          console.warn('Supabase guest upsert error:', error);
          if (error.message?.includes('column') || error.code === 'PGRST204' || error.code === '42703') {
            const { checkin, checkin_at, ...safeRec } = record;
            await supabase.from('guests').upsert(safeRec);
          }
        }
      } else {
        const { id, ...newRec } = record;
        const { data, error } = await supabase.from('guests').insert(newRec).select().single();
        if (error) {
          console.warn('Supabase guest insert error:', error);
          if (error.message?.includes('column') || error.code === 'PGRST204' || error.code === '42703') {
            const { checkin, checkin_at, ...safeRec } = newRec;
            const { data: d2 } = await supabase.from('guests').insert(safeRec).select().single();
            if (d2) record.id = d2.id;
          }
        } else if (data) {
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

export const checkInGuest = async (guestId) => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ checkin: true, checkin_at: now, status: 'hadir' })
        .eq('id', guestId)
        .select()
        .single();
      if (!error && data) return data;
      // Fallback if checkin column doesn't exist yet in Supabase
      if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.code === '42703')) {
        const { data: fallbackData } = await supabase
          .from('guests')
          .update({ status: 'hadir' })
          .eq('id', guestId)
          .select()
          .single();
        if (fallbackData) {
          return { ...fallbackData, checkin: true, checkin_at: now };
        }
      }
    } catch { /* fallback */ }
  }

  const list = getLocalGuests();
  const idx = list.findIndex((g) => g.id === guestId);
  if (idx >= 0) {
    list[idx].checkin = true;
    list[idx].checkin_at = now;
    list[idx].status = 'hadir';
    saveLocalGuests(list);
    return list[idx];
  }
  return null;
};

export const undoCheckInGuest = async (guestId) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ checkin: false, checkin_at: null })
        .eq('id', guestId)
        .select()
        .single();
      if (!error && data) return data;
    } catch { /* fallback */ }
  }

  const list = getLocalGuests();
  const idx = list.findIndex((g) => g.id === guestId);
  if (idx >= 0) {
    list[idx].checkin = false;
    list[idx].checkin_at = null;
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
