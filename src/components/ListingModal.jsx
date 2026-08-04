import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ImagePlus, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Upload, 
  PhoneCall, 
  MessageCircle, 
  MapPin, 
  Compass,
  Flame,
  Clock,
  Calendar,
  Tag,
  Percent
} from 'lucide-react';
import { GOVERNORATES, CATEGORIES } from '../data/mockData';

const getNowISO = () => new Date().toISOString().slice(0, 16);
const getTomorrowISO = () => new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16);

export default function ListingModal({
  isOpen,
  onClose,
  onSubmit,
  editingListing,
  currentUser,
  onlyPhotosMode = false,
  onAddComment,
  onDeleteComment,
  onAddCommentReply,
  onDeleteCommentReply,
  defaultIsDeal = false,
  onViewUserProfile
}) {
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'IQD',
    category: 'عقارات',
    governorate: 'بغداد',
    area: '',
    nearestLandmark: '',
    shopLocationUrl: '',
    phone: currentUser?.phone || '',
    condition: 'جديد',
    images: [],
    isDeal: defaultIsDeal,
    originalPrice: '',
    dealStartDate: getNowISO(),
    dealEndDate: getTomorrowISO(),
    isScheduled: false,
    scheduledPublishDate: getNowISO()
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingListing) {
      setFormData({
        title: editingListing.title || '',
        description: editingListing.description || '',
        price: editingListing.price || '',
        currency: editingListing.currency || 'IQD',
        category: editingListing.category || 'عقارات',
        governorate: editingListing.governorate || 'بغداد',
        area: editingListing.area || '',
        nearestLandmark: editingListing.nearestLandmark || '',
        shopLocationUrl: editingListing.shopLocationUrl || '',
        phone: editingListing.phone || currentUser?.phone || '',
        condition: editingListing.condition || 'جديد',
        images: editingListing.images ? [...editingListing.images] : [],
        isDeal: Boolean(editingListing.isDeal),
        originalPrice: editingListing.originalPrice || '',
        dealStartDate: editingListing.dealStartDate ? editingListing.dealStartDate.slice(0, 16) : getNowISO(),
        dealEndDate: editingListing.dealEndDate ? editingListing.dealEndDate.slice(0, 16) : getTomorrowISO(),
        isScheduled: Boolean(editingListing.isScheduled),
        scheduledPublishDate: editingListing.scheduledPublishDate ? editingListing.scheduledPublishDate.slice(0, 16) : getNowISO()
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        currency: 'IQD',
        category: 'عقارات',
        governorate: 'بغداد',
        area: '',
        nearestLandmark: '',
        shopLocationUrl: '',
        phone: currentUser?.phone || '',
        condition: 'جديد',
        images: [
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'
        ],
        isDeal: Boolean(defaultIsDeal),
        originalPrice: '',
        dealStartDate: getNowISO(),
        dealEndDate: getTomorrowISO(),
        isScheduled: false,
        scheduledPublishDate: getNowISO()
      });
    }
    setNewImageUrl('');
    setErrorMsg('');
    setCommentText('');
  }, [editingListing, currentUser, isOpen, defaultIsDeal]);

  if (!isOpen) return null;

  // 1. إضافة صورة عبر رابط خاري (URL)
  const handleAddPhotoByUrl = (e) => {
    if (e) e.preventDefault();
    const url = newImageUrl.trim();
    if (!url) {
      setErrorMsg('يرجى وضع رابط صورة صالح');
      return;
    }
    if (formData.images.length >= 6) {
      setErrorMsg('عفواً، الحد الأقصى المسموح به هو 6 صور فقط لكل إعلان!');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url]
    }));
    setNewImageUrl('');
    setErrorMsg('');
  };

  // 2. رفع صور مباشرة من جهاز المستخدِم (Data URL / Base64)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = 6 - formData.images.length;
    if (availableSlots <= 0) {
      setErrorMsg('عفواً، لقد وصلت للحد الأقصى للصور (6 صور)!');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    let loadedImages = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedImages.push(event.target.result);
        }
        processedCount++;

        if (processedCount === filesToProcess.length) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...loadedImages].slice(0, 6)
          }));
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    });

    if (files.length > availableSlots) {
      setErrorMsg(`تم إضافة ${availableSlots} صورة فقط لتجاوز الحد الأقصى (6 صور).`);
    }

    // إعادة ضبط قيمة حقل الملفات
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 3. حذف صورة من القائمة
  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setErrorMsg('');
  };

  // 4. حفظ الإعلان
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('يرجى كتابة عنوان الإعلان');
      return;
    }
    if (!formData.area.trim()) {
      setErrorMsg('يرجى كتابة اسم المنطقة');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('يرجى كتابة رقم الهاتف للاتصال');
      return;
    }
    if (formData.images.length === 0) {
      setErrorMsg('يجب إضافة صورة واحدة على الأقل (حتى 6 صور)');
      return;
    }

    if (formData.isDeal) {
      if (!formData.originalPrice || Number(formData.originalPrice) <= Number(formData.price)) {
        setErrorMsg('في العروض المخفضة، يجب كتابة السعر الأصلي وأن يكون أكبر من السعر المخفض');
        return;
      }
      if (!formData.dealEndDate) {
        setErrorMsg('يرجى تحديد تاريخ ووقت انتهاء العرض التنازلي');
        return;
      }
    }

    const origP = Number(formData.originalPrice) || Number(formData.price);
    const currP = Number(formData.price) || 0;
    const discPct = origP > currP ? Math.round(((origP - currP) / origP) * 100) : 0;

    onSubmit({
      ...formData,
      price: currP,
      originalPrice: origP,
      discountPercent: discPct,
      isDeal: Boolean(formData.isDeal),
      dealStartDate: formData.dealStartDate ? new Date(formData.dealStartDate).toISOString() : new Date().toISOString(),
      dealEndDate: formData.dealEndDate ? new Date(formData.dealEndDate).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });
    onClose();
  };

  // 5. إرسال تعليق
  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !editingListing) return;
    onAddComment(editingListing.id, commentText.trim());
    setCommentText('');
  };

  const handleSendReply = (commentId) => {
    if (!replyText.trim() || !editingListing || !onAddCommentReply) return;
    onAddCommentReply(editingListing.id, commentId, replyText.trim());
    setReplyText('');
    setActiveReplyCommentId(null);
  };

  const isOwner = editingListing ? currentUser?.id === editingListing.userId : true;
  const isAppOwner = currentUser?.role === 'APP_OWNER' && currentUser?.email === '888ssafaa@gmail.com';
  const canEditListingFields = !editingListing || isOwner || isAppOwner;

  const canDeleteComment = (comment) => {
    if (!editingListing) return false;
    const isCommentAuthor = comment.userId === currentUser?.id;
    const isListingOwner = editingListing.userId === currentUser?.id;
    const isAppOwnerUser = currentUser?.role === 'APP_OWNER' && currentUser?.email === '888ssafaa@gmail.com';
    return isCommentAuthor || isListingOwner || isAppOwnerUser;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3>
            {onlyPhotosMode 
              ? 'إدارة وترفيع الصور (حتى 6 صور)' 
              : editingListing 
                ? `تفاصيل وتعديل إعلان: ${editingListing.title}` 
                : 'نشر إعلان جديد في السوق'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', fontWeight: '700', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}

          {/* قسم التعديل والنشر */}
          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* قسم إدارة وإضافة الصور حتى 6 صور */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '800' }}>صور الإعلان (أضف من الجهاز أو عبر رابط - حتى 6 صور)</span>
                <span style={{ color: formData.images.length >= 6 ? '#EF4444' : '#1877F2', fontWeight: '800', fontSize: '1rem' }}>
                  {formData.images.length} / 6
                </span>
              </label>

              <div className="photos-upload-box">
                {/* خيار الرفع من الجهاز + إضافة من رابط */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* زر اختيار الصور والفيديوهات من الكمبيوتر/الهاتف */}
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        multiple 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="local-file-upload-input"
                        disabled={formData.images.length >= 6}
                      />

                      <label 
                        htmlFor="local-file-upload-input" 
                        className="btn-primary" 
                        style={{ 
                          cursor: formData.images.length >= 6 ? 'not-allowed' : 'pointer', 
                          backgroundColor: formData.images.length >= 6 ? '#A7F3D0' : '#10B981',
                          opacity: formData.images.length >= 6 ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '800',
                          padding: '10px 18px'
                        }}
                      >
                        <Upload size={18} />
                        <span>🎥📷 اختيار ورفع فيديوهات وصور الإعلان</span>
                      </label>

                      <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '800' }}>
                        ✓ مدعوم رفع الفيديوهات (MP4/WebM) والصور الجذابة
                      </span>
                    </div>
                  </div>

                  {/* خيار إضافة عبر رابط صورة أو فيديو */}
                  <div className="add-photo-url-input">
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="أو ضع رابط صورة/فيديو هنا (URL)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhotoByUrl(e);
                        }
                      }}
                      disabled={formData.images.length >= 6}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={handleAddPhotoByUrl}
                      disabled={formData.images.length >= 6}
                    >
                      <Plus size={16} /> إضافة بالرابط
                    </button>
                  </div>
                </div>

                {/* عرض بطاقات الوسائط المصغرة المضافة مع زر الإزالة X */}
                {formData.images.length > 0 && (
                  <div className="photos-grid-preview" style={{ marginTop: '14px' }}>
                    {formData.images.map((url, idx) => {
                      const isVideo = typeof url === 'string' && (
                        url.startsWith('data:video') || 
                        url.endsWith('.mp4') || 
                        url.endsWith('.webm') || 
                        url.endsWith('.mov') ||
                        url.includes('video')
                      );

                      return (
                        <div key={idx} className="photo-preview-item" style={{ position: 'relative' }}>
                          {isVideo ? (
                            <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={url} alt={`وسائط ${idx + 1}`} />
                          )}
                          <button 
                            type="button" 
                            className="remove-photo-btn"
                            onClick={() => handleRemovePhoto(idx)}
                            title="إزالة هذه الصورة/الفيديو"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {!onlyPhotosMode && (
              <>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>عنوان الإعلان</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="عنوان الإعلان"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>السعر والعملة</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="السعر"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={{ flex: 1 }}
                        required
                      />
                      <select 
                        className="form-select"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="IQD">د.ع (دينار)</option>
                        <option value="USD">$ (دولار)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🏷️🔥 قسم تفعيل العرض المخفض المؤقت */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', color: '#DC2626' }}>
                    <input
                      type="checkbox"
                      checked={formData.isDeal}
                      onChange={(e) => setFormData({ ...formData, isDeal: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
                    />
                    <Flame size={20} />
                    <span>تحديد كـ "عرض مخفض مؤقت" مع عداد تنازلي 🏷️🔥</span>
                  </label>

                  {formData.isDeal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>السعر الأصلي القديم (قبل الخصم)</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="السعر الأصلي قبل الخصم"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            required={formData.isDeal}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>نسبة الخصم والتوفير التلقائية</label>
                          <div style={{
                            padding: '10px 14px', borderRadius: '10px', background: '#FEE2E2',
                            color: '#DC2626', fontWeight: '900', fontSize: '0.95rem', textAlign: 'center'
                          }}>
                            {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
                              ? `خصم ${Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% 🔥`
                              : 'اكتب السعر الأصلي أولاً'}
                          </div>
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>تاريخ ووقت بدء العرض</label>
                          <input
                            type="datetime-local"
                            className="form-input"
                            value={formData.dealStartDate}
                            onChange={(e) => setFormData({ ...formData, dealStartDate: e.target.value })}
                            required={formData.isDeal}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.85rem', color: '#DC2626' }}>تاريخ ووقت انتهاء العرض (العداد التنازلي)</label>
                          <input
                            type="datetime-local"
                            className="form-input"
                            value={formData.dealEndDate}
                            onChange={(e) => setFormData({ ...formData, dealEndDate: e.target.value })}
                            required={formData.isDeal}
                            style={{ border: '1px solid #EF4444' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>النوع / القسم ({CATEGORIES.length} قسم فئوي)</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>{c.emoji ? `${c.emoji} ${c.name}` : c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>الحالة (جديد أم مستخدم)</label>
                    <select 
                      className="form-select"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="جديد">جديد</option>
                      <option value="مستخدم">مستخدم</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>المحافظة</label>
                    <select 
                      className="form-select"
                      value={formData.governorate}
                      onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المنطقة</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="اسم المنطقة"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>أقرب نقطة دالة</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="أقرب نقطة دالة"
                      value={formData.nearestLandmark}
                      onChange={(e) => setFormData({ ...formData, nearestLandmark: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>رقم الهاتف للاتصال والواتساب</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="07701234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* حقل موقع المحل أو الشركة على الخريطة */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#E41E3F" />
                    <span>موقع المحل / الشركة على الخريطة (اختياري)</span>
                  </label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="رابط Google Maps أو أي خريطة أخرى..."
                    value={formData.shopLocationUrl}
                    onChange={(e) => setFormData({ ...formData, shopLocationUrl: e.target.value })}
                  />
                  <small style={{ color: '#6B7280', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    تستطيع لصق رابط موقعك من خريطة Google Maps أو Apple Maps لتسهيل وصول العملاء إليك مباشرة.
                  </small>
                </div>

                <div className="form-group">
                  <label>تفاصيل ووصف الإعلان</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    placeholder="وصف الإعلان..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* 📅 خيار توقيت ونشر الإعلان: فوراً أم مجدول في وقت مستقبل */}
                <div style={{
                  background: 'rgba(24, 119, 242, 0.05)',
                  border: '1px solid rgba(24, 119, 242, 0.25)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginTop: '12px',
                  marginBottom: '16px'
                }}>
                  <label style={{ display: 'block', fontWeight: '800', fontSize: '0.92rem', color: '#1877F2', marginBottom: '10px' }}>
                    📅 موعد نشر وتفعيل الإعلان
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <label style={{
                      flex: 1,
                      minWidth: '170px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: !formData.isScheduled ? '2px solid #1877F2' : '1px solid #CBD5E1',
                      background: !formData.isScheduled ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      color: !formData.isScheduled ? '#1E40AF' : '#475569'
                    }}>
                      <input
                        type="radio"
                        name="publishScheduleType"
                        checked={!formData.isScheduled}
                        onChange={() => setFormData({ ...formData, isScheduled: false })}
                      />
                      <span>⚡ نزول الإعلان فوراً</span>
                    </label>

                    <label style={{
                      flex: 1,
                      minWidth: '170px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: formData.isScheduled ? '2px solid #1877F2' : '1px solid #CBD5E1',
                      background: formData.isScheduled ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      color: formData.isScheduled ? '#1E40AF' : '#475569'
                    }}>
                      <input
                        type="radio"
                        name="publishScheduleType"
                        checked={formData.isScheduled}
                        onChange={() => setFormData({ ...formData, isScheduled: true })}
                      />
                      <span>📅 تحديد وقت وتاريخ مستقبل</span>
                    </label>
                  </div>

                  {formData.isScheduled && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        ⏰ التوقيت والتاريخ المستقبلي لنزول الإعلان تلقائياً
                      </label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={formData.scheduledPublishDate}
                        onChange={(e) => setFormData({ ...formData, scheduledPublishDate: e.target.value })}
                        required={formData.isScheduled}
                        style={{ border: '1px solid #1877F2', fontWeight: '600' }}
                      />
                      <small style={{ color: '#64748B', fontSize: '0.76rem', marginTop: '4px', display: 'block' }}>
                        سيبقى الإعلان محفوظاً وسينزل تلقائياً للمستخدمين في هذا التوقيت والتاريخ المحدد.
                      </small>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="action-btn" onClick={onClose}>
                    {canEditListingFields ? 'إلغاء' : 'إغلاق المعاينة ✖'}
                  </button>
                  {canEditListingFields && (
                    <button type="submit" className="btn-primary">
                      <CheckCircle2 size={18} />
                      <span>{editingListing ? 'حفظ التعديلات' : 'نشر الإعلان الآن'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </form>

          {/* نظام التعليقات المباشر */}
          {editingListing && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid var(--fb-divider)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <MessageSquare size={20} color="#1877F2" />
                <span>قسم التعليقات والاستفسارات المباشرة ({editingListing.comments?.length || 0})</span>
              </h4>

              {editingListing.commentsDisabled ? (
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  🔒 قام صاحب الإعلان بإيقاف وتعطيل استقبال التعليقات والاستفسارات على هذا الإعلان.
                </div>
              ) : (
                <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name} 
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="اكتب تعليقاً أو استفساراً للبائع..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary">
                    <Send size={16} />
                    <span>إرسال</span>
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                {(!editingListing.comments || editingListing.comments.length === 0) ? (
                  <div style={{ color: 'var(--fb-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    لا توجد تعليقات بعد. كن أول من يعلق على هذا الإعلان!
                  </div>
                ) : (
                  editingListing.comments.map((comment) => (
                    <div 
                      key={comment.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--fb-bg-light)', 
                        padding: '10px 14px', 
                        borderRadius: '12px' 
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div 
                          style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}
                          onClick={() => {
                            onClose();
                            if (onViewUserProfile) onViewUserProfile({ id: comment.userId, name: comment.userName, avatar: comment.userAvatar });
                          }}
                          title={`استعراض الملف الشخصي لـ ${comment.userName}`}
                        >
                          <img 
                            src={comment.userAvatar} 
                            alt={comment.userName} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px', border: '1.5px solid #1877F2' }} 
                          />
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.88rem', textDecoration: 'underline' }}>{comment.userName}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--fb-text-primary)', marginTop: '2px' }}>
                              {comment.text}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--fb-text-secondary)' }}>
                                {new Date(comment.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReplyCommentId(activeReplyCommentId === comment.id ? null : comment.id);
                                }}
                                style={{
                                  background: activeReplyCommentId === comment.id ? '#1877F2' : 'rgba(24, 119, 242, 0.1)',
                                  color: activeReplyCommentId === comment.id ? '#ffffff' : '#1877F2',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  padding: '3px 10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                ↩️ الرد على التعليق
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* حقل الرد المباشر */}
                        {activeReplyCommentId === comment.id && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingRight: '42px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`رد على ${comment.userName}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{ flex: 1, fontSize: '0.82rem', padding: '6px 10px' }}
                            />
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => handleSendReply(comment.id)}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              إرسال
                            </button>
                          </div>
                        )}

                        {/* قائمة الردود المتفرعة الحالية */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div style={{ marginRight: '42px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '2px solid #1877F2', paddingRight: '10px' }}>
                            {comment.replies.map((reply) => (
                              <div key={reply.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: 'rgba(24, 119, 242, 0.05)', padding: '6px 10px', borderRadius: '8px' }}>
                                <div>
                                  <span style={{ fontWeight: '800', fontSize: '0.8rem', color: '#1877F2' }}>{reply.userName}: </span>
                                  <span style={{ fontSize: '0.83rem' }}>{reply.text}</span>
                                </div>
                                {onDeleteCommentReply && (canDeleteComment(reply) || comment.userId === currentUser?.id) && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteCommentReply(editingListing.id, comment.id, reply.id)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {canDeleteComment(comment) && (
                        <button 
                          type="button" 
                          onClick={() => onDeleteComment(editingListing.id, comment.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="حذف التعليق"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
