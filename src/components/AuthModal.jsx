import React, { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { X, LogIn, UserPlus, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { GOVERNORATES } from '../data/mockData';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext.jsx';

const makeAvatar = (name, bg = '1877F2') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=ffffff&size=200&bold=true&font-size=0.4`;

const DEFAULT_COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1877F2"/><stop offset="50%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><text x="600" y="220" text-anchor="middle" fill="white" font-size="42" font-family="Arial" opacity="0.35">Global Market IQ</text></svg>')}`;

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

  // استماع فوري لإغلاق المودال تلقائياً عند التقاط توكن Google
  React.useEffect(() => {
    const handleAuthState = () => {
      const savedUser = localStorage.getItem('gm_user_profile');
      if (savedUser && isOpen) {
        setSuccess('✅ تم الدخول بحساب Google بنجاح!');
        setTimeout(handleClose, 500);
      }
    };
    window.addEventListener('auth_state_change', handleAuthState);
    return () => window.removeEventListener('auth_state_change', handleAuthState);
  }, [isOpen]);

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
          setTimeout(handleClose, 600);
        }
      }
    } catch (err) {
      console.error('[Google Auth Debug Log]:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول بـ Google. يرجى المحاولة مجدداً.');
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
      const uid = `u_${encodeURIComponent(formData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))}`;

      if (isRegister) {
        // ─── تسجيل حساب جديد ───
        if (!formData.name || !formData.phone) {
          setError('يرجى ملء الاسم الكامل ورقم الهاتف');
          setIsLoading(false);
          return;
        }

        const profile = {
          id: uid,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          governorate: formData.governorate,
          area: formData.area || 'غير محددة',
          avatar: makeAvatar(formData.name),
          cover: DEFAULT_COVER,
          bio: 'مرحباً بكم في صفحتي الشخصية!',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', uid), profile, { merge: true });
          } catch (_) {}
        }

        login(profile);
        setSuccess(`✅ تم إنشاء حسابك بنجاح! مرحباً ${formData.name}`);
        setTimeout(handleClose, 1200);

      } else {
        // ─── تسجيل الدخول ───
        let existingProfile = null;
        if (db) {
          try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) existingProfile = snap.data();
          } catch (_) {}
        }

        const profile = existingProfile || {
          id: uid,
          email: formData.email,
          name: formData.email.split('@')[0],
          governorate: 'بغداد',
          avatar: makeAvatar(formData.email.split('@')[0]),
          cover: DEFAULT_COVER,
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
        };

        login(profile);
        setSuccess(`✅ تم تسجيل دخولك بنجاح! مرحباً ${profile.name}`);
        setTimeout(handleClose, 800);
      }

    } catch (err) {
      setError('حدث خطأ أثناء عملية الدخول. يرجى التأكد من البيانات والمحاولة لاحقاً.');
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

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* زر تسجيل الدخول المباشر بـ Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px',
              background: '#ffffff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '10px',
              fontWeight: '600',
              color: '#374151',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>متابعة باستخدام حساب Google المباشر</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #E5E7EB' }}></div>
            <span style={{ padding: '0 10px', color: '#9CA3AF', fontSize: '12px' }}>أو عبر البريد الإلكتروني</span>
            <div style={{ flex: 1, borderBottom: '1px solid #E5E7EB' }}></div>
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>الاسم الكامل *</label>
                <div className="input-with-icon">
                  <User size={18} color="#9CA3AF" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: علي محمد"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>رقم الهاتف *</label>
                <div className="input-with-icon">
                  <Phone size={18} color="#9CA3AF" />
                  <input
                    type="tel"
                    required
                    placeholder="07700000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>المحافظة</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>المنطقة</label>
                  <input
                    type="text"
                    placeholder="مثال: الكرادة"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>البريد الإلكتروني *</label>
            <div className="input-with-icon">
              <Mail size={18} color="#9CA3AF" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>كلمة المرور *</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '6px',
              padding: '12px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'جاري المعالجة...' : isRegister ? 'إنشاء الحساب الآن' : 'تسجيل الدخول'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13.5px' }}>
            {isRegister ? (
              <span>لديك حساب بالفعل؟ <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '600', cursor: 'pointer' }}>تسجيل الدخول</button></span>
            ) : (
              <span>ليس لديك حساب؟ <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: '600', cursor: 'pointer' }}>إنشاء حساب جديد</button></span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
