import React, { useState } from 'react';
import { 
  ThumbsUp, 
  Edit3, 
  Trash2, 
  Power, 
  ImagePlus, 
  MapPin, 
  PhoneCall, 
  Compass, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  UserCheck,
  MessageCircle,
  MessageSquare,
  MessageSquareOff,
  Handshake,
  Flag,
  Ban,
  Flame,
  Clock,
  Zap
} from 'lucide-react';
import { CountdownTimer } from './DealsBanner';
import { CATEGORIES } from '../data/mockData';
import { db } from '../firebase/config';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function ListingCard({
  listing,
  currentUser,
  onLike,
  onEdit,
  onDelete,
  onToggleDisable,
  onToggleDisableComments,
  onManagePhotos,
  onRequestPartnership,
  isPartner = false,
  hasPendingPartnership = false,
  incomingPartnershipNotif = null,
  onAcceptPartnership,
  onBlockUser,
  onReportListing,
  onViewUserProfile
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // التأكد من الصلاحيات المشتركة: مالك التطبيق أو صاحب الصفحة الإعلانية
  const isOwner = currentUser?.id === listing.userId;
  const isAppOwner =
    currentUser?.role === 'APP_OWNER' &&
    currentUser?.email === '888ssafaa@gmail.com';
  const hasSharedPermission = isOwner || isAppOwner;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="#1e2a3a"/><text x="400" y="250" text-anchor="middle" fill="#4B6CB7" font-size="32" font-family="Arial">No Image</text><text x="400" y="295" text-anchor="middle" fill="#4B6CB7" font-size="18" font-family="Arial" opacity="0.6">No photo available</text></svg>')}`];

  const isLiked = listing.likedBy?.includes(currentUser?.id);
  const commentsCount = listing.comments?.length || 0;

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formattedPrice = Number(listing.price).toLocaleString('ar-IQ');

  return (
    <div id={`listing-${listing?.id}`} className={`listing-card ${listing?.status === 'disabled' ? 'disabled-card' : ''}`}>
      {/* شارة الإعلان المعطل */}
      {listing?.status === 'disabled' && (
        <div className="card-disabled-overlay">
          مُعطّل حالياً
        </div>
      )}

      {/* رأس البطاقة: صاحب الإعلان + تاريخ النشر + شارة الحالة + زر الشراكة الاقتصادية */}
      <div className="card-header-user" style={{ flexWrap: 'wrap', gap: '8px', zIndex: 5, position: 'relative' }}>
        <div 
          className="user-info-mini" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onViewUserProfile) {
              onViewUserProfile({
                id: listing.userId,
                name: listing.userName,
                avatar: listing.userAvatar,
                governorate: listing.governorate
              });
            }
          }}
          style={{ flex: 1, minWidth: '180px', cursor: 'pointer', pointerEvents: 'auto' }}
          title={`استعراض الملف الشخصي الكامل لـ ${listing.userName}`}
        >
          <img 
            src={listing.userAvatar} 
            alt={listing.userName} 
            style={{ border: '2px solid #1877F2', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onViewUserProfile) onViewUserProfile(listing.userId);
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span 
                className="user-name-title" 
                style={{ textDecoration: 'underline', color: '#1877F2', cursor: 'pointer', fontWeight: '800' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onViewUserProfile) onViewUserProfile(listing.userId);
                }}
              >
                {listing.userName}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onViewUserProfile) onViewUserProfile(listing.userId);
                }}
                style={{
                  background: '#1877F2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)'
                }}
                title={`عرض صفحة ${listing.userName}`}
              >
                الملف الشخصي 👤
              </button>
              {isPartner && (
                <span 
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="أنت وهذا المستخدم شركاء اقتصاديون"
                >
                  <Handshake size={12} />
                  <span>شريك اقتصادي</span>
                </span>
              )}
            </div>
            <div className="user-time-ago">
              {new Date(listing?.createdAt).toLocaleDateString('ar-IQ')} • {listing.category}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* زر طلب الشراكة الاقتصادية إذا كان زائر وليس شريك */}
          {!isOwner && currentUser && (
            !isPartner ? (
              incomingPartnershipNotif ? (
                <button
                  type="button"
                  onClick={() => onAcceptPartnership && onAcceptPartnership(incomingPartnershipNotif)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                  }}
                  title="اضغط للقبول الفوري لطلب الشراكة الاقتصادية المرسل إليك"
                >
                  <Handshake size={14} />
                  <span>📥 قبول الشراكة 🤝</span>
                </button>
              ) : hasPendingPartnership ? (
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', background: 'var(--fb-input-bg)', color: 'var(--fb-text-secondary)', fontWeight: '600' }}>
                  ⏳ طلب شراكة قيد الانتظار
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRequestPartnership && onRequestPartnership(listing.userId, listing.userName, listing.userEmail); }}
                  style={{
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #10B981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  title="إرسال طلب شراكة اقتصادية مع هذا المستخدم"
                >
                  <Handshake size={14} />
                  <span>طلب شراكة</span>
                </button>
              )
            ) : null
          )}

          <span className={`condition-badge ${listing.condition === 'جديد' ? 'new' : 'used'}`}>
            {listing.condition}
          </span>
        </div>
      </div>

      {/* معرض الصور والوسائط الإعلاني حتى 6 صور/فيديوهات */}
      <div className="card-media">
        {(() => {
          const currentMedia = images[currentImageIndex];
          const isVideo = typeof currentMedia === 'string' && (
            currentMedia.startsWith('data:video') || 
            currentMedia.endsWith('.mp4') || 
            currentMedia.endsWith('.webm') || 
            currentMedia.endsWith('.mov') ||
            currentMedia.includes('video')
          );

          if (isVideo) {
            return (
              <video 
                src={currentMedia} 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            );
          }
          return <img src={currentMedia} alt={listing.title} />;
        })()}

        {/* شارة الخصم للعروض المخفضة */}
        {listing.isDeal && listing.discountPercent > 0 && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: '#fff', padding: '4px 10px', borderRadius: '8px',
            fontWeight: '900', fontSize: '0.82rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Flame size={14} />
            <span>خصم {listing.discountPercent}%</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button className="carousel-nav-btn prev" onClick={handlePrevImage} title="الصورة السابقة">
              <ChevronRight size={18} />
            </button>
            <button className="carousel-nav-btn next" onClick={handleNextImage} title="الصورة التالية">
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        <div className="image-counter-tag">
          <ImagePlus size={12} />
          <span>{currentImageIndex + 1} / {images.length} صور</span>
        </div>
      </div>

      {/* محتوى الإعلان */}
      <div className="card-body">
        {/* 🏷️ شارة اسم وأيقونة قسم الإعلان */}
        {(() => {
          const catObj = CATEGORIES.find(c => c.name === listing.category) || { name: listing.category || 'عام', emoji: '🏷️', color: '#1877F2' };
          return (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '50px',
              background: 'var(--fb-input-bg)',
              border: '1px solid var(--fb-divider)',
              fontSize: '0.78rem',
              fontWeight: '800',
              color: catObj.color || 'var(--fb-text-primary)',
              marginBottom: '10px',
              width: 'fit-content'
            }}>
              <span>{catObj.emoji || '🏷️'}</span>
              <span>{listing.category || 'قسم عام'}</span>
            </div>
          );
        })()}

        <div className="card-title-price">
          <h3 className="card-item-title">{listing.title}</h3>
          <div className="card-item-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: listing.isDeal ? '#10B981' : 'inherit', fontWeight: '900' }}>
              {formattedPrice} {listing.currency}
            </span>
            {listing.isDeal && listing.originalPrice && Number(listing.originalPrice) > Number(listing.price) && (
              <span style={{ fontSize: '0.78rem', color: 'var(--fb-text-secondary)', textDecoration: 'line-through' }}>
                {Number(listing.originalPrice).toLocaleString('ar-IQ')} {listing.currency}
              </span>
            )}
          </div>
        </div>

        {/* ⏳ العداد التنازلي التفاعلي للعروض المخفضة */}
        {listing.isDeal && listing.dealEndDate && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> ينتهي خلال:
            </span>
            <CountdownTimer endDate={listing.dealEndDate} />
          </div>
        )}

        {/* تفاصيل الموقع ورقم الهاتف والنقطة الدالة */}
        <div className="card-location-info">
          <div className="info-row">
            <MapPin size={14} color="#1877F2" />
            <span><strong>المحافظة والمنطقة:</strong> {listing.governorate} - {listing.area}</span>
          </div>

          <div className="info-row">
            <Compass size={14} color="#F59E0B" />
            <span><strong>أقرب نقطة دالة:</strong> {listing.nearestLandmark || 'غير محددة'}</span>
          </div>

          <div className="info-row" style={{ marginTop: '4px' }}>
            <PhoneCall size={14} color="#10B981" />
            <span><strong>رقم الهاتف:</strong> </span>
            <a 
              href={`tel:${listing?.phone}`} 
              style={{ color: '#10B981', fontWeight: '800', textDecoration: 'none', marginLeft: '8px' }}
            >
              {listing?.phone}
            </a>
            <a 
              href={`https://wa.me/${listing?.phone.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#25D366', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}
            >
              <MessageCircle size={13} /> واتساب
            </a>
          </div>
        </div>

        <p className="card-desc">{listing.description}</p>

        {/* شارة الصلاحيات المشتركة */}
        {hasSharedPermission && (
          <div className="shared-perm-tag">
            {isAppOwner ? (
              <>
                <ShieldCheck size={14} />
                <span>صلاحيات إدارية عامة (مالك التطبيق)</span>
              </>
            ) : (
              <>
                <UserCheck size={14} />
                <span>صلاحيات صاحب الصفحة الإعلانية</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* أزرار التحكم والتفاعل المباشر مرتبة على سطرين أنيقين بدون تزاحم */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--fb-divider)' }}>
        {/* السطر الأول: التفاعل العام والتعليقات والإبلاغ والحظر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* زر الاعجابات */}
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => onLike(listing?.id)}
            title="زر الإعجاب بالإعلان"
            style={{ flex: 1, minWidth: '100px' }}
          >
            <ThumbsUp size={16} fill={isLiked ? '#1877F2' : 'none'} />
            <span>{listing.likesCount || 0} إعجاب</span>
          </button>

          {/* زر التعليقات */}
          <button 
            className="action-btn"
            onClick={() => onEdit(listing)}
            title="عرض الإعلان ورؤية التعليقات"
            style={{ flex: 1, minWidth: '110px', color: listing.commentsDisabled ? '#EF4444' : '#8B5CF6' }}
          >
            {listing.commentsDisabled ? <MessageSquareOff size={16} color="#EF4444" /> : <MessageSquare size={16} />}
            <span>{listing.commentsDisabled ? 'مغلقة 🔒' : `${commentsCount} تعليق`}</span>
          </button>

          {/* زر الإبلاغ عن الإعلان للزوار */}
          {!isOwner && currentUser && (
            <button 
              className="action-btn"
              onClick={() => onReportListing && onReportListing(listing)}
              title="الإبلاغ عن إعلان مسيء أو غير لائق"
              style={{ color: '#EF4444', flex: '0 0 auto' }}
            >
              <Flag size={15} />
              <span>إبلاغ</span>
            </button>
          )}

          {/* زر حظر المستخدم للزوار */}
          {!isOwner && currentUser && (
            <button 
              className="action-btn"
              onClick={() => onBlockUser && onBlockUser(listing.userId, listing.userName)}
              title="حظر هذا المستخدم وعدم رؤية إعلاناته مستقبلاً"
              style={{ color: '#F59E0B', flex: '0 0 auto' }}
            >
              <Ban size={15} />
              <span>حظر</span>
            </button>
          )}
        </div>

        {/* السطر الثاني: لوحة تحكم صاحب الإعلان / المالك (تعديل، تعطيل التعليقات، إدارة الصور، حذف) */}
        {hasSharedPermission && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed var(--fb-divider)' }}>
            {/* زر تعديل الإعلان */}
            <button 
              className="action-btn edit-btn"
              onClick={() => onEdit(listing)}
              title="تعديل تفاصيل الإعلان"
              style={{ flex: 1, minWidth: '90px' }}
            >
              <Edit3 size={15} />
              <span>تعديل</span>
            </button>

            {/* زر تعطيل/تفعيل التعليقات (بدلاً من تعطيل الإعلان) */}
            <button 
              className="action-btn"
              onClick={() => onToggleDisableComments && onToggleDisableComments(listing?.id)}
              title={listing?.commentsDisabled ? "إعادة تفعيل واستقبال التعليقات" : "تجميد وتعطيل التعليقات على الإعلان"}
              style={{ flex: 1.2, minWidth: '120px', color: listing?.commentsDisabled ? '#10B981' : '#F59E0B', border: '1px solid var(--fb-divider)' }}
            >
              <MessageSquareOff size={15} />
              <span>{listing?.commentsDisabled ? 'تفعيل التعليقات' : 'تعطيل التعليقات'}</span>
            </button>

            {/* زر إدارة الصور */}
            <button 
              className="action-btn"
              onClick={() => onManagePhotos(listing)}
              title="إدارة وإضافة صور الإعلان"
              style={{ flex: 1, minWidth: '90px' }}
            >
              <ImagePlus size={15} />
              <span>الصور ({listing.images?.length || 1})</span>
            </button>

            {/* زر حذف الإعلان بالكامل */}
            <button 
              className="action-btn delete-btn"
              onClick={() => onDelete(listing?.id)}
              title="حذف الإعلان بالكامل"
              style={{ flex: 1, minWidth: '80px' }}
            >
              <Trash2 size={15} />
              <span>حذف</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
