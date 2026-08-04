import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, RefreshCw, CheckCircle2 } from 'lucide-react';

export const CURRENT_APP_VERSION = "1.0.6"; // الإصدار الحالي المثبت

export default function UpdateModal() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!response.ok) return;
        const data = await response.json();
        
        if (data && data.version) {
          // مقارنة رقم الإصدار على السيرفر بالإصدار الحالي
          const isNewer = compareVersions(data.version, CURRENT_APP_VERSION) > 0;
          
          if (isNewer) {
            setUpdateInfo(data);
            // التأكد مما إذا كان المستخدم قد أغلق التنبيه سابقاً بنفس الإصدار
            const dismissed = localStorage.getItem(`gm_dismissed_update_${data.version}`);
            if (!dismissed || data.forceUpdate) {
              setIsOpen(true);
            }
          }
        }
      } catch (err) {
        console.warn('[Update Checker Warning]:', err);
      }
    };

    // فحص التحديثات فور فتح التطبيق وكل 60 ثانية وعند العودة للتطبيق
    checkAppVersion();
    const interval = setInterval(checkAppVersion, 60000);
    window.addEventListener('focus', checkAppVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkAppVersion);
    };
  }, []);

  // دالة تكميلية لمقارنة الأرقام النسخية (e.g. "1.0.1" vs "1.0.0")
  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  };

  const handleDismiss = () => {
    if (updateInfo) {
      localStorage.setItem(`gm_dismissed_update_${updateInfo.version}`, 'true');
    }
    setIsOpen(false);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // توجيه المتصفح لتنزيل الحزمة المباشرة
    const link = document.createElement('a');
    link.href = updateInfo?.downloadUrl || '/app.apk';
    link.download = 'app.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 4000);
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '440px', 
          width: 'min(92vw, 440px)', 
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1.5px solid #E5E7EB',
          animation: 'fadeInScale 0.3s ease-out'
        }}
      >
        {/* الهيدر مع تدرج لوني مميز */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1877F2 0%, #2563EB 100%)', 
            color: '#ffffff', 
            padding: '24px 20px', 
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {!updateInfo.forceUpdate && (
            <button 
              onClick={handleDismiss} 
              style={{ 
                position: 'absolute', 
                top: '14px', 
                left: '14px', 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                cursor: 'pointer' 
              }}
            >
              <X size={18} />
            </button>
          )}

          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 12px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <RefreshCw size={32} color="#ffffff" className="spin-pulse" />
          </div>

          <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: '800' }}>
            تحديث جديد متوفر للتطبيق! 🚀
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
            الإصدار الجاهز الآن: <span style={{ fontWeight: '700', textDecoration: 'underline' }}>v{updateInfo.version}</span>
          </p>
        </div>

        {/* جسم النافذة */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
          <div style={{ background: '#F3F4F6', padding: '14px 16px', borderRadius: '14px', borderRight: '4px solid #1877F2' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#1877F2" />
              <span>ما الجديد في هذا التحديث؟</span>
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6 }}>
              {updateInfo.changelog || 'تحسينات أمنية جديدة، رفع سرعة الاستجابة، وتجربة استخدام أكثر سلاسة.'}
            </p>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} color="#10B981" />
            <span>تنزيل مباشر للتثبيت دون الحاجة لإلغاء النسخة القديمة.</span>
          </div>

          {/* زر التنزيل والتحديث الفوري */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: isDownloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Download size={20} />
            <span>{isDownloading ? 'جاري بدء التنزيل...' : 'تحديث التطبيق الآن (تحميل مباشر) 📲'}</span>
          </button>

          {!updateInfo.forceUpdate && (
            <button
              onClick={handleDismiss}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                color: '#6B7280',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              تذكيري لاحقاً
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
