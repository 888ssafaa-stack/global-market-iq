// src/components/Footer.jsx
import React from 'react';
import { 
  PhoneCall, 
  Info, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Mail, 
  MapPin, 
  Heart, 
  Handshake, 
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react';

export default function Footer({ onOpenPage }) {
  return (
    <footer className="main-footer" style={{
      background: 'var(--fb-surface, #1e293b)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: '60px',
      padding: '40px 20px 24px 20px',
      color: 'var(--fb-text-primary, #f8fafc)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
        paddingBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* العمود الأول: عن المنصة */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '900',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Globe size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--fb-text-primary, #fff)' }}>
                السوق العالمي <span style={{ color: '#10B981', fontSize: '0.85rem' }}>IQ</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
                منصة التسوق والإعلانات المباشرة 🇮🇶
              </span>
            </div>
          </div>
          <p style={{ 
            fontSize: '0.88rem', 
            lineHeight: '1.6', 
            color: 'var(--fb-text-secondary, #94a3b8)',
            marginBottom: '16px' 
          }}>
            منصة "السوق العالمي" هي البيئة الرقمية الأولى الموثوقة للتسويق الإلكتروني، الإعلانات المبوبة، وبناء الشراكات الاقتصادية المباشرة في العراق والعالم العربي.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#10B981', fontWeight: '700' }}>
            <Sparkles size={16} />
            <span>آمن 100% • سريع • شراكات اقتصادية حقيقية</span>
          </div>

          <a
            href="/app.apk"
            download="app.apk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Download size={16} />
            <span>تحميل تطبيق Android</span>
          </a>
        </div>

        {/* العمود الثاني: روابط الموثوقية والثقة */}
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '800', 
            color: 'var(--fb-text-primary, #fff)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} style={{ color: '#10B981' }} />
            <span>صفحات الثقة والموثوقية</span>
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <button 
                onClick={() => onOpenPage('contact')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fb-text-secondary, #cbd5e1)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fb-text-secondary, #cbd5e1)'}
              >
                <PhoneCall size={16} style={{ color: '#3B82F6' }} />
                <span>اتصل بنا (Contact Us)</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenPage('about')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fb-text-secondary, #cbd5e1)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fb-text-secondary, #cbd5e1)'}
              >
                <Info size={16} style={{ color: '#10B981' }} />
                <span>من نحن / عن المنصة (About Us)</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenPage('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fb-text-secondary, #cbd5e1)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fb-text-secondary, #cbd5e1)'}
              >
                <ShieldCheck size={16} style={{ color: '#F59E0B' }} />
                <span>سياسة الخصوصية (Privacy Policy)</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenPage('terms')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fb-text-secondary, #cbd5e1)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fb-text-secondary, #cbd5e1)'}
              >
                <FileText size={16} style={{ color: '#EC4899' }} />
                <span>شروط الاستخدام (Terms & Conditions)</span>
              </button>
            </li>
          </ul>
        </div>

        {/* العمود الثالث: بيانات التواصل والمقر */}
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '800', 
            color: 'var(--fb-text-primary, #fff)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Mail size={18} style={{ color: '#3B82F6' }} />
            <span>بيانات الدعم والتواصل</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ color: '#EF4444' }} />
              <span>المقر الرئيسي: العراق - بغداد</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: '#3B82F6' }} />
              <span>البريد الإلكتروني: 888ssafaa@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={16} style={{ color: '#10B981' }} />
              <span>خدمة العملاء: متوفرة 24/7 عبر منصة الإشعارات</span>
            </div>
          </div>
        </div>

      </div>

      {/* شريط حقوق الملكية والتذييل السفلي */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '0.82rem',
        color: 'var(--fb-text-secondary, #64748b)'
      }}>
        <div>
          © 2026 <strong style={{ color: '#10B981' }}>السوق العالمي Global Market IQ</strong> — جميع الحقوق محفوظة.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            تم التطوير بحب وشغف <Heart size={14} fill="#EF4444" color="#EF4444" /> لتسريع التجارة في العراق والعالم العربي
          </span>
        </div>
      </div>
    </footer>
  );
}
