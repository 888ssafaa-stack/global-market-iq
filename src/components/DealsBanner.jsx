import React, { useState, useEffect } from 'react';
import { Flame, Clock, Tag, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

// ─── مكوّن العداد التنازلي المباشر ⏳ ───────────────────────
export function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));

  function calculateTimeLeft(targetDate) {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(endDate);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: '700' }}>
        ⚠️ انتهى العرض
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', dir: 'ltr' }}>
      {timeLeft.days > 0 && (
        <span style={{
          background: '#EF4444', color: '#fff', padding: '2px 6px',
          borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800'
        }}>
          {timeLeft.days}د
        </span>
      )}
      <span style={{
        background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '2px 5px',
        borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800'
      }}>
        {String(timeLeft.hours).padStart(2, '0')}س
      </span>
      <span style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>:</span>
      <span style={{
        background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '2px 5px',
        borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800'
      }}>
        {String(timeLeft.minutes).padStart(2, '0')}د
      </span>
      <span style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.75rem' }}>:</span>
      <span style={{
        background: '#EF4444', color: '#fff', padding: '2px 5px',
        borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', minWidth: '22px', textAlign: 'center'
      }}>
        {String(timeLeft.seconds).padStart(2, '0')}ث
      </span>
    </div>
  );
}

// ─── مكوّن شريط العروض البارز في صدر الصفحة 🏷️ ────────────────
export default function DealsBanner({ deals = [], onSelectListing, onAddDeal, onViewUserProfile }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (deals.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };

  const handlePrev = () => {
    if (deals.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
  };

  const activeDeal = deals[currentIndex] || {};
  const originalPrice = Number(activeDeal?.originalPrice || activeDeal?.price * 1.3);
  const currentPrice = Number(activeDeal?.price || 0);
  const discountPercent = activeDeal?.originalPrice && activeDeal?.originalPrice > activeDeal?.price
    ? Math.round(((activeDeal.originalPrice - activeDeal.price) / activeDeal.originalPrice) * 100)
    : 25;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E1E24 0%, #2D1B2D 50%, #18191A 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.25)',
      padding: '20px',
      marginBottom: '24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* خلفية جمالية مأطورة */}
      <div style={{
        position: 'absolute', top: '-40px', left: '-40px', width: '140px', height: '140px',
        borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', filter: 'blur(30px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', right: '-40px', width: '140px', height: '140px',
        borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', filter: 'blur(30px)', pointerEvents: 'none'
      }} />

      {/* رأس الشريط */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
            padding: '8px 14px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <Flame size={20} color="#fff" />
            <span style={{ fontWeight: '800', fontSize: '1rem' }}>عروض مخفضة لفترة محدودة 🏷️🔥</span>
          </div>
          {deals.length > 0 && (
            <span style={{ fontSize: '0.85rem', color: '#F3F4F6', fontWeight: '600' }}>
              ({currentIndex + 1} من {deals.length} عرض)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onAddDeal && (
            <button
              onClick={onAddDeal}
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Zap size={16} />
              <span>🔥 أضف عرضاً مخفضاً جديداً</span>
            </button>
          )}

          {deals.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrev}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={handleNext}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* بطاقة العرض البارز الحالي */}
      <div 
        onClick={() => onSelectListing && onSelectListing(activeDeal)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
      >
        {/* صورة العرض */}
        <div style={{ position: 'relative', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
          <img
            src={activeDeal.images?.[0] || activeDeal.userAvatar}
            alt={activeDeal.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: '#fff', padding: '4px 10px', borderRadius: '8px',
            fontWeight: '900', fontSize: '0.85rem', boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            خصم {discountPercent}% 🔥
          </div>
        </div>

        {/* تفاصيل العرض والعداد التنازلي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} />
              <span>عرض حصري فوري</span>
            </div>

            {activeDeal.userName && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewUserProfile) onViewUserProfile(activeDeal.userId);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 255, 255, 0.12)', padding: '4px 10px',
                  borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)'
                }}
                title={`فتح الملف الشخصي لـ ${activeDeal.userName}`}
              >
                <img src={activeDeal.userAvatar} alt={activeDeal.userName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '700', textDecoration: 'underline' }}>{activeDeal.userName} 👤</span>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, lineHeight: 1.4, color: '#fff' }}>
            {activeDeal.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10B981' }}>
              {currentPrice.toLocaleString('ar-IQ')} {activeDeal.currency || 'IQD'}
            </span>
            <span style={{ fontSize: '1rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
              {originalPrice.toLocaleString('ar-IQ')} {activeDeal.currency || 'IQD'}
            </span>
          </div>

          {/* العداد التنازلي المباشر */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.3)', marginTop: '4px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F3F4F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#EF4444" />
              <span>ينتهي العرض خلال:</span>
            </div>
            <CountdownTimer endDate={activeDeal.dealEndDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString()} />
          </div>
        </div>
      </div>
    </div>
  );
}
