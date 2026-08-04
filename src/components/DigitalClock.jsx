import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function DigitalClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🕒 1. تنسيق الوقت بنظام 12 ساعة مع إظهار حرفي (ص / م)
  let rawHours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = rawHours >= 12 ? 'م' : 'ص';
  
  let hours12 = rawHours % 12;
  hours12 = hours12 ? hours12 : 12;
  const formattedHours = String(hours12).padStart(2, '0');

  // 📅 2. تنسيق التاريخ الميلادي باللغة العربية المنسقة
  const gregorianDate = now.toLocaleDateString('ar-IQ-u-nu-latn', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      className="digital-clock-widget"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 12px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.12), rgba(16, 185, 129, 0.12))',
        border: '1px solid rgba(24, 119, 242, 0.25)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        transition: 'all 0.3s ease',
        minWidth: '150px'
      }}
      title={`الوقت الحالي والتاريخ الميلادي: ${gregorianDate}`}
    >
      {/* سطر الوقت الرقمي بنظام 12 ساعة */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'monospace, sans-serif',
          fontWeight: '900',
          fontSize: '0.98rem',
          color: '#1877F2',
          letterSpacing: '0.5px',
          lineHeight: '1.2'
        }}
      >
        <Clock size={15} color="#1877F2" />
        <span>{formattedHours}:{minutes}:{seconds}</span>
        <span 
          style={{
            fontSize: '0.82rem',
            fontWeight: '900',
            padding: '1px 5px',
            borderRadius: '6px',
            background: ampm === 'م' ? '#EF4444' : '#10B981',
            color: '#ffffff',
            marginRight: '2px',
            display: 'inline-block'
          }}
        >
          {ampm}
        </span>
      </div>

      {/* سطر التاريخ الميلادي المنسق تحت الوقت مباشرة */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          fontWeight: '700',
          color: 'var(--fb-text-secondary, #475569)',
          marginTop: '2px',
          whiteSpace: 'nowrap'
        }}
      >
        <Calendar size={12} color="#10B981" />
        <span>{gregorianDate}</span>
      </div>
    </div>
  );
}
