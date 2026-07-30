// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// المصدر الأساسي: localStorage (فوري، لا يحتاج شبكة)
// المصدر الاحتياطي: Firebase Firestore (سحابي)
// الجلسة: Firebase Auth (browserLocalPersistence)
// ═══════════════════════════════════════════════════════════
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db } from '../firebase/config';
import { INITIAL_USER } from '../data/mockData';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ═══════════════════════════════════════════════════════════
// البريد الإلكتروني الوحيد الذي يملك صلاحية APP_OWNER
// ═══════════════════════════════════════════════════════════
const OWNER_EMAIL = '888ssafaa@gmail.com';

const enforceRole = (profile, email) => ({
  ...profile,
  role: (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ? 'APP_OWNER' : (profile?.role || 'REGULAR_USER'),
});

// ═══════════════════════════════════════════════════════════
// مفاتيح localStorage
// ═══════════════════════════════════════════════════════════
const KEY_UID     = 'gm_uid';          // آخر uid مسجّل
const KEY_TEXT    = (uid) => `gm_text_${uid}`;    // البيانات النصية فقط (صغيرة)
const KEY_AVATAR  = (uid) => `gm_avatar_${uid}`;  // صورة شخصية Base64
const KEY_COVER   = (uid) => `gm_cover_${uid}`;   // صورة غلاف Base64

// ═══════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════
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

// ─── حفظ النصوص فقط (بدون Base64) ─────────────────────────
const saveTextFields = (uid, profile) => {
  if (!uid) return;
  const text = {};
  Object.entries(profile).forEach(([k, v]) => {
    if (!isBase64(v)) text[k] = v;
  });
  jSet(KEY_TEXT(uid), text);
  lsSet(KEY_UID, uid);
};

// ─── حفظ الصور بمفاتيح مستقلة ──────────────────────────────
export const saveUserImages = (uid, profile) => {
  if (!uid) return;
  if (profile.avatar && isBase64(profile.avatar)) lsSet(KEY_AVATAR(uid), profile.avatar);
  if (profile.cover  && isBase64(profile.cover))  lsSet(KEY_COVER(uid),  profile.cover);
};

// ─── جلب كامل الملف (نصوص + صور) ──────────────────────────
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
      .then(() => console.log('[Firestore] ✓ saved'))
      .catch(e => console.warn('[Firestore] save failed:', e.code));
  } catch (_) {}
};

