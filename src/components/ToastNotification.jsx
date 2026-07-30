import React, { useEffect, useState } from 'react';
import { Bell, Handshake, Check, X, MessageSquare } from 'lucide-react';

export default function ToastNotification({
  notifications = [],
  currentUser,
  onAcceptPartnership,
  onRejectPartnership,
  onMarkRead
}) {
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (!currentUser || !notifications || notifications.length === 0) return;

    // تصفية الإشعارات غير المقروءة الخاصة بالمستخدم الحالي بدقة شمولية
    const uId = String(currentUser.id || '').toLowerCase().trim();
    const uEmail = String(currentUser.email || '').toLowerCase().trim();
    const uName = String(currentUser.name || '').toLowerCase().trim();
    const prevUId = String(localStorage.getItem('gm_last_uid') || '').toLowerCase().trim();
    const isAppOwner = Boolean(
      currentUser?.role === 'APP_OWNER' ||
      (uEmail && uEmail === '888ssafaa@gmail.com')
    );

    const unread = notifications.filter(n => {
      if (n.isRead) return false;
      const targetId = String(n.targetUserId || '').toLowerCase().trim();
      const targetEmail = String(n.targetUserEmail || '').toLowerCase().trim();
      const targetName = String(n.targetUserName || '').toLowerCase().trim();

      if (isAppOwner && (targetId === 'app_owner_admin' || targetEmail === '888ssafaa@gmail.com')) {
        return true;
      }

      return (
        (uId && targetId === uId) ||
        (prevUId && targetId === prevUId) ||
        (uEmail && (targetId === uEmail || targetEmail === uEmail)) ||
        (uName && uName.length > 2 && (targetId === uName || targetName === uName))
      );
    });

    if (unread.length > 0) {
      const latest = unread[0];
      setActiveToast(latest);
    }
  }, [notifications, currentUser]);

  if (!activeToast) return null;

  const handleDismiss = () => {
    if (onMarkRead && activeToast) {
      onMarkRead(activeToast.id);
    }
    setActiveToast(null);
  };

  const handleAccept = () => {
    if (onAcceptPartnership && activeToast) {
      onAcceptPartnership(activeToast);
    }
    setActiveToast(null);
  };

  const handleReject = () => {
    if (onRejectPartnership && activeToast) {
      onRejectPartnership(activeToast);
    }
    setActiveToast(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '90%',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.3)',
        border: '1px solid rgba(139, 92, 246, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#7C3AED', padding: '8px', borderRadius: '50%', color: '#fff', display: 'flex' }}>
            {activeToast.type === 'partnership_request' || activeToast.type === 'partnership_accepted' ? (
              <Handshake size={20} />
            ) : activeToast.type === 'comment' ? (
              <MessageSquare size={20} />
            ) : (
              <Bell size={20} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              {activeToast.type === 'partnership_request' ? '🤝 طلب شراكة اقتصادية جديد!' :
               activeToast.type === 'partnership_accepted' ? '🤝 تم قبول طلب الشراكة!' :
               activeToast.type === 'comment' ? '💬 تعليق جديد على إعلانك' :
               '🔔 إشعار جديد في المنصة'}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '2px' }}>
              من: <strong>{activeToast.actorName || 'مستخدم في المنصة'}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: '#A5B4FC', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ fontSize: '0.88rem', background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}>
        {activeToast.type === 'partnership_request' ? (
          <span>يرغب <strong>{activeToast.actorName}</strong> في البدء بشراكة اقتصادية معك في منصة السوق العالمي.</span>
        ) : activeToast.type === 'partnership_accepted' ? (
          <span>تهانينا! وافق <strong>{activeToast.actorName}</strong> على طلب الشراكة الاقتصادية معك.</span>
        ) : activeToast.type === 'comment' ? (
          <span>"{activeToast.text || activeToast.listingTitle}"</span>
        ) : (
          <span>{activeToast.listingTitle || 'تفاعل جديد على إعلانك'}</span>
        )}
      </div>

      {activeToast.type === 'partnership_request' && !activeToast.actionTaken && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check size={16} />
            <span>قبول الشراكة 🤝</span>
          </button>

          <button
            type="button"
            onClick={handleReject}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            تجاهل
          </button>
        </div>
      )}
    </div>
  );
}
