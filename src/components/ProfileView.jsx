// src/components/ProfileView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  MapPin,
  Calendar,
  GraduationCap,
  Phone,
  Clock,
  Package,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Handshake,
  Ban,
  UserX,
  UserCheck2,
  Radio,
  UserPlus,
  Users
} from 'lucide-react';
import ListingCard from './ListingCard';
import ProfileSettingsModal from './ProfileSettingsModal';
import { db } from '../firebase/config';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// ─── قراءة الصور مباشرة من localStorage بمفتاح uid ─────────
// يُنفَّذ فوراً عند أول تحميل بدون انتظار أي context أو async
const getLocalImages = (uid) => {
  if (!uid) return {};
  const result = {};
  try {
    const avatar = localStorage.getItem(`gm_avatar_${uid}`);
    const cover  = localStorage.getItem(`gm_cover_${uid}`);
    if (avatar) result.avatar = avatar;
    if (cover)  result.cover  = cover;
  } catch (_) {}
  return result;
};

export default function ProfileView({
  user,
  onUpdateUser,
  listings,
  currentUser,
  onLike,
  onEditListing,
  onDeleteListing,
  onToggleDisableComments,
  onManagePhotos,
  onOpenCreateModal,
  partners = [],
  blockedUsers = [],
  onRemovePartner,
  onUnblockUser,
  onBackToMarket,
  onRequestPartnership,
  onBlockUser,
  isPartner = false,
  hasPendingPartnership = false,
  incomingPartnershipNotif = null,
  onAcceptPartnership,
  onRejectPartnership,
  onOpenLiveStream,
  onToggleFollow,
  isFollowing = false,
  followersCount = 0,
  followingCount = 0
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('listings'); // 'listings' | 'partners' | 'blocked'

  // ─── قراءة الصور من localStorage فور تحميل المكوّن ────────
  // هذا يضمن ظهور الصورة الصحيحة حتى قبل اكتمال تحميل Firestore
  const [localImages, setLocalImages] = useState(() => getLocalImages(user?.id));

  // عند تغيّر uid (مثلاً بعد تسجيل الدخول): أعد قراءة الصور
  useEffect(() => {
    if (user?.id) {
      setLocalImages(getLocalImages(user.id));
    }
  }, [user?.id]);

  // دمج بيانات المستخدم مع الصور المحلية
  // الصور من localStorage تُطغى دائماً على أي قيمة افتراضية
  const displayUser = useMemo(() => {
    if (!user) return null;
    return { ...user, ...localImages };
  }, [user, localImages]);

  // 🤝 تصفية الشركاء وإزالة التكرارات بحسب معرف المستخدم (Deduplication)
  const uniquePartners = useMemo(() => {
    const map = new Map();
    (partners || []).forEach(p => {
      const uId = String(p.userId || p.id || '').toLowerCase().trim();
      if (uId && !map.has(uId)) {
        map.set(uId, p);
      }
    });
    return Array.from(map.values());
  }, [partners]);

  // حارس: إذا لم تُحمَّل بيانات المستخدم بعد
  if (!displayUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
        <Package size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '12px' }}>جارٍ تحميل الملف الشخصي...</p>
      </div>
    );
  }

  // تصفية الإعلانات الخاصة بهذا الملف الشخصي بمرونة عالية لدعم معرفات الحساب الموحدة
  const userListings = (listings || []).filter((l) => {
    if (!l || !displayUser) return false;
    const lUser = String(l.userId || l.user1Id || '').toLowerCase().trim();
    const lEmail = String(l.userEmail || l.email || '').toLowerCase().trim();
    const dId = String(displayUser.id || displayUser.uid || '').toLowerCase().trim();
    const dEmail = String(displayUser.email || '').toLowerCase().trim();

    return (dId && lUser === dId) || (dEmail && (lUser === dEmail || lEmail === dEmail));
  });

  // عند حفظ الإعدادات: تحديث الصور المحلية فوراً
  const handleSave = (updatedData) => {
    if (updatedData?.id) {
      setLocalImages(getLocalImages(updatedData.id));
    } else if (user?.id) {
      setLocalImages(getLocalImages(user.id));
    }
    if (onUpdateUser) onUpdateUser(updatedData);
  };

  return (
    <div>
      {/* غطاء الصفحة والملف الشخصي المماثل لفيسبوك */}
      <div className="profile-container">
        <div className="profile-cover">
          <img
            src={displayUser.cover}
            alt="غلاف الملف الشخصي"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="profile-avatar-img"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'U')}&background=EC4899&color=fff&size=200`;
              }}
            />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {onBackToMarket && (
                <button
                  className="btn-primary"
                  onClick={onBackToMarket}
                  style={{ backgroundColor: '#1877F2', color: '#fff', border: 'none', fontWeight: '800' }}
                >
                  <span>⬅️ العودة للسوق العام</span>
                </button>
              )}

              {/* 📡 زر البث المباشر المتاح دائماً في البروفايل */}
              <button
                className="btn-primary"
                onClick={() => {
                  if (onOpenLiveStream) onOpenLiveStream(displayUser);
                }}
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '900',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Radio size={18} />
                <span>📡 بث مباشر 🔴</span>
              </button>

              {currentUser?.id === displayUser?.id ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ backgroundColor: 'var(--fb-bg-light)', color: 'var(--fb-text-primary)', border: '1px solid var(--fb-divider)' }}
                  >
                    <Settings size={18} />
                    <span>إعدادات الملف الشخصي</span>
                  </button>

                  <button className="btn-primary" onClick={onOpenCreateModal}>
                    <PlusCircle size={18} />
                    <span>إضافة إعلان جديد</span>
                  </button>
                </>
              ) : (
                <>
                  {/* 👤+ زر المتابعة التفاعلي عند تصفح بروفايل مستخدم آخر */}
                  {onToggleFollow && (
                    <button
                      className="btn-primary"
                      onClick={() => onToggleFollow(displayUser?.id || displayUser?.uid, displayUser?.name)}
                      style={{
                        background: isFollowing ? 'rgba(59, 130, 246, 0.15)' : '#1877F2',
                        color: isFollowing ? '#3B82F6' : '#fff',
                        border: isFollowing ? '1px solid #3B82F6' : 'none',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isFollowing ? <UserCheck2 size={18} /> : <UserPlus size={18} />}
                      <span>{isFollowing ? 'متابَع ✓' : 'متابعة 👤➕'}</span>
                    </button>
                  )}

                  {isPartner ? (
                    <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Handshake size={18} />
                      <span>شريك اقتصادي 🤝</span>
                    </div>
                  ) : incomingPartnershipNotif ? (
                    /* 📥 إذا كان المستخدم الحالي هو المستقبل (receiverId): اعرض له أزرار إدارة الطلب (قبول / رفض) */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-primary"
                        onClick={() => onAcceptPartnership && onAcceptPartnership(incomingPartnershipNotif)}
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', fontWeight: '800' }}
                        title="اضغط للقبول الفوري لطلب الشراكة الاقتصادية المرسل إليك"
                      >
                        <Handshake size={18} />
                        <span>📥 قبول طلب الشراكة 🤝</span>
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => onRejectPartnership && onRejectPartnership(incomingPartnershipNotif)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444', fontWeight: '800', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}
                        title="اضغط لرفض طلب الشراكة الاقتصادية"
                      >
                        <span>❌ رفض الطلب</span>
                      </button>
                    </div>
                  ) : hasPendingPartnership ? (
                    /* ⏳ إذا كان المستخدم الحالي هو المرسل (senderId): اعرض له زر/شارة طلب قيد الانتظار */
                    <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--fb-input-bg)', color: 'var(--fb-text-secondary)', fontWeight: '700', border: '1px dashed var(--fb-divider)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⏳ طلب شراكة قيد الانتظار</span>
                    </div>
                  ) : (
                    onRequestPartnership && (
                      <button
                        className="btn-primary"
                        onClick={() => onRequestPartnership(displayUser.id || displayUser.uid, displayUser.name, displayUser.email)}
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none' }}
                      >
                        <Handshake size={18} />
                        <span>طلب شراكة اقتصادية 🤝</span>
                      </button>
                    )
                  )}

                  {onBlockUser && (
                    <button
                      className="btn-primary"
                      onClick={() => onBlockUser(displayUser.id, displayUser.name)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444' }}
                    >
                      <Ban size={18} />
                      <span>حظر المستخدم 🚫</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="profile-name">{displayUser.name}</h2>
              {displayUser.role === 'APP_OWNER' ? (
                <span className="role-badge-btn owner-mode" style={{ fontSize: '0.8rem', padding: '2px 10px' }}>
                  <ShieldCheck size={14} /> مالك التطبيق
                </span>
              ) : (
                <span className="role-badge-btn user-mode" style={{ fontSize: '0.8rem', padding: '2px 10px' }}>
                  <UserCheck size={14} /> صاحب الصفحة
                </span>
              )}
            </div>

            {/* 📊 أعداد المتابعين ويتابع */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--fb-text-secondary)', fontWeight: '700' }}>
              <span><strong style={{ color: 'var(--fb-text-primary)', fontSize: '1.05rem' }}>{followersCount}</strong> متابع</span>
              <span>•</span>
              <span><strong style={{ color: 'var(--fb-text-primary)', fontSize: '1.05rem' }}>{followingCount}</strong> يتابع</span>
            </div>

            <p className="profile-bio">{displayUser.bio || 'لا توجد نبذة تعريفية مضافة بعد.'}</p>
          </div>

          {/* شبكة البيانات الشخصية */}
          <div className="profile-meta-grid">
            <div className="meta-item">
              <MapPin size={18} color="#1877F2" />
              <span>الإقامة: <strong>{displayUser.governorate || '—'} - {displayUser.area || '—'}</strong></span>
            </div>

            <div className="meta-item">
              <Calendar size={18} color="#F59E0B" />
              <span>المواليد / تاريخ الميلاد: <strong>{displayUser.birthDate || 'غير محدد'}</strong></span>
            </div>

            <div className="meta-item">
              <GraduationCap size={18} color="#8B5CF6" />
              <span>الدراسة: <strong>{displayUser.education || 'غير محدد'}</strong></span>
            </div>

            <div className="meta-item">
              <Phone size={18} color="#10B981" />
              <span>الهاتف: <strong>{displayUser.phone || '—'}</strong></span>
            </div>

            <div className="meta-item">
              <Clock size={18} color="#6B7280" />
              <span>تاريخ الانضمام: <strong>{displayUser.joinedDate || '—'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط تبويبات الملف الشخصي */}
      <div style={{
        display: 'flex',
        gap: '10px',
        margin: '20px 0 16px 0',
        borderBottom: '1px solid var(--fb-divider)',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setProfileTab('listings')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: profileTab === 'listings' ? '#1877F2' : 'var(--fb-input-bg)',
            color: profileTab === 'listings' ? '#fff' : 'inherit',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={18} />
          <span>إعلاناتي ({userListings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setProfileTab('partners')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: profileTab === 'partners' ? '#10B981' : 'var(--fb-input-bg)',
            color: profileTab === 'partners' ? '#fff' : 'inherit',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Handshake size={18} />
          <span>الشركاء الاقتصاديون ({partners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setProfileTab('blocked')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            background: profileTab === 'blocked' ? '#DC2626' : 'var(--fb-input-bg)',
            color: profileTab === 'blocked' ? '#fff' : 'inherit',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Ban size={18} />
          <span>المستخدمون المحظورون ({blockedUsers.length})</span>
        </button>
      </div>

      {profileTab === 'listings' && (
        userListings.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <h3>لا توجد إعلانات منشورة في صفحتك الشخصية حتى الآن</h3>
            <p style={{ color: 'var(--fb-text-secondary)', marginTop: '6px', marginBottom: '16px' }}>
              يمكنك نشر أول إعلان لك الآن في أي من الأقسام الـ 11 المتاحة.
            </p>
            <button className="btn-primary" onClick={onOpenCreateModal} style={{ margin: '0 auto' }}>
              <PlusCircle size={18} />
              <span>نشر إعلان جديد</span>
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {userListings.map((listing) => (
              <ListingCard
                key={listing?.id}
                listing={listing}
                currentUser={currentUser}
                onLike={onLike}
                onEdit={onEditListing}
                onDelete={onDeleteListing}
                onToggleDisableComments={onToggleDisableComments}
                onManagePhotos={onManagePhotos}
              />
            ))}
          </div>
        )
      )}

      {profileTab === 'partners' && (
        uniquePartners.length === 0 ? (
          <div className="empty-state">
            <Handshake className="empty-state-icon" style={{ color: '#10B981' }} />
            <h3>ليس لديك شركاء اقتصاديون حتى الآن 🤝</h3>
            <p style={{ color: 'var(--fb-text-secondary)', marginTop: '6px' }}>
              يمكنك إرسال طلب شراكة اقتصادية إلى أي مستخدم عبر كروت الإعلانات.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {uniquePartners.map((partner) => (
              <div
                key={partner.userId}
                style={{
                  background: 'var(--fb-card-bg)',
                  border: '1px solid var(--fb-divider)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800'
                  }}>
                    🤝
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{partner.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>شريك اقتصادي مؤكد</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemovePartner && onRemovePartner(partner.userId)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--fb-divider)',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  إنهاء الشراكة
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {profileTab === 'blocked' && (
        blockedUsers.length === 0 ? (
          <div className="empty-state">
            <UserCheck2 className="empty-state-icon" style={{ color: '#10B981' }} />
            <h3>قائمة المحظورين فارغة 🎉</h3>
            <p style={{ color: 'var(--fb-text-secondary)', marginTop: '6px' }}>
              لم تقم بحظر أي مستخدم حتى الآن.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {blockedUsers.map((blocked) => (
              <div
                key={blocked.userId}
                style={{
                  background: 'var(--fb-card-bg)',
                  border: '1px solid var(--fb-divider)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#FEE2E2', color: '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800'
                  }}>
                    🚫
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{blocked.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: '600' }}>مستخدم محظور</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUnblockUser && onUnblockUser(blocked.userId)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #10B981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء الحظر
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* نافذة تعديل إعدادات الحساب */}
      <ProfileSettingsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={displayUser}
        onSave={handleSave}
      />
    </div>
  );
}
