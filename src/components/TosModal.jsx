import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TosModal({ isOpen, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '560px', border: '2px solid #F59E0B' }}>
        <div className="modal-header" style={{ background: '#FEF3C7', color: '#92400E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} color="#D97706" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              اتفاقية الاستخدام وإخلاء المسؤولية المالية
            </h3>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div 
            style={{ 
              backgroundColor: 'var(--fb-bg-light)', 
              padding: '18px', 
              borderRadius: '12px', 
              borderRight: '5px solid #F59E0B',
              fontSize: '1rem',
              lineHeight: '1.7',
              color: 'var(--fb-text-primary)',
              fontWeight: '600'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#D97706', fontWeight: '800', fontSize: '1.1rem' }}>
              <ShieldAlert size={20} />
              <span>تنبيه هام وإخلاء مسؤولية:</span>
            </div>

            <p>
              "تنبيه هام: هذا الموقع هو منصة للتواصل والإعلانات المبوبة فقط، وإدارة الموقع غير مسؤولة نهائياً عن أي تعاملات مالية أو تجارية أو عمليات تسليم تتم بين البائع والمشتري. يرجى توخي الحذر والتعامل يداً بيد."
            </p>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--fb-text-secondary)', textAlign: 'center' }}>
            بضغطك على زر الموافقة أدناه، تشتمل إقرارك الكامل بفهم هذه الاتفاقية والالتزام بجميع قواعد الأمان.
          </div>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={onAccept}
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '14px', 
              fontSize: '1.05rem', 
              marginTop: '12px',
              backgroundColor: '#10B981'
            }}
          >
            <CheckCircle2 size={20} />
            <span>قرأت الاتفاقية وأوافق على الشروط</span>
          </button>
        </div>
      </div>
    </div>
  );
}
