import React, { useState } from 'react';
import { X, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const handleAuthState = () => {
      const savedUser = localStorage.getItem('gm_user_profile');
      const savedUid = localStorage.getItem('gm_uid');
      if (savedUser && savedUid && isOpen) {
        setSuccess('✅ تم تسجيل الدخول بنجاح عبر حساب Google!');
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
          setSuccess(`✅ تم الدخول بنجاح! مرحباً ${userObj.name}`);
          setTimeout(handleClose, 600);
        }
      } else {
        throw new Error('خدمة مصادقة Google غير متوفرة حالياً');
      }
    } catch (err) {
      console.error('[Firebase Google Sign-In Error]:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول بـ Google. يرجى المحاولة مجدداً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px', width: 'min(92vw, 440px)', borderRadius: '18px', overflow: 'hidden' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <LogIn size={22} color="#1877F2" />
            <span>تسجيل الدخول إلى السوق العالمي</span>
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

          {/* زر تسجيل الدخول المباشر بـ Google (Firebase Auth) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '13px 18px',
              background: '#ffffff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              fontWeight: '700',
              color: '#1F2937',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isLoading ? 'جاري الاتصال بـ Google...' : 'متابعة باستخدام حساب Google 🚀'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
