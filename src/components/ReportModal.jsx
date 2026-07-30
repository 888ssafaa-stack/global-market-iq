import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react';

const REPORT_REASONS = [
  { id: 'PORNOGRAPHIC', label: 'محتوى إباحي أو غير لائق 🔞' },
  { id: 'CRIME_FRAUD', label: 'احتيال، سرقة أو نشاط غير قانوني 🚨' },
  { id: 'HATE_SPEECH', label: 'خطاب كراهية، عنف أو إساءة ⚠️' },
  { id: 'MISLEADING', label: 'إعلان مضلل أو معلومات زرقاء/كاذبة ❌' },
  { id: 'OTHER', label: 'سبب آخر 💬' }
];

export default function ReportModal({ isOpen, onClose, listing, onSubmitReport }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !listing) return null;

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('يرجى اختيار سبب الإبلاغ أولاً');
      return;
    }

    const reportData = {
      id: `report_${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingUser: listing.userName,
      listingUserId: listing.userId,
      reason: selectedReason,
      reasonLabel: REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason,
      details: details.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    onSubmitReport(reportData);
    setSubmitted(true);
    setTimeout(handleClose, 1500);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
            <Flag size={24} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>الإبلاغ عن إعلان مسيء</h3>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fb-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <CheckCircle size={48} color="#10B981" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>تم إرسال بلاغك بنجاح!</h4>
            <p style={{ color: 'var(--fb-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              شكراً لمساعدتنا في الحفاظ على بيئة آمنة للمجتمع. سيقوم إدارة الموقع بمراجعة الإعلان اتخاذ الإجراء اللازم.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--fb-input-bg)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--fb-text-secondary)' }}>الإعلان المُبلغ عنه:</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginTop: '2px' }}>{listing.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                بواسطة: {listing.userName}
              </div>
            </div>

            {error && (
              <div style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>
                حدد سبب الإبلاغ:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${selectedReason === r.id ? '#DC2626' : 'var(--fb-divider)'}`,
                      background: selectedReason === r.id ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: selectedReason === r.id ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => { setSelectedReason(r.id); setError(''); }}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>
                تفاصيل إضافية (اختياري):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="اكتب أي ملاحظات قد تساعد الإدارة في المراجعة..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--fb-divider)',
                  background: 'var(--fb-input-bg)',
                  color: 'inherit',
                  fontSize: '0.9rem',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--fb-divider)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'inherit'
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Flag size={16} />
                <span>إرسال البلاغ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
