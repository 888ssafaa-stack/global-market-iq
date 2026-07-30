// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// نظام المصادقة المستقر الفوري المباشر بـ Google Identity Services (GSI)
// - إلغاء الحلقة المفرغة (Loop) نهائياً عبر التقاط التوكن (JWT Credential) فوراً
// - حفظ البيانات محلياً تحت المفتاحين gm_user_profile و gm_uid
// - التحديث الفوري المباشر لجميع واجهات وتطبيق الهاتف والموقع
// ═══════════════════════════════════════════════════════════
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { db } from '../firebase/config';
import { INITIAL_USER } from '../data/mockData';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const GOOGLE_CLIENT_ID = '1068894096179-jmb60e6aoqd5m4mgq4sr6k5ee9hv5flq.apps.googleusercontent.com';
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

  // حفظ صريح تحت المفاتيح المطلوبة
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

// ─── فك تشفير هادئ وسريع لـ JWT Credential ──────────────────
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadSessionProfile());
  const [loading, setLoading] = useState(false);
  const uidRef = useRef(user?.id || null);

  // معالجة فورية وتثبيت الجلسة عند اختيار حساب Google
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) return;

    const uid = `g_${payload.sub}`;
    let fsData = await fsLoad(uid);
    let fullProfile;

    if (fsData) {
      fullProfile = enforceRole({
        ...fsData,
        ...loadUserImages(uid),
        id: uid,
        email: payload.email,
        name: fsData.name || payload.name || 'مستخدم Google',
        avatar: fsData.avatar || payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'G')}&background=1877F2&color=fff`,
      }, payload.email);
    } else {
      fullProfile = enforceRole({
        ...INITIAL_USER,
        id: uid,
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0] || 'مستخدم Google',
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'G')}&background=1877F2&color=fff`,
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
        governorate: 'بغداد',
        joinedDate: new Date().toLocaleDateString('ar-IQ'),
        bio: 'مستخدم مسجل عبر حساب Google الرسمي'
      }, payload.email);

      fsSave(uid, fullProfile);
    }

    // حفظ الجلسة فوراً في localStorage تحت gm_user_profile و gm_uid
    saveSessionProfile(uid, fullProfile);
    uidRef.current = uid;
    setUser(fullProfile);

    // تحديث الواجهة فوراً
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
    return fullProfile;
  };

  // تهيئة GSI مرة واحدة لمنع أي Loop عند الاختيار
  useEffect(() => {
    const initGsiScript = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (_) {}
      }
    };

    if (window.google?.accounts?.id) {
      initGsiScript();
    } else {
      window.addEventListener('load', initGsiScript, { once: true });
    }
  }, []);

  // المزامنة مع Firestore عند تحميل الصفحة
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

  // ── login المباشر ─────────────────────────────────────────
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

  // ── updateUser ───────────────────────────────────────────
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

  // ── logout ───────────────────────────────────────────────
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
  };

  // ── loginWithGoogle الفوري المباشر ─────────────────────────
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      let gUser = null;

      // 1. الأجهزة المحمولة الأصيلة (Native APK)
      if (Capacitor.isNativePlatform()) {
        try {
          GoogleAuth.initialize({
            clientId: GOOGLE_CLIENT_ID,
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          const res = await GoogleAuth.signIn();
          if (res) {
            gUser = {
              uid: res.id ? `g_${res.id}` : `g_${Date.now()}`,
              email: res.email,
              name: res.name || res.givenName || 'مستخدم Google',
              photoURL: res.imageUrl,
            };
          }
        } catch (nErr) {
          console.warn('[Native GoogleAuth Warning]:', nErr);
        }
      }

      // 2. متصفحات الموبايل والكمبيوتر (Mobile Web & Desktop)
      if (!gUser) {
        gUser = await new Promise((resolve, reject) => {
          let resolved = false;

          // إعادة إسناد الـ Callback للالتقاط الفوري
          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: async (res) => {
                if (resolved) return;
                resolved = true;
                const profile = await handleGoogleCredentialResponse(res);
                if (profile) resolve(profile);
                else reject(new Error('تعذر معالجة رمز الدخول.'));
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });

            // فتح نافذة اختيار الحساب المباشرة
            window.google.accounts.id.prompt((notif) => {
              if ((notif.isNotDisplayed() || notif.isSkippedMoment()) && !resolved) {
                // استخدام OAuth2 Client المباشر كخيار موثوق
                try {
                  const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'email profile openid',
                    callback: (tokenRes) => {
                      if (tokenRes?.access_token && !resolved) {
                        resolved = true;
                        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                          headers: { Authorization: `Bearer ${tokenRes.access_token}` },
                        })
                          .then(r => r.json())
                          .then(async (uInfo) => {
                            const uid = `g_${uInfo.sub}`;
                            const full = enforceRole({
                              ...INITIAL_USER,
                              id: uid,
                              email: uInfo.email,
                              name: uInfo.name || 'مستخدم Google',
                              avatar: uInfo.picture,
                            }, uInfo.email);
                            saveSessionProfile(uid, full);
                            setUser(full);
                            window.dispatchEvent(new Event('storage'));
                            window.dispatchEvent(new Event('auth_state_change'));
                            resolve(full);
                          })
                          .catch(reject);
                      }
                    },
                  });
                  client.requestAccessToken();
                } catch (err) {
                  if (!resolved) reject(err);
                }
              }
            });
          } else {
            reject(new Error('مكتبة Google Sign-In غير جاهزة بعد.'));
          }
        });
      }

      return gUser;
    } catch (error) {
      console.error('[Google Sign-In Direct Error]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser: user ? { uid: user.id, email: user.email } : null,
      loading,
      isLoggedIn: Boolean(user?.id),
      login,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
