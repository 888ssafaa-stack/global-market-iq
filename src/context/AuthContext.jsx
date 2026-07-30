// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// المصدر الأساسي: localStorage (فوري وخالي تماماً من Firebase Auth)
// المصدر السحابي الاحتياطي: Firestore (مستندات المستخدمين مباشرة)
// جوجل سرفيسز الرسمية: Google Identity Services (GSI) & Native GoogleAuth
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

// ═══════════════════════════════════════════════════════════
// البريد الإلكتروني الخاص بمالك التطبيق (APP_OWNER)
// ═══════════════════════════════════════════════════════════
const OWNER_EMAIL = '888ssafaa@gmail.com';

const enforceRole = (profile, email) => ({
  ...profile,
  role: (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ? 'APP_OWNER' : (profile?.role || 'REGULAR_USER'),
});

// ═══════════════════════════════════════════════════════════
// مفاتيح localStorage
// ═══════════════════════════════════════════════════════════
const KEY_UID    = 'gm_uid';
const KEY_TEXT   = (uid) => `gm_text_${uid}`;
const KEY_AVATAR = (uid) => `gm_avatar_${uid}`;
const KEY_COVER  = (uid) => `gm_cover_${uid}`;

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

const isBase64 = (v) => typeof v === 'string' && (v.startsWith('data:') || v.length > 5000);

const saveTextFields = (uid, profile) => {
  if (!uid) return;
  const text = {};
  Object.entries(profile).forEach(([k, v]) => {
    if (!isBase64(v)) text[k] = v;
  });
  jSet(KEY_TEXT(uid), text);
  lsSet(KEY_UID, uid);
};

export const saveUserImages = (uid, profile) => {
  if (!uid) return;
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

const loadFullProfile = (uid) => {
  if (!uid) return null;
  const text = jGet(KEY_TEXT(uid));
  if (!text) return null;
  return { ...text, ...loadUserImages(uid) };
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

// ─── فك تشفير هادئ لـ Google JWT Token ──────────────────────
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

// ═══════════════════════════════════════════════════════════
// AuthProvider (بدون أي الاعتماد على Firebase Auth)
// ═══════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const lastUid = lsGet(KEY_UID);
  const [user, setUser] = useState(() => loadFullProfile(lastUid));
  const [loading, setLoading] = useState(false);
  const uidRef = useRef(lastUid);

  useEffect(() => {
    if (lastUid && !user) {
      fsLoad(lastUid).then((fsData) => {
        if (fsData) {
          const full = enforceRole({ ...fsData, ...loadUserImages(lastUid), id: lastUid }, fsData.email);
          setUser(full);
          saveTextFields(lastUid, full);
        }
      });
    }
  }, [lastUid]); // eslint-disable-line

  // ── login المباشر ─────────────────────────────────────────
  const login = (profileObj) => {
    const uid = profileObj?.id || `user_${Date.now()}`;
    const full = enforceRole({ ...profileObj, id: uid }, profileObj.email);
    setUser(full);
    uidRef.current = uid;
    saveTextFields(uid, full);
    saveUserImages(uid, full);
    fsSave(uid, full);
    return full;
  };

  // ── updateUser ───────────────────────────────────────────
  const updateUser = async (updatedFields) => {
    const uid = user?.id || uidRef.current || lastUid;
    const merged = enforceRole({ ...(user || {}), ...updatedFields, id: uid }, user?.email);

    setUser(merged);
    if (uid) {
      saveTextFields(uid, merged);
      saveUserImages(uid, merged);
      fsSave(uid, merged);
    }
    return merged;
  };

  // ── logout ───────────────────────────────────────────────
  const logout = async () => {
    const uid = user?.id || uidRef.current;
    setUser(null);
    uidRef.current = null;
    lsDel(KEY_UID);
    if (uid) {
      lsDel(KEY_TEXT(uid), KEY_AVATAR(uid), KEY_COVER(uid));
    }
  };

  // ── loginWithGoogle عبر Google Identity Services المباشرة ──
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      let gUser = null;

      // 1. الأجهزة المحمولة وتطبيقات الـ Native
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
              uid: res.id || res.authentication?.idToken ? `g_${res.id}` : `g_${Date.now()}`,
              email: res.email,
              name: res.name || res.givenName || 'مستخدم Google',
              photoURL: res.imageUrl,
            };
          }
        } catch (nErr) {
          console.warn('[Native GoogleAuth Error]:', nErr);
        }
      }

      // 2. المتصفحات (Mobile Web & Desktop Web) عبر Google Identity Services (GSI)
      if (!gUser) {
        gUser = await new Promise((resolve, reject) => {
          if (!window.google || !window.google.accounts) {
            // تحميل سكريبت GSI ديناميكياً إذا لم يكتمل تحميله
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initGsi(resolve, reject);
            script.onerror = () => reject(new Error('فشل تحميل مكتبة Google Identity Services'));
            document.head.appendChild(script);
          } else {
            initGsi(resolve, reject);
          }
        });
      }

      if (!gUser || !gUser.email) {
        throw new Error('تعذر جلب بيانات حساب Google.');
      }

      const uid = gUser.uid || `g_${gUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      let fsData = await fsLoad(uid);
      let fullProfile;

      if (fsData) {
        fullProfile = enforceRole({
          ...fsData,
          ...loadUserImages(uid),
          id: uid,
          email: gUser.email,
          name: fsData.name || gUser.name || 'مستخدم Google',
          avatar: fsData.avatar || gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.name || 'G')}&background=1877F2&color=fff`,
        }, gUser.email);
      } else {
        fullProfile = enforceRole({
          ...INITIAL_USER,
          id: uid,
          email: gUser.email,
          name: gUser.name || gUser.email.split('@')[0] || 'مستخدم Google',
          avatar: gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.name || 'G')}&background=1877F2&color=fff`,
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          governorate: 'بغداد',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
          bio: 'مستخدم مسجل عبر حساب Google الرسمي'
        }, gUser.email);

        fsSave(uid, fullProfile);
      }

      setUser(fullProfile);
      uidRef.current = uid;
      saveTextFields(uid, fullProfile);
      return fullProfile;
    } catch (error) {
      console.error('[Google Sign-In Direct Error]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // دالة تفعيل Google Identity Services المباشرة
  const initGsi = (resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload) {
              resolve({
                uid: `g_${payload.sub}`,
                email: payload.email,
                name: payload.name || payload.given_name || 'مستخدم Google',
                photoURL: payload.picture,
              });
            } else {
              reject(new Error('تعذر معالجة رمز Google Jwt.'));
            }
          } else {
            reject(new Error('لم يمرر خادم Google رمز المصادقة.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // إظهار نافذة اختيار الحساب الفورية One Tap / Prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // إذا تم حظر النافذة التلقائية، استخدم OAuth2 token client المباشر
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                  .then(res => res.json())
                  .then(userInfo => {
                    resolve({
                      uid: `g_${userInfo.sub}`,
                      email: userInfo.email,
                      name: userInfo.name || 'مستخدم Google',
                      photoURL: userInfo.picture,
                    });
                  })
                  .catch(reject);
              } else {
                reject(new Error('تم إلغاء عملية تسجيل الدخول بـ Google.'));
              }
            },
          });
          client.requestAccessToken();
        }
      });
    } catch (err) {
      reject(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser: user ? { uid: user.id, email: user.email } : null,
      loading,
      isLoggedIn: Boolean(user),
      login,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
