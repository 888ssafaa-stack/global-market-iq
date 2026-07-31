import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { GOVERNORATES } from '../data/mockData';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithEmail, registerWithEmail } = useAuth();
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
