import React, { useState, useEffect, useContext } from 'react';
import { 
  Store, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  Moon, 
  Sun,
  Bell,
  LogIn,
  Check,
  MessageSquare,
  ThumbsUp,
  X,
  Handshake,
  Smartphone,
  Flame,
  Tag,
  Download,
  CheckCircle2,
  Users,
  Radio
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  userSearchQuery,
  setUserSearchQuery,
  onToggleRole,
  onOpenCreateModal,
  onOpenLiveStream,
  darkMode,
  setDarkMode,
  notifications,
  onMarkNotificationsRead,
  onOpenAuthModal,
  onAcceptPartnership,
  onRejectPartnership,
  onOpenMyProfile,
  onSendTestNotification,
  onNotificationClick
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [searchScope, setSearchScope] = useState(userSearchQuery?.trim() ? 'users' : 'listings');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('📲 كيف تقوم بتثبيت تطبيق السوق العالمي على هاتفك:\n\n1️⃣ على أجهزة الآيفون (iOS/Safari):\nاضغط زر المشاركة (Share ⬆️) أسفل الشاشة ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕).\n\n2️⃣ على أجهزة الاندرويد (Android/Chrome):\nاضغط قائمة المتصفح (⋮) أعلى اليسار ثم اختر "تثبيت التطبيق" (Install App) أو "إضافة إلى الشاشة الرئيسية".');
    }
  };
  const isAppOwner = Boolean(
    user?.role === 'APP_OWNER' || 
    (user?.email && user.email.toLowerCase() === '888ssafaa@gmail.com')
  );
  // الإشعارات الخاصة بالمستخدم الحالي (مطابقة شمولية بدقة كافة المعرفات والبريد والاسم)
  const uId = String(user?.id || '').toLowerCase().trim();
  const uEmail = String(user?.email || '').toLowerCase().trim();
  const uName = String(user?.name || '').toLowerCase().trim();
  const prevUId = String(localStorage.getItem('gm_last_uid') || '').toLowerCase().trim();

  const myNotifications = notifications.filter(n => {
    const targetId = String(n.targetUserId || '').toLowerCase().trim();
    const targetEmail = String(n.targetUserEmail || '').toLowerCase().trim();
    const targetName = String(n.targetUserName || '').toLowerCase().trim();

    if (isAppOwner && (n.targetUserId === 'app_owner_admin' || targetEmail === '888ssafaa@gmail.com')) {
      return true;
    }

    return (
      (uId && targetId === uId) ||
      (prevUId && targetId === prevUId) ||
      (uEmail && (targetId === uEmail || targetEmail === uEmail)) ||
      (uName && uName.length > 2 && (targetId === uName || targetName === uName))
    );
  });
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // قراءة الصورة الشخصية من localStorage مباشرة (تبقى بعد Refresh)
  const localAvatar = user?.id
    ? localStorage.getItem(`gm_avatar_${user.id}`) || user?.avatar
    : user?.avatar;

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      onMarkNotificationsRead(user?.id);
    }
  };

  return (
    <header className="navbar">
      {/* جهة اليسار: الشعار والبحث الموحد */}
      <div className="nav-left">
        <button 
          className="logo-btn" 
          onClick={() => setActiveTab('market')}
          title="السوق العالمي (Global Market) - الصفحة الرئيسية"
        >
          <div className="logo-icon">ع</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>السوق العالمي (Global Market)</span>
        </button>

        {/* 🔍 مستطيل البحث الموحد المزود بقائمة اختيار نطاق البحث (إعلانات / مستخدمين) */}
        <div className="nav-search" style={{ 
          border: searchScope === 'users' ? '1.5px solid #7C3AED' : '1.5px solid #1877F2', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 8px',
          background: 'var(--fb-input-bg)'
        }}>
          {searchScope === 'users' ? (
            <Users className="nav-search-icon" size={18} color="#7C3AED" />
          ) : (
            <Search className="nav-search-icon" size={18} color="#1877F2" />
          )}

          <select
            value={searchScope}
            onChange={(e) => {
              const scope = e.target.value;
              setSearchScope(scope);
              if (scope === 'users') {
                setUserSearchQuery(searchQuery || userSearchQuery);
                setSearchQuery('');
              } else {
                setSearchQuery(userSearchQuery || searchQuery);
                setUserSearchQuery('');
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderLeft: '1px solid var(--fb-divider)',
              paddingLeft: '6px',
              fontWeight: '800',
              fontSize: '0.85rem',
              color: searchScope === 'users' ? '#7C3AED' : '#1877F2',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            title="اختر نطاق البحث: بحث عن إعلان أو بحث عن مستخدم"
          >
            <option value="listings">🛍️ إعلانات</option>
            <option value="users">👥 مستخدمين</option>
          </select>

          <input 
            type="text" 
            placeholder={searchScope === 'users' ? 'بحث عن مشترك أو صاحب حساب...' : 'بحث عن إعلان أو منتج...'} 
            value={searchScope === 'users' ? userSearchQuery : searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              if (searchScope === 'users') {
                setUserSearchQuery(val);
                setSearchQuery('');
              } else {
                setSearchQuery(val);
                setUserSearchQuery('');
              }
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              padding: '8px 4px',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: 'var(--fb-text-primary)',
              width: '190px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* الوسط: التبويبات الرئيسية */}
      <div className="nav-center">
        <button 
          className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <Store size={22} />
          <span>السوق العام</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
          style={{ color: activeTab === 'deals' ? '#EF4444' : '#EF4444', fontWeight: '800' }}
          title="عروض مخفضة مؤقتة بأسعار ممتازة وعداد تنازلي"
        >
          <Flame size={22} color="#EF4444" />
          <span>عروض مخفضة 🏷️🔥</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            if (onOpenMyProfile) onOpenMyProfile();
            else setActiveTab('profile');
          }}
          title="الانتقال المباشر إلى ملفك الشخصي الخاص"
        >
          <UserCheck size={22} />
          <span>صفحتي الشخصية</span>
        </button>

        <button 
          className="nav-tab"
          onClick={() => setActiveTab('profile')}
          title="عرض وقائمة الشركاء الاقتصاديين 🤝"
          style={{ color: '#10B981', fontWeight: '700' }}
        >
          <Handshake size={22} />
          <span>الشركاء 🤝</span>
        </button>

        {isAppOwner && (
          <button 
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ color: '#DC2626', fontWeight: '800' }}
          >
            <ShieldCheck size={22} />
            <span>لوحة مالك التطبيق</span>
          </button>
        )}
      </div>

      {/* جهة اليمين: زر النشر + الجرس + تسجيل الدخول + الثيم */}
      <div className="nav-right" style={{ position: 'relative' }}>
        {/* شارة الدور — قابلة للنقر فقط لمالك التطبيق */}
        {isAppOwner ? (
          <button
            className="role-badge-btn owner-mode"
            onClick={() => {
              if (onToggleRole) onToggleRole();
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="أنت مالك التطبيق - اضغط لفتح لوحة التحكم"
          >
            <ShieldCheck size={16} />
            <span>مالك التطبيق</span>
          </button>
        ) : (
          /* المستخدم العادي يرى شارة ثابتة بدون إمكانية التبديل */
          <span className="role-badge-btn user-mode" style={{ cursor: 'default' }}>
            <ShieldCheck size={16} />
            <span>مستخدِم</span>
          </span>
        )}

        {/* 📲 زر تثبيت وتنزيل تطبيق الأندرويد APK */}
        <button 
          className="btn-primary"
          onClick={() => setIsInstallModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            fontWeight: '800'
          }}
          title="تثبيت وتنزيل تطبيق السوق العالمي (APK) على هاتفك الأندرويد"
        >
          <Download size={18} />
          <span>تثبيت التطبيق 📲 (APK)</span>
        </button>

        {/* 📡 زر البث المباشر الفوري */}
        <button 
          className="btn-primary" 
          onClick={onOpenLiveStream}
          style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            fontWeight: '900'
          }}
          title="بدء أو مشاهدة البث المباشر الآن"
        >
          <Radio size={18} />
          <span>بث مباشر 🔴</span>
        </button>

        {/* زر إضافة إعلان جديد */}
        <button className="btn-primary" onClick={onOpenCreateModal}>
          <PlusCircle size={18} />
          <span>نشر إعلان</span>
        </button>

        {/* جرس الإشعارات المباشرة */}
        <div style={{ position: 'relative' }}>
          <button 
            className="modal-close-btn"
            onClick={handleToggleNotifications}
            title="الإشعارات المباشرة"
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* قائمة الإشعارات المنبثقة */}
          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                top: '48px',
                left: '0',
                width: '320px',
                backgroundColor: 'var(--fb-card-bg)',
                borderRadius: '12px',
                boxShadow: 'var(--fb-shadow-lg)',
                border: '1px solid var(--fb-divider)',
                zIndex: 1000,
                padding: '12px',
                maxHeight: '380px',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--fb-divider)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>الإشعارات والتفاعلات</h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fb-text-secondary)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {myNotifications.length === 0 ? (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--fb-text-secondary)', fontSize: '0.85rem' }}>
                  لا توجد إشعارات جديدة حتى الآن.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (onNotificationClick) onNotificationClick(notif);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: notif.isRead ? 'transparent' : 'var(--fb-blue-light)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <img 
                        src={notif.actorAvatar} 
                        alt={notif.actorName} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700' }}>{notif.actorName}</div>
                        <div style={{ color: 'var(--fb-text-primary)' }}>
                          {notif.type === 'partnership_request' ? (
                            <span style={{ color: '#10B981', fontWeight: '700' }}>أرسل لك طلب شراكة اقتصادية 🤝</span>
                          ) : notif.type === 'partnership_accepted' ? (
                            <span style={{ color: '#10B981', fontWeight: '700' }}>وافق على طلب الشراكة الاقتصادية معك 🤝</span>
                          ) : notif.type === 'comment' ? (
                            `علق على إعلانك: "${notif.listingTitle}"`
                          ) : (
                            `أعجب بإعلانك: "${notif.listingTitle}"`
                          )}
                        </div>
                        {notif.text && (
                          <div style={{ color: 'var(--fb-text-secondary)', fontStyle: 'italic', marginTop: '2px', fontSize: '0.8rem' }}>
                            "{notif.text}"
                          </div>
                        )}

                        {/* أزرار الموافقة أو الرفض لطلب الشراكة */}
                        {notif.type === 'partnership_request' && !notif.actionTaken && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              type="button"
                              onClick={() => onAcceptPartnership && onAcceptPartnership(notif)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#10B981',
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              قبول الشراكة
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectPartnership && onRejectPartnership(notif)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--fb-divider)',
                                background: 'transparent',
                                color: 'var(--fb-text-secondary)',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              رفض
                            </button>
                          </div>
                        )}

                        <div style={{ fontSize: '0.7rem', color: 'var(--fb-text-secondary)', marginTop: '4px' }}>
                          {new Date(notif.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* زر التبديل بين الوضع الداكن والفاتح */}
        <button 
          className="modal-close-btn"
          onClick={() => setDarkMode(!darkMode)}
          title="تبديل الثيم"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* زر تسجيل الدخول / حساب المستخدم */}
        <div 
          className="user-avatar-chip"
          onClick={() => {
            if (user?.id && onOpenMyProfile) {
              onOpenMyProfile();
            } else if (onOpenAuthModal) {
              onOpenAuthModal();
            }
          }}
          title={user?.id ? `الانتقال لملف ${user.name} الشخصي` : "تسجيل الدخول أو إنشاء حساب"}
        >
          <img src={localAvatar} alt={user?.name} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=EC4899&color=fff&size=200`; }} />
          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{user?.name}</span>
        </div>
      </div>

      {/* 📲 نافذة اختيار طريقة تثبيت وتنزيل التطبيق المباشرة */}
      {isInstallModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '20px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', borderRadius: '20px 20px 0 0' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                <Smartphone size={22} />
                <span>تثبيت وتنزيل تطبيق السوق العالمي 📲</span>
              </h3>
              <button className="modal-close-btn" onClick={() => setIsInstallModalOpen(false)} style={{ color: '#fff', background: 'rgba(255,255,255,0.2)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              {/* الخيار الأول: التثبيت السريع PWA */}
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--fb-input-bg)', border: '1px solid var(--fb-divider)' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle2 size={18} />
                  <span>1️⃣ التثبيت السريع الفوري (بدون أي ملفات ثقيلة)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--fb-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  يتثبت التطبيق مباشرة على شاشة هاتفك الرئيسية ويتحمل في الأندرويد والآيفون دُون أي تحذيرات أمنية من Google Play Protect.
                </p>
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={() => { handleInstallApp(); setIsInstallModalOpen(false); }}
                  style={{ width: '100%', justifyContent: 'center', background: '#10B981', fontWeight: '800' }}
                >
                  <Smartphone size={18} />
                  <span>تثبيت التطبيق بنقرة زر 📲</span>
                </button>
              </div>

              {/* الخيار الثاني: تنزيل ملف الـ APK المباشر */}
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--fb-input-bg)', border: '1px solid var(--fb-divider)' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1877F2', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Download size={18} />
                  <span>2️⃣ تحميل ملف الـ APK المباشر (Android APK)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--fb-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  تنزيل حزمة تثبيت الأندرويد المباشرة <code style={{ color: '#1877F2' }}>global-market-iq.apk</code> وإرسالها لأصدقائك.
                </p>
                <a
                  href="/global-market-iq.apk"
                  download="global-market-iq.apk"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#1877F2', textDecoration: 'none', textAlign: 'center', fontWeight: '800' }}
                  onClick={() => {
                    alert('📲 تم بدء تنزيل ملف global-market-iq.apk!\n\n💡 ملاحظة عند التثبيت:\nإذا ظهرت لك شاشة تحذير Google Play Protect عند التثبيت، اضغط على "مزيد من التفاصيل" (More Details) ⬅️ ثم "التثبيت على أي حال" (Install anyway).');
                    setIsInstallModalOpen(false);
                  }}
                >
                  <Download size={18} />
                  <span>تحميل ملف global-market-iq.apk الآن 💾</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
