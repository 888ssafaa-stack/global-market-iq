// src/components/ProfileSettingsModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  X, Save, UserCheck, MapPin, Calendar,
  GraduationCap, Phone, Camera, CheckCircle, AlertCircle
} from 'lucide-react';
import { GOVERNORATES } from '../data/mockData';
import { useAuth, saveUserImages } from '../context/AuthContext.jsx';

// ─── FileReader → Base64 ──────────────────────────────────
const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─── ضغط الصورة قبل الحفظ (تصغير حتى 400×400) ───────────
const compressImage = (base64, maxPx = 400) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = base64;
  });

// ─────────────────────────────────────────────────────────
export default function ProfileSettingsModal({ isOpen, onClose, user, onSave }) {
  const { updateUser, firebaseUser } = useAuth();

  const [form, setForm]       = useState({});
  const [status, setStatus]   = useState('idle'); // idle | saving | saved | error
  const [errMsg, setErrMsg]   = useState('');

  const avatarRef = useRef(null);
  const coverRef  = useRef(null);

  // تحميل بيانات المستخدم عند فتح النافذة
  useEffect(() => {
    if (isOpen && user) {
      setForm({ ...user });
      setStatus('idle');
      setErrMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // ─── رفع صورة مضغوطة وحفظها فوراً ───────────────────────────
  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await toBase64(file);
      const maxPx = field === 'avatar' ? 300 : 600;
      const compressed = await compressImage(raw, maxPx);

      // 1. تحديث form state (للمعاينة الفورية)
      setForm(prev => ({ ...prev, [field]: compressed }));

      // 2. حفظ الصورة فوراً في localStorage بمفتاح مخصص
      //    لا تنتظر الضغط على "حفظ" — تُحفظ لحظة الرفع
      const uid = firebaseUser?.uid || user?.id;
      if (uid) {
        if (field === 'avatar') localStorage.setItem(`gm_avatar_${uid}`, compressed);
        if (field === 'cover')  localStorage.setItem(`gm_cover_${uid}`,  compressed);
      }
    } catch {
      alert('فشل في تحميل الصورة.');
    }
  };

  // ─── حفظ في Firestore ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrMsg('');

    try {
      // حفظ الصور بمفاتيح مخصصة قبل الإرسال (ضمان مضاعف)
      const uid = firebaseUser?.uid || user?.id;
      if (uid) saveUserImages(uid, form);

      // استدعاء updateUser من AuthContext (يحفظ في Firestore + localStorage)
      const saved = await updateUser(form);

      // إشعار App.jsx أيضاً (لتحديث الـ state المحلي)
      if (onSave) onSave(saved || form);

      setStatus('saved');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);

    } catch (err) {
      console.error('[ProfileSettings] Save error:', err);
      setErrMsg(err?.message || 'فشل الحفظ. تحقق من الاتصال بالإنترنت.');
      setStatus('error');
    }
  };

  const isSaving = status === 'saving';
  const isSaved  = status === 'saved';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>

        {/* ─── Header ────────────────────────────────────── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} color="#1877F2" />
            <h3>إعدادات الملف الشخصي</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">

          {/* ─── رسائل الحالة ────────────────────────────── */}
          {status === 'error' && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={16} /> {errMsg}
            </div>
          )}
          {isSaved && (
            <div style={{ padding: '10px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '700' }}>
              <CheckCircle size={16} /> تم حفظ البيانات في Firestore بنجاح ✓
            </div>
          )}

          {/* ─── صورة الغلاف ────────────────────────────── */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px' }}>صورة الغلاف (Cover)</label>
            <div
              onClick={() => coverRef.current?.click()}
              style={{
                width: '100%', height: '110px', borderRadius: '12px',
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                border: '2px dashed var(--fb-divider)', background: 'var(--fb-bg-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {form.cover
                ? <img src={form.cover} alt="غلاف" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--fb-text-secondary)' }}>انقر لرفع صورة الغلاف</span>
              }
              <div style={{
                position: 'absolute', bottom: 8, right: 8,
                background: 'rgba(0,0,0,0.6)', borderRadius: '8px',
                padding: '4px 10px', color: '#fff', fontSize: '0.78rem',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <Camera size={13} /> تغيير الغلاف
              </div>
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, 'cover')} />
          </div>

          {/* ─── الصورة الشخصية ─────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&background=EC4899&color=fff&size=200`}
                alt="avatar"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1877F2' }}
              />
              <button type="button" onClick={() => avatarRef.current?.click()}
                style={{ position: 'absolute', bottom: -2, right: -2, background: '#1877F2', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Camera size={14} />
              </button>
            </div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>الصورة الشخصية (Avatar)</div>
              <button type="button" className="action-btn" onClick={() => avatarRef.current?.click()} style={{ fontSize: '0.85rem' }}>
                <Camera size={14} /> رفع صورة من الجهاز
              </button>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          {/* ─── الاسم + الهاتف ─────────────────────────── */}
          <div className="form-row-2">
            <div className="form-group">
              <label>الاسم الكامل *</label>
              <input type="text" className="form-input" required
                value={form.name || ''}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label><Phone size={13} style={{ marginLeft: 4 }} />رقم الهاتف *</label>
              <input type="tel" className="form-input" required
                value={form.phone || ''}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          {/* ─── الجنس + تاريخ الميلاد ───────────────────── */}
          <div className="form-row-2">
            <div className="form-group">
              <label>الجنس</label>
              <select className="form-select"
                value={form.gender || ''}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                <option value="">-- اختر --</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div className="form-group">
              <label><Calendar size={13} style={{ marginLeft: 4 }} />تاريخ الميلاد</label>
              <input type="date" className="form-input"
                value={form.birthDate || ''}
                onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))} />
            </div>
          </div>

          {/* ─── المحافظة + المنطقة ──────────────────────── */}
          <div className="form-row-2">
            <div className="form-group">
              <label><MapPin size={13} style={{ marginLeft: 4 }} />المحافظة</label>
              <select className="form-select"
                value={form.governorate || 'بغداد'}
                onChange={e => setForm(p => ({ ...p, governorate: e.target.value }))}>
                {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>المنطقة / السكن</label>
              <input type="text" className="form-input"
                value={form.area || ''}
                onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />
            </div>
          </div>

          {/* ─── الدراسة ─────────────────────────────────── */}
          <div className="form-group">
            <label><GraduationCap size={13} style={{ marginLeft: 4 }} />المستوى الدراسي</label>
            <input type="text" className="form-input"
              placeholder="مثال: بكالوريوس هندسة، طالب ثانوي"
              value={form.education || ''}
              onChange={e => setForm(p => ({ ...p, education: e.target.value }))} />
          </div>

          {/* ─── النبذة التعريفية ────────────────────────── */}
          <div className="form-group">
            <label>نبذة تعريفية (Bio)</label>
            <textarea className="form-textarea" rows={3}
              value={form.bio || ''}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>

          {/* ─── معلومات Firebase ─────────────────────────── */}
          {firebaseUser && (
            <div style={{ fontSize: '0.78rem', color: 'var(--fb-text-secondary)', padding: '8px 12px', background: 'var(--fb-bg-light)', borderRadius: '8px', marginBottom: '8px' }}>
              🔗 متصل بـ Firebase | uid: <code style={{ fontSize: '0.7rem' }}>{firebaseUser.uid?.slice(0, 12)}...</code>
            </div>
          )}

          {/* ─── أزرار الحفظ ─────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="action-btn" onClick={onClose} disabled={isSaving}>
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving || isSaved}
              style={{ minWidth: '150px', justifyContent: 'center' }}
            >
              {isSaved ? (
                <><CheckCircle size={18} /><span>تم الحفظ ✓</span></>
              ) : isSaving ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '3px solid rgba(255,255,255,0.4)',
                    borderTop: '3px solid #fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  <span>جارٍ الحفظ في Firestore...</span>
                </>
              ) : (
                <><Save size={18} /><span>حفظ الإعدادات</span></>
              )}
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      </div>
    </div>
  );
}
