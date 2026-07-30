import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Package, 
  CheckCircle, 
  Power, 
  Trash2, 
  Edit3, 
  Users, 
  BarChart3, 
  Search,
  SlidersHorizontal,
  ImagePlus,
  Flag,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import ListingCard from './ListingCard';

export default function AdminDashboard({
  listings = [],
  currentUser,
  onLike,
  onEditListing,
  onDeleteListing,
  onToggleDisableComments,
  onManagePhotos,
  reports = [],
  onDismissReport,
  onDisableReportedListing,
  onDeleteReportedListing,
  registeredUsersCount = 0,
  allRegisteredUsers = [],
  onAdminBanUser,
  onAdminDeleteUser,
  onViewUserProfile
}) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reports'
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'active').length;
  const disabledListings = listings.filter((l) => l.status === 'disabled').length;
  const totalLikes = listings.reduce((sum, l) => sum + (l.likesCount || 0), 0);
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  // تجميع وقراءة كافة الحسابات المسجلة الحقيقية فقط بدقة 100% بدون أي حسابات وهمية
  const uniqueUsersMap = new Map();

  (allRegisteredUsers || []).forEach(u => {
    if (u.id && !uniqueUsersMap.has(u.id)) {
      uniqueUsersMap.set(u.id, {
        id: u.id,
        name: u.name || u.userName || u.email?.split('@')[0] || 'مستخدم مسجل',
        email: u.email || '',
        phone: u.phone || '',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=7C3AED&color=fff`,
        cover: u.cover,
        governorate: u.governorate || 'العراق',
        area: u.area || '',
        bio: u.bio || '',
        joinedDate: u.joinedDate || '',
        isBanned: u.isBanned || u.status === 'banned',
        listingsCount: listings.filter(item => item.userId === u.id).length
      });
    }
  });

  listings.forEach(l => {
    if (l.userId && !uniqueUsersMap.has(l.userId)) {
      uniqueUsersMap.set(l.userId, {
        id: l.userId,
        name: l.userName || 'مستخدم في المنصة',
        email: '',
        phone: l.phone || '',
        avatar: l.userAvatar,
        governorate: l.governorate || 'العراق',
        area: l.area || '',
        isBanned: false,
        listingsCount: listings.filter(item => item.userId === l.userId).length
      });
    }
  });

  const usersList = Array.from(uniqueUsersMap.values());
  const totalUsersDisplay = usersList.length;

  // دالة تطبيس وتوحيد النصوص العربية والإنجليزية للبحث بدقة 100%
  const normalizeText = (str = '') => {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u0652]/g, '');
  };

  const normUserSearch = normalizeText(userSearchText);

  const filteredUsersList = usersList.filter(u => {
    if (!normUserSearch) return true;
    const nameNorm = normalizeText(u.name);
    const emailNorm = normalizeText(u.email);
    const phoneNorm = normalizeText(u.phone);
    const govNorm = normalizeText(u.governorate);
    const areaNorm = normalizeText(u.area);
    const idNorm = normalizeText(u.id);

    return nameNorm.includes(normUserSearch) ||
           emailNorm.includes(normUserSearch) ||
           phoneNorm.includes(normUserSearch) ||
           govNorm.includes(normUserSearch) ||
           areaNorm.includes(normUserSearch) ||
           idNorm.includes(normUserSearch);
  });

  const normAdminSearch = normalizeText(adminSearch);

  const filteredListings = listings.filter((l) => {
    if (!normAdminSearch && statusFilter === 'ALL') return true;
    const titleNorm = normalizeText(l.title);
    const userNameNorm = normalizeText(l.userName);
    const govNorm = normalizeText(l.governorate);
    const catNorm = normalizeText(l.category);

    const matchesSearch = !normAdminSearch || 
                          titleNorm.includes(normAdminSearch) ||
                          userNameNorm.includes(normAdminSearch) ||
                          govNorm.includes(normAdminSearch) ||
                          catNorm.includes(normAdminSearch);

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* رأس لوحة تحكم مالك التطبيق */}
      <div 
        style={{ 
          backgroundColor: 'var(--fb-card-bg)', 
          padding: '20px', 
          borderRadius: 'var(--fb-radius-lg)',
          border: '1px solid var(--fb-divider)',
          boxShadow: 'var(--fb-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '50%' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>لوحة مالك التطبيق (App Owner Admin)</h2>
            <p style={{ color: 'var(--fb-text-secondary)', fontSize: '0.9rem' }}>
              تمتلك صلاحيات عامة وشاملة لإدارة وتعديل وحذف وتفعيل أي إعلان ومراجعة البلاغات.
            </p>
          </div>
        </div>

        <div className="role-badge-btn owner-mode" style={{ fontSize: '0.9rem', padding: '8px 18px' }}>
          <ShieldCheck size={18} />
          <span>الصلاحيات العامة مفعّلة</span>
        </div>
      </div>

      {/* التبويبات الرئيسية داخل لوحة الإدارة */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--fb-divider)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'listings' ? '#1877F2' : 'var(--fb-input-bg)',
            color: activeTab === 'listings' ? '#fff' : 'inherit',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={18} />
          <span>إدارة الإعلانات ({totalListings})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'users' ? '#7C3AED' : 'var(--fb-input-bg)',
            color: activeTab === 'users' ? '#fff' : 'inherit',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'users' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <Users size={18} />
          <span>إدارة أصحاب الحسابات والمستخدمين ({totalUsersDisplay}) 👥</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'reports' ? '#DC2626' : 'var(--fb-input-bg)',
            color: activeTab === 'reports' ? '#fff' : 'inherit',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative'
          }}
        >
          <Flag size={18} />
          <span>بلاغات الإعلانات المسيئة ({pendingReportsCount})</span>
          {pendingReportsCount > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#fff',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '0.75rem',
              fontWeight: '800'
            }}>
              جديد
            </span>
          )}
        </button>
      </div>

      {activeTab === 'listings' ? (
        <>
          {/* بطاقات الإحصائيات الشاملة */}
          <div className="admin-stats-grid">
            <div 
              className="stat-card" 
              onClick={() => setActiveTab('users')}
              style={{ borderRight: '4px solid #8B5CF6', cursor: 'pointer', background: 'rgba(139, 92, 246, 0.08)' }}
              title="اضغط هنا لفتح قسم إدارة كافة المستخدمين المسجلين لمالك التطبيق"
            >
              <div className="stat-icon-wrapper" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-val" style={{ color: '#7C3AED', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{totalUsersDisplay}</span>
                  <span style={{ fontSize: '0.72rem', background: '#7C3AED', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>فتح ↗</span>
                </div>
                <div className="stat-lbl" style={{ fontWeight: '800' }}>إجمالي المستخدمين المسجلين (اضغط هنا 👥)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Package size={24} />
              </div>
              <div>
                <div className="stat-val">{totalListings}</div>
                <div className="stat-lbl">إجمالي الإعلانات في المنصة</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#D1FAE5', color: '#059669' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="stat-val">{activeListings}</div>
                <div className="stat-lbl">إعلانات نشطة ومتاحة</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <Power size={24} />
              </div>
              <div>
                <div className="stat-val">{disabledListings}</div>
                <div className="stat-lbl">إعلانات معطلة</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="stat-val">{totalLikes}</div>
                <div className="stat-lbl">إجمالي التفاعلات والإعجابات</div>
              </div>
            </div>
          </div>

          {/* شريط التحكم السريع في الإعلانات */}
          <div className="filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <Search size={18} color="var(--fb-text-secondary)" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="بحث أدمن في كافة الإعلانات، المحافظات، والمستخدِمين..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SlidersHorizontal size={18} color="var(--fb-text-secondary)" />
              <select 
                className="select-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">عرض الكل (نشط ومعطل)</option>
                <option value="active">النشطة فقط</option>
                <option value="disabled">المعطلة فقط</option>
              </select>
            </div>
          </div>

          {/* شبكة الإعلانات الشاملة تحت الصلاحيات العامة لمالك التطبيق */}
          {filteredListings.length === 0 ? (
            <div className="empty-state">
              <h3>لا توجد إعلانات مطابقة للبحث الإداري</h3>
            </div>
          ) : (
            <div className="listings-grid">
              {filteredListings.map((listing) => (
                <ListingCard 
                  key={listing?.id}
                  listing={listing}
                  currentUser={currentUser}
                  onLike={onLike}
                  onEdit={onEditListing}
                  onDelete={onDeleteListing}
                  onToggleDisableComments={onToggleDisableComments}
                  onManagePhotos={onManagePhotos}
                  onViewUserProfile={onViewUserProfile}
                />
              ))}
            </div>
          )}
        </>
      ) : activeTab === 'users' ? (
        /* 👥 قسم إدارة أصحاب الحسابات والمستخدمين المباشر */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--fb-card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--fb-divider)', boxShadow: 'var(--fb-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#EDE9FE', color: '#7C3AED', padding: '12px', borderRadius: '50%' }}>
                <Users size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>إدارة أصحاب الحسابات والمستخدمين المسجلين 👥</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--fb-text-secondary)', margin: '4px 0 0 0' }}>
                  عرض والتحكم بكافة الحسابات المسجلة وحظر أو حذف الحسابات وعرض الملفات الشخصية.
                </p>
              </div>
            </div>
            <div style={{ background: '#7C3AED', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem' }}>
              إجمالي الحسابات: {totalUsersDisplay}
            </div>
          </div>

          {/* شريط البحث المباشر في المستخدمين */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fb-text-secondary)' }} size={20} />
            <input
              type="text"
              className="form-input"
              placeholder="بحث باسم المستخدم، البريد الإلكتروني، الرقم، المحافظة، أو المعرف (ID)..."
              value={userSearchText}
              onChange={(e) => setUserSearchText(e.target.value)}
              style={{ width: '100%', paddingRight: '44px', fontSize: '0.95rem' }}
            />
          </div>

          {/* جدول/قائمة المستخدمين المباشرة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {filteredUsersList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fb-text-secondary)', fontWeight: '700' }}>
                لا توجد نتائج مطابقة للبحث عن المستخدمين
              </div>
            ) : (
              filteredUsersList.map((userObj) => (
                <div
                  key={userObj.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: '12px', background: userObj.isBanned ? 'rgba(239, 68, 68, 0.08)' : 'var(--fb-input-bg)',
                    border: userObj.isBanned ? '1px solid #EF4444' : '1px solid var(--fb-divider)', flexWrap: 'wrap', gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={userObj.avatar}
                      alt={userObj.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: userObj.isBanned ? '2px solid #EF4444' : '2px solid #7C3AED' }}
                    />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{userObj.name}</span>
                        {userObj.isBanned && (
                          <span style={{ fontSize: '0.72rem', background: '#EF4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            محظور 🔒
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>
                        📍 المحافظة: {userObj.governorate} {userObj.email ? `• ${userObj.email}` : ''} • {userObj.listingsCount} إعلان منشور
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onViewUserProfile) onViewUserProfile(userObj);
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: 'none',
                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                        color: '#fff', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      الملف 👤
                    </button>

                    <button
                      type="button"
                      onClick={() => onAdminBanUser && onAdminBanUser(userObj.id, userObj.name)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: 'none',
                        background: userObj.isBanned ? '#6B7280' : '#F59E0B',
                        color: '#fff', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer'
                      }}
                      title="حظر هذا المستخدم وتجميد إعلاناته من الظهور"
                    >
                      {userObj.isBanned ? 'مفكوك' : 'حظر 🚫'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onAdminDeleteUser && onAdminDeleteUser(userObj.id, userObj.name)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', border: 'none',
                        background: '#EF4444',
                        color: '#fff', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer'
                      }}
                      title="حذف الحساب وكافة إعلاناته نهائياً من قاعدة البيانات"
                    >
                      حذف 🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* تبويب بلاغات الإعلانات المسيئة */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <Flag size={20} />
            <span>قائمة البلاغات الواردة من المستخدمين</span>
          </h3>

          {reports.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <CheckCircle size={48} color="#10B981" style={{ marginBottom: '12px' }} />
              <h3>لا توجد أي بلاغات مسجلة حالياً 🎉</h3>
              <p style={{ color: 'var(--fb-text-secondary)' }}>المنصة آمنة ونظيفة ولم يتم تقديم أية بلاغات عن إعلانات مسيئة.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => {
                const targetListing = listings.find(l => l.id === report.listingId);
                return (
                  <div
                    key={report.id}
                    style={{
                      background: 'var(--fb-card-bg)',
                      border: '1px solid var(--fb-divider)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            fontWeight: '800',
                            fontSize: '0.85rem'
                          }}>
                            🚩 {report.reasonLabel}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)' }}>
                            تاريخ البلاغ: {new Date(report.createdAt).toLocaleString('ar-IQ')}
                          </span>
                        </div>
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.05rem', fontWeight: '700' }}>
                          الإعلان: {report.listingTitle}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--fb-text-secondary)' }}>
                          صاحب الإعلان: <strong>{report.listingUser}</strong> (ID: {report.listingUserId})
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {targetListing && (
                          <button
                            type="button"
                            onClick={() => onDisableReportedListing && onDisableReportedListing(report.listingId)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#F59E0B',
                              color: '#fff',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Power size={14} />
                            <span>{targetListing.status === 'disabled' ? 'مُعطّل حالياً' : 'تعطيل الإعلان'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteReportedListing && onDeleteReportedListing(report.listingId, report.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#DC2626',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>حذف الإعلان فوراً</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDismissReport && onDismissReport(report.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--fb-divider)',
                            background: 'transparent',
                            color: 'var(--fb-text-secondary)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <XCircle size={14} />
                          <span>تجاهل/تجاوز البلاغ</span>
                        </button>
                      </div>
                    </div>

                    {report.details && (
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--fb-input-bg)',
                        fontSize: '0.85rem',
                        color: 'var(--fb-text-primary)'
                      }}>
                        <strong>ملاحظات المُبلّغ:</strong> "{report.details}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 👥 نافذة قائمة المستخدمين المسجلين والتفاعل لمالك المنصة */}
      {isUsersModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--fb-card-bg)', border: '1px solid var(--fb-divider)',
            borderRadius: '20px', width: '100%', maxWidth: '750px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* الترويسة */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--fb-divider)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                  قائمة كافة المستخدمين المسجلين ({totalUsersDisplay})
                </h3>
              </div>
              <button
                onClick={() => setIsUsersModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* شريط البحث عن المستخدمين داخل النافذة */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fb-divider)' }}>
              <input
                type="text"
                className="form-input"
                placeholder="بحث باسم المستخدم، البريد الإلكتروني، الرقم، المحافظة، أو المعرف (ID)..."
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* قائمة المستخدمين */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredUsersList.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--fb-text-secondary)' }}>
                  لا توجد نتائج مطابقة للبحث
                </div>
              ) : (
                filteredUsersList.map((userObj) => (
                  <div
                    key={userObj.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: '12px', background: userObj.isBanned ? 'rgba(239, 68, 68, 0.08)' : 'var(--fb-input-bg)',
                      border: userObj.isBanned ? '1px solid #EF4444' : '1px solid var(--fb-divider)', flexWrap: 'wrap', gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={userObj.avatar}
                        alt={userObj.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: userObj.isBanned ? '2px solid #EF4444' : '2px solid #7C3AED' }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{userObj.name}</span>
                          {userObj.isBanned && (
                            <span style={{ fontSize: '0.72rem', background: '#EF4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                              محظور 🔒
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)' }}>
                          📍 المحافظة: {userObj.governorate} • {userObj.listingsCount} إعلان منشور
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUsersModalOpen(false);
                          if (onViewUserProfile) onViewUserProfile(userObj);
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                          color: '#fff', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer'
                        }}
                      >
                        الملف 👤
                      </button>

                      <button
                        type="button"
                        onClick={() => onAdminBanUser && onAdminBanUser(userObj.id, userObj.name)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: userObj.isBanned ? '#6B7280' : '#F59E0B',
                          color: '#fff', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer'
                        }}
                        title="حظر هذا المستخدم وتجميد إعلاناته من الظهور"
                      >
                        {userObj.isBanned ? 'مفكوك' : 'حظر 🚫'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onAdminDeleteUser && onAdminDeleteUser(userObj.id, userObj.name)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: '#EF4444',
                          color: '#fff', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer'
                        }}
                        title="حذف الحساب وكافة إعلاناته نهائياً من قاعدة البيانات"
                      >
                        حذف 🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