// ═══════════════════════════════════════════════════════════
// AuthProvider
// ═══════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  // ── تهيئة فورية من localStorage بدون انتظار ─────────────
  const lastUid = lsGet(KEY_UID);
  const [user, setUser]               = useState(() => loadFullProfile(lastUid));
  const [firebaseUser, setFirebaseUser] = useState(null);
  // loading = false إذا وُجد ملف محلي (لا داعي لانتظار Firebase)
  const [loading, setLoading]         = useState(!lastUid);

  const uidRef = useRef(lastUid);

  useEffect(() => {
    // 1. ضمان استمرارية الجلسة الصريحة بـ browserLocalPersistence
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // 2. التقاط وتثبيت نتائج إعادة التوجيه لـ Google Auth على متصفحات الهواتف
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          console.log('[Google Auth Redirect Result Success]:', res.user.email);
        }
      })
      .catch((err) => {
        console.warn('[Google Auth Redirect Result Log]:', err.code, err.message);
      });

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        uidRef.current = fbUser.uid;
        lsSet(KEY_UID, fbUser.uid);

        const local = loadFullProfile(fbUser.uid);

        if (local) {
          // ✅ بيانات محلية موجودة → استخدمها مع تطبيق الدور الصحيح
          const withRole = enforceRole({ ...local, id: fbUser.uid, email: fbUser.email }, fbUser.email);
          setUser(withRole);
          // مزامنة مع Firestore في الخلفية
          fsSave(fbUser.uid, withRole);
        } else {
          // لا توجد بيانات محلية → جلب من Firestore
          const fs = await fsLoad(fbUser.uid);
          if (fs) {
            const full = enforceRole({ ...fs, ...loadUserImages(fbUser.uid), id: fbUser.uid, email: fbUser.email }, fbUser.email);
            setUser(full);
            saveTextFields(fbUser.uid, full);
          } else {
            // مستخدم جديد
            const fresh = enforceRole({
              ...INITIAL_USER,
              id: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
              joinedDate: new Date().toLocaleDateString('ar-IQ'),
            }, fbUser.email);
            setUser(fresh);
            saveTextFields(fbUser.uid, fresh);
            fsSave(fbUser.uid, fresh);
          }
        }
      } else {
        // لا جلسة Firebase — تفعيل المصادقة السحابية لضمان عمل كافة القواعد والإشعارات
        setFirebaseUser(null);
        uidRef.current = null;
        if (!lastUid) setUser(null);
        signInAnonymously(auth).catch((err) => {
          console.warn('[Firebase Auth] Anonymous sign-in fallback error:', err.message);
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []); // eslint-disable-line

  // ── login ────────────────────────────────────────────────
  const login = (profileObj) => {
    const uid = profileObj?.id;
    setUser(profileObj);
    if (uid) {
      saveTextFields(uid, profileObj);
      saveUserImages(uid, profileObj);
    }
  };

  // ── updateUser ───────────────────────────────────────────
  const updateUser = async (updatedFields) => {
    const uid = firebaseUser?.uid || uidRef.current || user?.id;
    const merged = { ...(user || {}), ...updatedFields };
    if (uid) merged.id = uid;

    // 1. تحديث الـ State فوراً
    setUser(merged);

    // 2. حفظ النصوص في localStorage (مضمون لا يفشل)
    if (uid) {
      saveTextFields(uid, merged);
      saveUserImages(uid, merged);  // حفظ الصور بمفاتيحها المستقلة
      console.log('[Auth] ✓ saved locally for', uid);
    }

    // 3. مزامنة مع Firestore في الخلفية
    if (uid) fsSave(uid, merged);

    return merged;
  };

  // ── logout ───────────────────────────────────────────────
  const logout = async () => {
    const uid = firebaseUser?.uid || uidRef.current;
    try { await signOut(auth); } catch (_) {}
    setFirebaseUser(null);
    setUser(null);
    uidRef.current = null;
    lsDel(KEY_UID);
    if (uid) {
      lsDel(KEY_TEXT(uid), KEY_AVATAR(uid), KEY_COVER(uid));
    }
  };

  // ── loginWithGoogle ──────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      // 1. تثبيت إعدادات الجلسة الدائمة صراحة قبل أي عملية مصادقة
      await setPersistence(auth, browserLocalPersistence).catch(() => {});

      let fbUser;

      // 2. محاولة المصادقة الأصيلة (Native GoogleAuth) لتطبيقات الهواتف المحمولة
      try {
        if (Capacitor.isNativePlatform()) {
          GoogleAuth.initialize({
            clientId: '1068894096179-jmb60e6aoqd5m4mgq4sr6k5ee9hv5flq.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          const googleUser = await GoogleAuth.signIn();
          const idToken = googleUser.authentication?.idToken || googleUser.idToken;
          if (idToken) {
            const credential = GoogleAuthProvider.credential(idToken);
            const res = await signInWithCredential(auth, credential);
            fbUser = res.user;
          }
        }
      } catch (nativeErr) {
        console.warn('[Native GoogleAuth Warning]:', nativeErr.message, nativeErr);
      }

      // 3. للمتصفحات (الهاتف المحمول والكمبيوتر): signInWithPopup مع التراجع لـ signInWithRedirect
      if (!fbUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
          const result = await signInWithPopup(auth, provider);
          fbUser = result.user;
        } catch (popupErr) {
          if (
            popupErr.code === 'auth/initial-state-not-found' ||
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            console.warn('[Google Auth] Popup restricted, initiating signInWithRedirect...', popupErr.message);
            await signInWithRedirect(auth, provider);
            return null;
          }
          throw popupErr;
        }
      }

      let fsData = await fsLoad(fbUser.uid);
      let fullProfile;

      if (fsData) {
        fullProfile = enforceRole({
          ...fsData,
          ...loadUserImages(fbUser.uid),
          id: fbUser.uid,
          email: fbUser.email,
          name: fsData.name || fbUser.displayName || 'مستخدم',
          avatar: fsData.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
        }, fbUser.email);
      } else {
        fullProfile = enforceRole({
          ...INITIAL_USER,
          id: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          governorate: 'بغداد',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
          bio: 'مستخدم مسجل عبر حساب Google'
        }, fbUser.email);

        fsSave(fbUser.uid, fullProfile);
      }

      setUser(fullProfile);
      saveTextFields(fbUser.uid, fullProfile);
      return fullProfile;
    } catch (error) {
      console.error('[Google Sign-In Error]:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      isLoggedIn: Boolean(firebaseUser),
      login,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
