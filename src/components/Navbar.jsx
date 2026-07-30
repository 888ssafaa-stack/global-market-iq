import React, { useState, useContext } from 'react';
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
  Flame,
  Tag,
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
  const [searchScope, setSearchScope] = useState(userSearchQuery?.trim() ? 'users' : 'listings');
  const { user } = useContext(AuthContext);

  const isAppOwner = Boolean(
    user?.role === 'APP_OWNER' || 
    (user?.email && user.email.toLowerCase() === '888ssafaa@gmail.com')
  );

  // الإشعارات الخاصة بالمستخدم الحالي
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

  // قراءة الصورة الشخصية من localStorage مباشرة
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
          title="الصفحة الرئيسية للسوق العالمي"
        >
          <div className="logo-icon">
            <Store size={22} color="#ffffff" />
          </div>
          <div className="logo-text-container">
            <span className="logo-text">السوق العالمي</span>
            <span className="logo-subtext">Global Market IQ</span>
          </div>
        </button>

        {/* 🔍 شريط البحث الذكي المزدوج (المنتجات + المستخدمون) */}
        <div className="search-bar-unified" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* محول نطاق البحث: إعلانات أو مستخدمون */}
          <div style={{ display: 'flex', background: 'var(--fb-input-bg)', borderRadius: '8px', padding: '2px', marginLeft: '6px' }}>
            <button
              type="button"
              onClick={() => { setSearchScope('listings'); setUserSearchQuery(''); }}
              style={{
                border: 'none',
                background: searchScope === 'listings' ? '#1877F2' : 'transparent',
                color: searchScope === 'listings' ? '#ffffff' : 'var(--fb-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              إعلانات
            </button>

            <button
              type="button"
              onClick={() => { setSearchScope('users'); setSearchQuery(''); }}
              style={{
                border: 'none',
                background: searchScope === 'users' ? '#10B981' : 'transparent',
                color: searchScope === 'users' ? '#ffffff' : 'var(--fb-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              مستخدمون 👥
            </button>
          </div>

          <Search className="search-icon" size={18} />

          {searchScope === 'listings' ? (
            <input 
              type="text" 
              placeholder="ابحث عن سيارات، عقارات، هواتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          ) : (
            <input 
              type="text" 
              placeholder="ابحث باسم المستخدم أو التخصص..." 
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="search-input"
              style={{ borderColor: '#10B981' }}
            />
          )}

          {((searchScope === 'listings' && searchQuery) || (searchScope === 'users' && userSearchQuery)) && (
            <button 
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setUserSearchQuery('');
              }}
            >
              <X size={14} />
            </button>
          )}
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

          {/* قائمة الإشعارات المنسدلة */}
          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                top: '48px',
                left: '0',
                width: '320px',
                maxHeight: '400px',
                backgroundColor: 'var(--fb-surface)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--fb-divider)',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--fb-divider)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>الإشعارات ({unreadCount})</h4>
                {onSendTestNotification && (
                  <button
                    type="button"
                    onClick={() => onSendTestNotification(user?.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10B981',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    + تجربة إشعار
                  </button>
                )}
              </div>

              {myNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--fb-text-secondary)', fontSize: '0.85rem' }}>
                  لا توجد إشعارات حالياً
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => onNotificationClick && onNotificationClick(notif)}
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
    </header>
  );
}
