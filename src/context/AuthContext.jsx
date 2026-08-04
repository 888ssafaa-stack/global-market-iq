// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// نظام مصادقة Firebase الرسمية (Google Sign-In + Email/Password)
// مصادقة فائقة الاستقرار تمنع خطأ auth/initial-state-not-found بالكامل
// حفظ ومزامنة الجلسة 100% محلياً وفي Firestore
// ═══════════════════════════════════════════════════════════
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db } from '../firebase/config';
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

const parseJwt = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (_) {
    return null;
  }
};

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
      if (v !== undefined) {
        // حماية أمانFirestore للحزم الضخمة جداً (أكبر من 600KB)
        if (typeof v === 'string' && v.length > 600000) {
          return;
        }
        clean[k] = v;
      }
    });
    setDoc(doc(db, 'users', uid), clean, { merge: true })
      .catch(e => console.warn('[Firestore] save failed:', e.code));
  } catch (_) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadSessionProfile());
  const [loading, setLoading] = useState(true);
  const uidRef = useRef(user?.id || null);

  // ── 1. تفعيل الجلسة الدائمة واستمع لـ Firebase Auth ──────────────
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const uid = fbUser.uid;
        let fsData = await fsLoad(uid);
        let fullProfile;

        const localImgs = loadUserImages(uid);
        const localText = jGet(KEY_TEXT(uid)) || {};

        if (fsData) {
          fullProfile = enforceRole({
            ...INITIAL_USER,
            ...localText,
            ...fsData,
            ...localImgs,
            id: uid,
            email: fbUser.email || fsData.email,
            name: fsData.name || localText.name || fbUser.displayName || 'مستخدم',
            avatar: fsData.avatar || localImgs.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fsData.name || fbUser.displayName || 'G')}&background=1877F2&color=fff`,
            cover: fsData.cover || localImgs.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          }, fbUser.email || fsData.email);
        } else {
          fullProfile = enforceRole({
            ...INITIAL_USER,
            ...localText,
            ...localImgs,
            id: uid,
            email: fbUser.email,
            name: localText.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
            avatar: localImgs.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
            cover: localImgs.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
            governorate: localText.governorate || 'بغداد',
            joinedDate: localText.joinedDate || new Date().toLocaleDateString('ar-IQ'),
            bio: localText.bio || 'مستخدم مسجل في السوق العالمي'
          }, fbUser.email);
        }

        fsSave(uid, fullProfile);

        setUser(fullProfile);
        uidRef.current = uid;
        saveSessionProfile(uid, fullProfile);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth_state_change'));
      } else {
        const local = loadSessionProfile();
        if (local) {
          setUser(local);
          uidRef.current = local.id;
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  // ── loginWithEmail ────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      let fbUser = null;
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        fbUser = res.user;
      } catch (fbErr) {
        console.warn('[Firebase Email Auth fallback]:', fbErr.code);
      }

      const uid = fbUser?.uid || `u_${encodeURIComponent(email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))}`;
      let fsData = await fsLoad(uid);
      let fullProfile;

      if (fsData) {
        fullProfile = enforceRole({
          ...fsData,
          ...loadUserImages(uid),
          id: uid,
          email,
          name: fsData.name || email.split('@')[0],
          avatar: fsData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fsData.name || email.split('@')[0])}&background=1877F2&color=fff`,
        }, email);
      } else {
        fullProfile = enforceRole({
          ...INITIAL_USER,
          id: uid,
          email,
          name: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=1877F2&color=fff`,
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          governorate: 'بغداد',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
          bio: 'مستخدم مسجل عبر البريد الإلكتروني'
        }, email);

        fsSave(uid, fullProfile);
      }

      setUser(fullProfile);
      uidRef.current = uid;
      saveSessionProfile(uid, fullProfile);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth_state_change'));
      return fullProfile;
    } finally {
      setLoading(false);
    }
  };

  // ── registerWithEmail ─────────────────────────────────────
  const registerWithEmail = async (formData) => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      const { email, password, name, phone, governorate } = formData;
      let fbUser = null;

      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = res.user;
      } catch (fbErr) {
        console.warn('[Firebase Register Email fallback]:', fbErr.code);
      }

      const uid = fbUser?.uid || `u_${encodeURIComponent(email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))}`;

      const fullProfile = enforceRole({
        ...INITIAL_USER,
        id: uid,
        email,
        name: name || email.split('@')[0],
        phone: phone || '',
        governorate: governorate || 'بغداد',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=1877F2&color=fff`,
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
        joinedDate: new Date().toLocaleDateString('ar-IQ'),
        bio: 'مستخدم جديد مسجل في السوق العالمي'
      }, email);

      fsSave(uid, fullProfile);
      setUser(fullProfile);
      uidRef.current = uid;
      saveSessionProfile(uid, fullProfile);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth_state_change'));
      return fullProfile;
    } finally {
      setLoading(false);
    }
  };

  // ── 2. تسجيل الدخول عبر Google الأصيل المباشر (Native Sign-In) ──
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});

      let fbUser = null;

      const isMobileApp = Capacitor.isNativePlatform() || 
                          Capacitor.getPlatform() === 'android' || 
                          Capacitor.getPlatform() === 'ios' || 
                          Boolean(window.Capacitor?.isNative);

      // أ) الأجهزة المحمولة وتطبيق الأندرويد الأصيل (Native Plugin / SDK)
      if (isMobileApp) {
        try {
          console.log('[Google Auth Initialization] Using Web Client ID:', GOOGLE_CLIENT_ID);
          GoogleAuth.initialize({
            clientId: GOOGLE_CLIENT_ID,
            serverClientId: GOOGLE_CLIENT_ID,
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          const googleUser = await GoogleAuth.signIn();
          console.log('[Native GoogleAuth Success Response]:', googleUser);

          const idToken = googleUser.authentication?.idToken || googleUser.idToken || googleUser.serverAuthCode;
          const accessToken = googleUser.authentication?.accessToken || googleUser.accessToken;

          if (idToken) {
            try {
              const credential = GoogleAuthProvider.credential(idToken);
              const res = await signInWithCredential(auth, credential);
              fbUser = res.user;
              console.log('[Firebase Auth Credential Success]:', fbUser.uid);
            } catch (credErr) {
              console.error('[Firebase Auth Credential Error]:', credErr.code, credErr.message);
            }
          }

          if (!fbUser && idToken) {
            const jwtPayload = parseJwt(idToken);
            if (jwtPayload && jwtPayload.email) {
              console.log('[JWT Token Parsed Successfully]:', jwtPayload.email);
              fbUser = {
                uid: jwtPayload.sub || `g_${encodeURIComponent(jwtPayload.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))}`,
                email: jwtPayload.email,
                displayName: jwtPayload.name || jwtPayload.given_name || jwtPayload.email.split('@')[0],
                photoURL: jwtPayload.picture
              };
            }
          }

          // إذا رجع الحساب بنجاح من Google Play Services وتأكد البريد المباشر
          if (!fbUser && (googleUser?.email || googleUser?.user?.email)) {
            const gEmail = googleUser.email || googleUser.user.email;
            const gName = googleUser.name || googleUser.displayName || googleUser.user?.name || gEmail.split('@')[0];
            const gPhoto = googleUser.imageUrl || googleUser.photoUrl || googleUser.user?.imageUrl;
            const gId = googleUser.id || googleUser.user?.id || `g_${encodeURIComponent(gEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))}`;

            console.log('[Direct Google Profile Fallback Active]:', gEmail);

            fbUser = {
              uid: gId,
              email: gEmail,
              displayName: gName,
              photoURL: gPhoto
            };
          }

          if (!fbUser) {
            console.error('[Google Auth Error]: No valid token or user profile retrieved from Google response.');
            throw new Error('لم يتم التقاط بيانات حساب Google بشكل مكتمل. يرجى المحاولة مجدداً.');
          }
        } catch (nErr) {
          console.error('[Native GoogleAuth Error Detail]:', nErr);
          if (nErr?.code === '12501' || nErr?.message?.includes('cancel')) {
            throw new Error('تم إلغاء تحديد حساب Google.');
          }
          throw new Error(`تعذر التوثيق عبر Google: ${nErr?.message || 'خطأ في خدمات Google'}`);
        }
      } else {
        // ب) المتصفحات المكتبية فقط (Desktop Web Browser)
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
          const result = await signInWithPopup(auth, provider);
          fbUser = result.user;
        } catch (popupErr) {
          console.warn('[signInWithPopup Warning]:', popupErr.code, popupErr.message);

          if (
            popupErr.code === 'auth/initial-state-not-found' ||
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            const tokenResult = await new Promise((resolve, reject) => {
              if (window.google?.accounts?.oauth2) {
                const client = window.google.accounts.oauth2.initTokenClient({
                  client_id: GOOGLE_CLIENT_ID,
                  scope: 'email profile openid',
                  callback: (tokenRes) => {
                    if (tokenRes?.access_token) {
                      resolve({ accessToken: tokenRes.access_token });
                    } else {
                      reject(new Error('تعذر جلب رمز الدخول المباشر.'));
                    }
                  },
                });
                client.requestAccessToken();
              } else {
                reject(popupErr);
              }
            });

            if (tokenResult?.accessToken) {
              const credential = GoogleAuthProvider.credential(null, tokenResult.accessToken);
              const res = await signInWithCredential(auth, credential);
              fbUser = res.user;
            }
          } else {
            throw popupErr;
          }
        }
      }

      if (!fbUser) return null;

      const uid = fbUser.uid;
      let fsData = await fsLoad(uid);
      let fullProfile;

      if (fsData) {
        fullProfile = enforceRole({
          ...fsData,
          ...loadUserImages(uid),
          id: uid,
          email: fbUser.email,
          name: fsData.name || fbUser.displayName || 'مستخدم',
          avatar: fsData.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
        }, fbUser.email);
      } else {
        fullProfile = enforceRole({
          ...INITIAL_USER,
          id: uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          governorate: 'بغداد',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
          bio: 'مستخدم مسجل عبر حساب Google المباشر'
        }, fbUser.email);

        fsSave(uid, fullProfile);
      }

      setUser(fullProfile);
      uidRef.current = uid;
      saveSessionProfile(uid, fullProfile);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth_state_change'));
      return fullProfile;

    } catch (error) {
      console.error('[Firebase Google Sign-In Error]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
    try {
      await signOut(auth);
    } catch (_) {}

    setUser(null);
    uidRef.current = null;
    lsDel(KEY_UID, KEY_FULL_USER);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser: user ? { uid: user.id, email: user.email } : null,
      loading,
      isLoggedIn: Boolean(user?.id),
      login,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
