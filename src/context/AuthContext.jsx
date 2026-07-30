// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// نظام المصادقة العالمي المتقدم بإدارة Auth0
// Domain: dev-84pkq1gqub766fon.us.auth0.com
// Client ID: 4bEb45aZ0b6P8Wm3tg8kjsNJq9clpiyK
// حفظ دائم ومستقر للجلسة في localStorage تحت gm_user_profile و gm_uid
// ═══════════════════════════════════════════════════════════
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { INITIAL_USER } from '../data/mockData';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const OWNER_EMAIL = '888ssafaa@gmail.com';

const KEY_UID         = 'gm_uid';
const KEY_FULL_USER   = 'gm_user_profile';
const KEY_TEXT        = (uid) => `gm_text_${uid}`;
const KEY_AVATAR      = (uid) => `gm_avatar_${uid}`;
const KEY_COVER       = (uid) => `gm_cover_${uid}`;

const enforceRole = (profile, email) => ({
  ...profile,
  role: (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ? 'APP_OWNER' : (profile?.role || 'REGULAR_USER'),
});

const isBase64 = (v) => typeof v === 'string' && (v.startsWith('data:') || v.length > 5000);

const jSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
};
const jGet = (key) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch (_) { return null; }
};
const lsSet = (key, val) => { try { localStorage.setItem(key, val); } catch (_) {} };
const lsGet = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
const lsDel = (...keys) => keys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });

export const saveUserImages = (uid, profile) => {
  if (!uid || !profile) return;
  if (profile.avatar && isBase64(profile.avatar)) lsSet(KEY_AVATAR(uid), profile.avatar);
  if (profile.cover  && isBase64(profile.cover))  lsSet(KEY_COVER(uid),  profile.cover);
};

export const loadUserImages = (uid) => {
  const r = {};
  const av = lsGet(KEY_AVATAR(uid));
  const cv = lsGet(KEY_COVER(uid));
  if (av) r.avatar = av;
  if (cv) r.cover  = cv;
  return r;
};

// ─── حفظ الحساب صراحة تحت المفاتيح المطلوبة ────────────────────
const saveSessionProfile = (uid, profile) => {
  if (!uid || !profile) return;
  const cleanText = {};
  Object.entries(profile).forEach(([k, v]) => {
    if (!isBase64(v)) cleanText[k] = v;
  });

  jSet(KEY_FULL_USER, profile);
  jSet(KEY_TEXT(uid), cleanText);
  lsSet(KEY_UID, uid);

  saveUserImages(uid, profile);
};

const loadSessionProfile = () => {
  try {
    const full = jGet(KEY_FULL_USER);
    if (full && full.id) return full;
    const uid = lsGet(KEY_UID);
    if (!uid) return null;
    const text = jGet(KEY_TEXT(uid));
    if (!text) return null;
    const av = lsGet(KEY_AVATAR(uid));
    const cv = lsGet(KEY_COVER(uid));
    return { ...text, ...(av ? { avatar: av } : {}), ...(cv ? { cover: cv } : {}) };
  } catch (_) {
    return null;
  }
};

// ─── Firestore ──────────────────────────────────────────────
const fsLoad = async (uid) => {
  try {
    if (!uid || !db) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) { return null; }
};

const fsSave = (uid, profile) => {
  try {
    if (!uid || !db) return;
    const clean = {};
    Object.entries(profile).forEach(([k, v]) => {
      if (!isBase64(v) && v !== undefined) clean[k] = v;
    });
    setDoc(doc(db, 'users', uid), clean, { merge: true })
      .catch(e => console.warn('[Firestore] save failed:', e.code));
  } catch (_) {}
};

export const AuthProvider = ({ children }) => {
  const {
    user: auth0User,
    isAuthenticated: isAuth0Authenticated,
    isLoading: isAuth0Loading,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();

  const [user, setUser] = useState(() => loadSessionProfile());
  const uidRef = useRef(user?.id || null);

  // ─── المزامنة الفورية مع جلسة Auth0 ─────────────────────────────
  useEffect(() => {
    if (isAuth0Authenticated && auth0User) {
      const uid = `auth0_${auth0User.sub ? auth0User.sub.replace(/[^a-zA-Z0-9]/g, '_') : Date.now()}`;

      fsLoad(uid).then((fsData) => {
        let fullProfile;
        if (fsData) {
          fullProfile = enforceRole({
            ...fsData,
            ...loadUserImages(uid),
            id: uid,
            email: auth0User.email,
            name: fsData.name || auth0User.name || auth0User.nickname || 'مستخدم Auth0',
            avatar: fsData.avatar || auth0User.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth0User.name || 'A')}&background=1877F2&color=fff`,
          }, auth0User.email);
        } else {
          fullProfile = enforceRole({
            ...INITIAL_USER,
            id: uid,
            email: auth0User.email,
            name: auth0User.name || auth0User.nickname || auth0User.email?.split('@')[0] || 'مستخدم Auth0',
            avatar: auth0User.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth0User.name || 'A')}&background=1877F2&color=fff`,
            cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
            governorate: 'بغداد',
            joinedDate: new Date().toLocaleDateString('ar-IQ'),
            bio: 'مستخدم مسجل عبر منصة Auth0 العالمية'
          }, auth0User.email);

          fsSave(uid, fullProfile);
        }

        setUser(fullProfile);
        uidRef.current = uid;
        saveSessionProfile(uid, fullProfile);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth_state_change'));
      });
    }
  }, [isAuth0Authenticated, auth0User]);

  // المزامنة مع Firestore عند تحميل الصفحة إن وجد حساب محلي
  useEffect(() => {
    const local = loadSessionProfile();
    if (local?.id) {
      uidRef.current = local.id;
      fsLoad(local.id).then((fsData) => {
        if (fsData) {
          const merged = enforceRole({ ...local, ...fsData, id: local.id }, fsData.email || local.email);
          setUser(merged);
          saveSessionProfile(local.id, merged);
        }
      });
    }
  }, []);

  // ── login المباشر (البريد / الحساب الشخصي) ────────────────
  const login = (profileObj) => {
    const uid = profileObj?.id || `user_${Date.now()}`;
    const full = enforceRole({ ...profileObj, id: uid }, profileObj.email);
    setUser(full);
    uidRef.current = uid;
    saveSessionProfile(uid, full);
    fsSave(uid, full);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
    return full;
  };

  // ── loginWithAuth0 المباشر ────────────────────────────────
  const loginWithAuth0 = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      }
    });
  };

  // ── loginWithGoogle عبر Auth0 Universal Login ─────────────
  const loginWithGoogle = async () => {
    loginWithAuth0();
  };

  // ── updateUser (تحديث البيانات الشخصية) ─────────────────
  const updateUser = async (updatedFields) => {
    const uid = user?.id || uidRef.current;
    if (!uid) return null;
    const merged = enforceRole({ ...(user || {}), ...updatedFields, id: uid }, user?.email);

    setUser(merged);
    saveSessionProfile(uid, merged);
    fsSave(uid, merged);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
    return merged;
  };

  // ── logout (تسجيل الخروج النظيف بـ Auth0) ───────────────────
  const logout = async () => {
    const uid = user?.id || uidRef.current;
    setUser(null);
    uidRef.current = null;
    lsDel(KEY_UID, KEY_FULL_USER);
    if (uid) {
      lsDel(KEY_TEXT(uid), KEY_AVATAR(uid), KEY_COVER(uid));
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));

    if (isAuth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser: user ? { uid: user.id, email: user.email } : null,
      loading: isAuth0Loading,
      isLoggedIn: Boolean(user?.id),
      login,
      loginWithAuth0,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
