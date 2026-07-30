import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { X, LogIn, UserPlus, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { GOVERNORATES } from '../data/mockData';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext.jsx';

const makeAvatar = (name, bg = 'EC4899') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=ffffff&size=200&bold=true&font-size=0.4`;

const DEFAULT_COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1877F2"/><stop offset="50%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><text x="600" y="220" text-anchor="middle" fill="white" font-size="42" font-family="Arial" opacity="0.35">Global Market IQ</text></svg>')}`;

// ترجمة وتراخيص رسائل خطأ Firebase و Google OAuth للعربية
const translateError = (code, rawMsg) => {
  const map = {
    'auth/initial-state-not-found': '⏳ جاري استكمال المصادقة وتثبيت جلسة Google بنجاح...',
    'auth/unauthorized-domain': '⚠️ النطاق (global-market-iq.com) غير معتمد في Firebase! يرجى تفقّد إعدادات Firebase Console.',
    'auth/operation-not-allowed': '⚠️ تسجيل الدخول عبر Google غير مفعّل في Firebase Console. يرجى تفعيله من قائمة Sign-in method.',
    'auth/popup-blocked': '⚠️ تم حظر نافذة جوجل المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة (Popups).',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول بـ Google قبل إكمال العملية.',
    'auth/configuration-not-found': '⚠️ إعدادات Google Provider غير مكتملة في منصة Firebase.',
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجّل مسبقاً. يرجى تسجيل الدخول.',
    'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل).',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني.',
    'auth/wrong-password': 'كلمة المرور غير صحيحة.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/too-many-requests': 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.',
    'auth/network-request-failed': 'فشل الاتصال بالإنترنت. تحقق من اتصالك.',
  };
  return map[code] || (rawMsg ? `حدث خطأ في المصادقة (${code}): ${rawMsg}` : 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.');
};

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    governorate: 'بغداد',
    area: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    setSuccess('');
    setIsLoading(false);
    setFormData({ email: '', password: '', name: '', phone: '', governorate: 'بغداد', area: '' });
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (loginWithGoogle) {
        const userObj = await loginWithGoogle();
        if (userObj) {
          setSuccess(`✅ تم الدخول بحساب Google بنجاح! مرحباً ${userObj.name}`);
          setTimeout(handleClose, 1000);
        } else {
          setSuccess('⏳ جاري إعادة التوجيه لتثبيت الجلسة وحساب Google...');
        }
      }
    } catch (err) {
      console.error('[Google Auth Debug Log]:', err.code, err.message, err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(translateError(err.code, err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // ─── تسجيل حساب جديد ───
        if (!formData.name || !formData.phone) {
          setError('يرجى ملء الاسم الكامل ورقم الهاتف');
          setIsLoading(false);
          return;
        }

        // إنشاء الحساب في Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = cred.user;

        // تحديث اسم العرض في Firebase Auth
        await updateProfile(fbUser, { displayName: formData.name });

        // بناء كائن الملف الشخصي الكامل
        const profile = {
          id: fbUser.uid,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          governorate: formData.governorate,
          area: formData.area || 'غير محددة',
          avatar: makeAvatar(formData.name),
          cover: DEFAULT_COVER,
          birthDate: '',
          education: '',
          gender: '',
          bio: 'مرحباً بكم في صفحتي الشخصية!',
          role: 'REGULAR_USER',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
        };

        // حفظ الملف الشخصي في Firestore مباشرة
        try {
          const ref = doc(db, 'users', fbUser.uid);
          await setDoc(ref, profile, { merge: true });
        } catch (fsErr) {
          console.warn('[AuthModal] Firestore save warning:', fsErr.message);
        }

        // تحديث الـ State محلياً فوراً
        login(profile);

        setSuccess(`✅ تم إنشاء حسابك بنجاح! مرحباً ${formData.name}`);
        setTimeout(handleClose, 1200);

      } else {
        // ─── تسجيل الدخول ───
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // onAuthStateChanged في AuthContext سيلتقط الجلسة تلقائياً ويحمّل الملف الشخصي

        setSuccess('✅ تم تسجيل دخولك بنجاح!');
        setTimeout(handleClose, 800);
      }

    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRegister ? <UserPlus size={22} color="#1877F2" /> : <LogIn size={22} color="#1877F2" />}
            <span>{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</span>
          </h3>
          <button className="modal-close-btn" onClick={handleClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* رسائل الخطأ والنجاح */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
              {success}
            </div>
          )}

          {/* 🚀 زر التسجيل والدخول الفوري عبر Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid #DADCE0',
              background: '#FFFFFF',
              color: '#3C4043',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              marginBottom: '14px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.55 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>متابعة باستخدام حساب Google</span>
          </button>

          {/* الفاصل البصري */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--fb-divider)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)', fontWeight: '700' }}>أو عبر البريد الإلكتروني</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--fb-divider)' }} />
          </div>

          {/* الاسم الكامل */}
          {isRegister && (
            <div className="form-group">
              <label>الاسم الكامل</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: صفاء عبد الحسين"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ paddingRight: '36px' }}
                  disabled={isLoading}
                />
                <User size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: '#65676b' }} />
              </div>
            </div>
          )}

          {/* البريد الإلكتروني */}
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingRight: '36px' }}
                required
                autoComplete="email"
                disabled={isLoading}
              />
              <Mail size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: '#65676b' }} />
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="form-group">
            <label>كلمة المرور (6 أحرف على الأقل)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingRight: '36px', paddingLeft: '36px' }}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                disabled={isLoading}
              />
              <Lock size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: '#65676b' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', left: '10px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#65676b', padding: 0 }}
                title={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* حقول التسجيل الإضافية */}
          {isRegister && (
            <>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="07701234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ paddingRight: '36px' }}
                    disabled={isLoading}
                  />
                  <Phone size={18} style={{ position: 'absolute', right: '10px', top: '12px', color: '#65676b' }} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>المحافظة</label>
                  <select
                    className="form-select"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    disabled={isLoading}
                  >
                    {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>المنطقة</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="المنصور، الكرادة..."
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
          >
            <CheckCircle size={18} />
            <span>{isLoading ? 'جارٍ المعالجة...' : isRegister ? 'إنشاء الحساب والدخول' : 'تسجيل الدخول'}</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.9rem', color: 'var(--fb-text-secondary)' }}>
            {isRegister ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
              disabled={isLoading}
            >
              {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
