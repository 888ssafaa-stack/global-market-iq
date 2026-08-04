import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { GOVERNORATES } from '../data/mockData';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    governorate: 'بغداد',
  });

  React.useEffect(() => {
    const handleAuthState = () => {
      const savedUser = localStorage.getItem('gm_user_profile');
      const savedUid = localStorage.getItem('gm_uid');
      if (savedUser && savedUid && isOpen) {
        setSuccess('✅ تم تسجيل الدخول بنجاح!');
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
    setFormData({ email: '', password: '', name: '', phone: '', governorate: 'بغداد' });
    onClose();
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const userObj = await loginWithGoogle();
      if (userObj) {
        setSuccess(`🎉 تم تسجيل الدخول بنجاح عبر حساب Google! مرحباً بك ${userObj.name}`);
        setTimeout(handleClose, 600);
      }
    } catch (err) {
      console.error('[Google Login Error]:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('تعذر إكمال تسجيل الدخول عبر Google. يرجى المحاولة مجدداً أو الاستمرار بالبريد.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        if (!formData.name) {
          setError('يرجى كتابة الاسم الكامل');
          setIsLoading(false);
          return;
        }
        const userObj = await registerWithEmail(formData);
        if (userObj) {
          setSuccess(`🎉 تم إنشاء حسابك بنجاح! مرحباً بك ${userObj.name}`);
          setTimeout(handleClose, 600);
        }
      } else {
        const userObj = await loginWithEmail(formData.email, formData.password);
        if (userObj) {
          setSuccess(`✅ تم تسجيل دخولك بنجاح! مرحباً ${userObj.name}`);
          setTimeout(handleClose, 600);
        }
      }
    } catch (err) {
      console.error('[Email Auth Error]:', err);
      setError('تعذر إكمال عملية الدخول بالبريد. يرجى التأكد من البيانات والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px', width: 'min(92vw, 460px)', borderRadius: '20px', overflow: 'hidden' }}>
        {/* هيدر المودال */}
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--fb-divider, #e5e7eb)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.15rem' }}>
            {isRegister ? <UserPlus size={22} color="#1877F2" /> : <LogIn size={22} color="#1877F2" />}
            <span>{isRegister ? 'إنشاء حساب جديد في السوق العالمي' : 'تسجيل الدخول إلى السوق العالمي'}</span>
          </h3>
          <button className="modal-close-btn" onClick={handleClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* زر الدخول السريع عبر Google */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '11px 16px',
                backgroundColor: '#ffffff',
                color: '#1F2937',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>الدخول السريع باستخدام حساب Google</span>
            </button>
          </div>

          {/* فاصل بين أزرار الدخول السريع والبريد الإلكتروني */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', color: '#9CA3AF', fontSize: '13px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ padding: '0 10px', fontWeight: '600' }}>أو بواسطة البريد الإلكتروني</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>

          {/* نموذج البريد الإلكتروني وكلمة المرور المباشر الحصري */}
          <form onSubmit={handleSubmitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isRegister && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={isRegister}
                    style={{ width: '100%', padding: '11px 40px 11px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف (اختياري)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '11px 40px 11px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>المحافظة</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ width: '100%', padding: '11px 40px 11px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ width: '100%', padding: '11px 40px 11px 40px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #1877F2, #2563EB)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
              }}
            >
              {isLoading ? 'جاري التنفيذ...' : (isRegister ? 'إنشاء الحساب الآن' : 'تسجيل الدخول')}
            </button>
          </form>

          {/* تبديل بين الدخول وإنشاء حساب جديد */}
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => { setError(''); setIsRegister(!isRegister); }}
              style={{ border: 'none', background: 'none', color: '#1877F2', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
            >
              {isRegister ? 'لديك حساب بالفعل؟ سجل دخولك هنا' : 'ليس لديك حساب؟ اضغط هنا لإنشاء حساب جديد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
