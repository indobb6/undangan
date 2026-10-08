export const DEFAULT_ADMIN_PASSWORD = 'admin123';

const MASTER_PASSWORD_KEY = 'wedding_admin_master_password';
const SESSION_AUTH_KEY = 'wedding_admin_session_auth';

/**
 * Mendapatkan password master admin dari localStorage, env variable, atau default
 */
export const getMasterPassword = () => {
  try {
    const saved = localStorage.getItem(MASTER_PASSWORD_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    /* ignore */
  }
  return import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
};

/**
 * Menyimpan password master admin baru ke localStorage
 */
export const setMasterPassword = (newPassword) => {
  try {
    if (!newPassword || !newPassword.trim()) {
      localStorage.removeItem(MASTER_PASSWORD_KEY);
    } else {
      localStorage.setItem(MASTER_PASSWORD_KEY, newPassword.trim());
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Memverifikasi kecocokan password admin
 * Mendukung password master dan password spesifik acara (event-specific password)
 */
export const verifyAdminPassword = ({ password, eventSettings }) => {
  if (!password) return false;
  const input = password.trim();
  const master = getMasterPassword();

  // 1. Password Master selalu valid untuk semua mode
  if (input === master) return true;

  // 2. Password bawaan (admin123) juga valid jika master belum diubah
  if (input === DEFAULT_ADMIN_PASSWORD) return true;

  // 3. Jika acara memiliki password khusus
  if (eventSettings && eventSettings.admin_password && eventSettings.admin_password.trim()) {
    if (input === eventSettings.admin_password.trim()) {
      return true;
    }
  }

  return false;
};

/**
 * Memeriksa status login admin dalam sesi browser saat ini
 */
export const isAdminSessionAuthenticated = () => {
  try {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Menyimpan status login admin ke sessionStorage (aktif selama tab/jendela terbuka)
 */
export const setAdminSessionAuthenticated = (isValid) => {
  try {
    if (isValid) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
  } catch {
    /* ignore */
  }
};

/**
 * Logout admin dan menghapus sesi
 */
export const logoutAdminSession = () => {
  setAdminSessionAuthenticated(false);
};
