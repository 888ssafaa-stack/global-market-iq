import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ListingCard from './components/ListingCard';
import ListingModal from './components/ListingModal';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import TosModal from './components/TosModal';
import ReportModal from './components/ReportModal';
import DealsBanner from './components/DealsBanner';
import ToastNotification from './components/ToastNotification';
import Footer from './components/Footer';
import FooterPagesModal from './components/FooterPagesModal';
import LiveStreamModal from './components/LiveStreamModal';
import { db } from './firebase/config';
import { 
  collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { 
  CATEGORIES, 
  GOVERNORATES, 
  INITIAL_USER, 
  MOCK_APP_OWNER, 
  INITIAL_LISTINGS 
} from './data/mockData';
import { SlidersHorizontal, Store, ArrowUpDown, Clock, Users, Handshake, Search, UserCheck, Flame, Tag, Zap } from 'lucide-react';

export default function App() {
  const { user: authUser, loading: authLoading, firebaseUser, login, logout, updateUser } = useContext(AuthContext);
  const user = authUser || null;
  const isLoggedIn = Boolean(firebaseUser) || Boolean(authUser?.id);

  // 1. الإعلانات (مزامنة فورية من Firestore عبر أجهزة الويب والتطبيق)
  const [listings, setListings] = useState([]);
  
  // 2. الإشعارات والتفاعلات الفورية
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('gm_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });

  // 3. الشركاء الاقتصاديون والطلبات المعلقة
  const [partnerships, setPartnerships] = useState(() => {
    try {
      const saved = localStorage.getItem('gm_partnerships');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });

  // 4. بلاغات الإعلانات المسيئة
  const [reports, setReports] = useState([]);

  // 5. قائمة المحظورين محلياً لخصوصية كل حساب
  const [blockedUsers, setBlockedUsers] = useState(() => {
    if (!user?.id) return [];
    const saved = localStorage.getItem(`gm_blocked_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // 5.5 الملف الشخصي المعروض حالياً وإحصائية المستخدمين
  const [viewedUser, setViewedUser] = useState(null);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);

  // 6. التبويبات والفلاتر والفرز الزمني
  const [activeTab, setActiveTab] = useState('market'); // 'market', 'deals', 'profile', 'admin'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | '1d' | '7d' | '30d'

  // 7. النوافذ المنبثقة
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [onlyPhotosMode, setOnlyPhotosMode] = useState(false);
  const [defaultIsDealInModal, setDefaultIsDealInModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTosModalOpen, setIsTosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingListing, setReportingListing] = useState(null);
  const [activeFooterPage, setActiveFooterPage] = useState(null);
  const [isSendingPartnership, setIsSendingPartnership] = useState(false);

  // 7.5 البث المباشر والمتابعة
  const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState(false);
  const [liveStreamerUser, setLiveStreamerUser] = useState(null);
  const [followingMap, setFollowingMap] = useState(() => {
    try {
      const saved = localStorage.getItem(`gm_following_${user?.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (_) { return {}; }
  });

  // 8. الثيم الداكن والفاتح
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('fb_market_theme') === 'dark';
  });

  // ═══════════════════════════════════════════════════════════
  // 🌐 المزامنة الفورية من Firestore كولكشن Listings
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'listings'), async (snapshot) => {
      if (snapshot.empty) {
        setListings([]);
      } else {
        const fetchedListings = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setListings(fetchedListings);
      }
    }, (err) => {
      console.warn('[Firestore] Listings sync error:', err.message);
    });

    return () => unsub();
  }, []);

  // 🔔 حفظ ومزامنة الإشعارات والشراكات في الذاكرة المحلية كدعم فوري
  useEffect(() => {
    try {
      localStorage.setItem('gm_notifications', JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('gm_partnerships', JSON.stringify(partnerships));
    } catch (_) {}
  }, [partnerships]);

  // 🔔 المزامنة الفورية للإشعارات
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (snapshot.empty) return;
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(prev => {
        const map = new Map();
        prev.forEach(n => map.set(n.id, n));
        fetched.forEach(n => map.set(n.id, n));
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      });
    }, (err) => {
      console.warn('[Notifications Sync Error]:', err);
    });

    return () => unsub();
  }, []);

  // 🤝 المزامنة الفورية للشراكات الاقتصادية
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'partnerships'), (snapshot) => {
      if (snapshot.empty) return;
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPartnerships(prev => {
        const map = new Map();
        prev.forEach(p => map.set(p.id, p));
        fetched.forEach(p => map.set(p.id, p));
        return Array.from(map.values());
      });
    }, (err) => {
      console.warn('[Partnerships Sync Error]:', err);
    });

    return () => unsub();
  }, []);

  // 🚩 المزامنة الفورية للبلاغات
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(fetched);
    }, (_) => {});

    return () => unsub();
  }, []);

  // 👥 المزامنة الفورية لقائمة المستخدمين المسجلين لمالك التطبيق
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllRegisteredUsers(fetchedUsers);
      setRegisteredUsersCount(fetchedUsers.length);
    }, (_) => {});

    return () => unsub();
  }, []);

  // 🚫 حظر المستخدم فورا وتجميد كافة إعلاناته من منصة الأدمن
  const handleAdminBanUser = async (targetUserId, targetUserName) => {
    if (!targetUserId) return;
    if (window.confirm(`هل أنت تأكد من رغبتك في حظر المستخدم "${targetUserName}" وتعطيل كافة إعلاناته من المنصة؟`)) {
      try {
        if (db) {
          await setDoc(doc(db, 'users', targetUserId), { 
            status: 'banned', 
            isBanned: true, 
            bannedAt: new Date().toISOString() 
          }, { merge: true });

          const userListings = listings.filter(l => l.userId === targetUserId);
          for (const item of userListings) {
            await setDoc(doc(db, 'listings', item.id), { status: 'disabled', commentsDisabled: true, bannedByAdmin: true }, { merge: true });
          }
        }
        setAllRegisteredUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, status: 'banned', isBanned: true } : u));
        alert(`تم حظر المستخدم "${targetUserName}" وإخفاء كافة إعلاناته بنجاح 🚫`);
      } catch (err) {
        console.error('[Admin Ban Error]:', err);
        alert('حدث خطأ أثناء تنفيذ الحظر.');
      }
    }
  };

  // 🗑️ حذف المستخدم وكافة بياناته وإعلاناته نهائياً من Firestore
  const handleAdminDeleteUser = async (targetUserId, targetUserName) => {
    if (!targetUserId) return;
    if (window.confirm(`⚠️ تحذير نهائي: هل أنت تأكد من حذف حساب المستخدم "${targetUserName}" وكافة إعلاناته من قاعدة البيانات بشكل دائم؟`)) {
      try {
        if (db) {
          await deleteDoc(doc(db, 'users', targetUserId));
          const userListings = listings.filter(l => l.userId === targetUserId);
          for (const item of userListings) {
            await deleteDoc(doc(db, 'listings', item.id));
          }
        }
        setAllRegisteredUsers(prev => prev.filter(u => u.id !== targetUserId));
        setListings(prev => prev.filter(l => l.userId !== targetUserId));
        alert(`تم حذف حساب المستخدم "${targetUserName}" وكافة منشوراته نهائياً من قاعدة البيانات 🗑️`);
      } catch (err) {
        console.error('[Admin Delete Error]:', err);
        alert('حدث خطأ أثناء تنفيذ الحذف.');
      }
    }
  };

  const handleViewUserProfile = (targetUser) => {
    if (!targetUser) return;
    
    const userId = typeof targetUser === 'string' ? targetUser : (targetUser.id || targetUser.userId);
    const matchedUserFromDb = allRegisteredUsers.find(u => u.id === userId);
    const matchedListing = listings.find(l => l.userId === userId || l.userId === targetUser?.id);

    const userName = (typeof targetUser === 'object' && (targetUser.name || targetUser.userName))
      ? (targetUser.name || targetUser.userName)
      : (matchedUserFromDb?.name || matchedListing?.userName || 'مستخدم في المنصة');

    const userAvatar = (typeof targetUser === 'object' && (targetUser.avatar || targetUser.userAvatar))
      ? (targetUser.avatar || targetUser.userAvatar)
      : (matchedUserFromDb?.avatar || matchedListing?.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1877F2&color=fff`);

    const userGov = (typeof targetUser === 'object' && targetUser.governorate)
      ? targetUser.governorate
      : (matchedUserFromDb?.governorate || matchedListing?.governorate || 'بغداد');

    const targetObj = typeof targetUser === 'object' ? targetUser : {};

    setViewedUser({
      id: userId,
      name: userName,
      avatar: userAvatar,
      cover: targetObj.cover || matchedUserFromDb?.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      governorate: userGov,
      area: targetObj.area || matchedUserFromDb?.area || '',
      bio: targetObj.bio || matchedUserFromDb?.bio || 'عضو نشط في منصة السوق العالمي (Global Market IQ).'
    });

    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMyProfile = () => {
    setViewedUser(null);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`gm_blocked_${user.id}`);
      setBlockedUsers(saved ? JSON.parse(saved) : []);
    } else {
      setBlockedUsers([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`gm_blocked_${user.id}`, JSON.stringify(blockedUsers));
    }
  }, [blockedUsers, user?.id]);

  useEffect(() => {
    if (!authLoading && authUser) {
      const tosAccepted = localStorage.getItem(`fb_tos_accepted_${authUser.id}`);
      if (!tosAccepted) {
        setIsTosModalOpen(true);
      }
    }
  }, [authUser?.id, authLoading]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('fb_market_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleAcceptTos = () => {
    if (user?.id) {
      localStorage.setItem(`fb_tos_accepted_${user.id}`, 'true');
    }
    setIsTosModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingListing(null);
    setOnlyPhotosMode(false);
    setDefaultIsDealInModal(false);
    setIsListingModalOpen(true);
  };

  const handleOpenCreateDealModal = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingListing(null);
    setOnlyPhotosMode(false);
    setDefaultIsDealInModal(true);
    setIsListingModalOpen(true);
  };

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setOnlyPhotosMode(false);
    setIsListingModalOpen(true);
  };

  const handleOpenManagePhotosModal = (listing) => {
    setEditingListing(listing);
    setOnlyPhotosMode(true);
    setIsListingModalOpen(true);
  };

  // 💾 حفظ/تحديث إعلان أو عرض مخفض في Firestore مباشرة مع التحديث الفوري ومعالجة الأخطاء الشاملة
  const handleSaveListing = async (listingData) => {
    const listingId = editingListing ? editingListing.id : `list_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const userId = user?.id || user?.uid || firebaseUser?.uid || 'user_' + Date.now();
    const userName = user?.name || user?.userName || firebaseUser?.displayName || user?.email?.split('@')[0] || 'مستخدم في المنصة';
    const userAvatar = user?.avatar || firebaseUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1877F2&color=fff`;

    const rawPayload = editingListing
      ? {
          ...editingListing,
          ...listingData,
          userId: editingListing.userId || userId,
          userName: editingListing.userName || userName,
          userAvatar: editingListing.userAvatar || userAvatar,
          updatedAt: new Date().toISOString()
        }
      : {
          id: listingId,
          ...listingData,
          userId: userId,
          userName: userName,
          userAvatar: userAvatar,
          userEmail: user?.email || '',
          status: 'active',
          likesCount: 0,
          likedBy: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

    const payload = cleanObject(rawPayload);

    // 1️⃣ التحديث المحلي المباشر للحالة (Optimistic UI Update) لضمان ظهور الإعلان فوراً في الواجهة
    setListings(prev => {
      const filtered = prev.filter(l => l.id !== listingId);
      return [payload, ...filtered];
    });

    // 2️⃣ الحفظ الحقيقي والآمن في قاعدة البيانات Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'listings', listingId), payload, { merge: true });
      }

      // 3️⃣ إعادة ضبط جميع فلاتر البحث التلقائية لظهور الإعلان في الصفحة الرئيسية مباشرة
      setSelectedCategory('ALL');
      setSearchQuery('');
      setUserSearchQuery('');
      setGovernorateFilter('ALL');
      setConditionFilter('ALL');
      setTimeFilter('ALL');

      if (payload.isDeal) {
        setActiveTab('deals');
      } else if (activeTab !== 'profile') {
        setActiveTab('market');
      }

      setIsListingModalOpen(false);
      alert(editingListing ? 'تم تحديث الإعلان بنجاح! ✏️' : 'تم نشر إعلانك بنجاح وسيطهر فوراً في منصة السوق! 🛍️');
    } catch (e) {
      console.error('[Firestore Save Listing Error]:', e);
      // إلغاء التحديث المحلي في حال فشل الحفظ في القاعدة حتى لا تظهر رسالة نجاح وهمية
      setListings(prev => prev.filter(l => l.id !== listingId));
      alert(`عذراً، حدث خطأ أثناء حفظ الإعلان في قاعدة البيانات: ${e?.message || 'خطأ غير معروف'}`);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذا الإعلان بالكامل؟')) {
      try {
        if (db) await deleteDoc(doc(db, 'listings', id));
      } catch (e) { console.warn('[Firestore] delete listing error:', e); }

      if (editingListing && editingListing.id === id) {
        setIsListingModalOpen(false);
      }
    }
  };

  const handleToggleDisableComments = async (id) => {
    const target = listings.find(l => l.id === id);
    if (!target) return;
    const nextCommentsDisabled = !target.commentsDisabled;
    try {
      if (db) await setDoc(doc(db, 'listings', id), { commentsDisabled: nextCommentsDisabled }, { merge: true });
    } catch (_) {}
  };

  // تنظيف الكائنات قبل رفعها لـ Firestore لتجنب أخطاء undefined
  const cleanObject = (obj = {}) => {
    const cleaned = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        cleaned[k] = v;
      }
    });
    return cleaned;
  };

  const handleLikeListing = async (id) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    const target = listings.find(l => l.id === id);
    if (!target) return;

    const likedBy = target.likedBy || [];
    const isLiked = likedBy.includes(user?.id);
    const updatedLikedBy = isLiked
      ? likedBy.filter((uId) => uId !== user?.id)
      : [...likedBy, user?.id];

    try {
      if (db) {
        await setDoc(doc(db, 'listings', id), cleanObject({
          likedBy: updatedLikedBy,
          likesCount: updatedLikedBy.length
        }), { merge: true });

        if (!isLiked && target.userId !== user?.id) {
          const newNotif = cleanObject({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            targetUserId: target.userId,
            targetUserName: target.userName || '',
            actorUserId: user?.id || '',
            actorName: user?.name || 'مستخدم',
            actorAvatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1877F2&color=fff`,
            type: 'like',
            listingId: target.id,
            listingTitle: target.title,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          setNotifications(prev => [newNotif, ...prev]);
          await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
        }
      }
    } catch (err) {
      console.warn('[Like Listing Error]:', err);
    }
  };

  const handleAddComment = async (listingId, text) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    const target = listings.find(l => l.id === listingId);
    if (!target) return;

    const newComment = cleanObject({
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.id || '',
      userName: user?.name || 'مستخدم',
      userAvatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1877F2&color=fff`,
      text,
      createdAt: new Date().toISOString()
    });
    const updatedComments = [...(target.comments || []), newComment];

    try {
      if (db) {
        await setDoc(doc(db, 'listings', listingId), cleanObject({ comments: updatedComments }), { merge: true });

        if (target.userId !== user?.id) {
          const newNotif = cleanObject({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            targetUserId: target.userId,
            targetUserName: target.userName || '',
            actorUserId: user?.id || '',
            actorName: user?.name || 'مستخدم',
            actorAvatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1877F2&color=fff`,
            type: 'comment',
            listingId: target.id,
            listingTitle: target.title,
            text,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          setNotifications(prev => [newNotif, ...prev]);
          await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
        }
      }
    } catch (err) {
      console.warn('[Add Comment Error]:', err);
    }
  };

  const handleDeleteComment = async (listingId, commentId) => {
    const target = listings.find(l => l.id === listingId);
    if (!target) return;
    const updatedComments = (target.comments || []).filter(c => c.id !== commentId);
    try {
      if (db) await setDoc(doc(db, 'listings', listingId), cleanObject({ comments: updatedComments }), { merge: true });
    } catch (_) {}
  };

  const handleOpenLiveStream = (targetUser) => {
    setLiveStreamerUser(targetUser || user);
    setIsLiveStreamModalOpen(true);
  };

  const handleToggleFollow = (targetUserId, targetUserName) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!targetUserId || targetUserId === user?.id) return;

    const isCurrentlyFollowing = Boolean(followingMap[targetUserId]);
    const updatedMap = {
      ...followingMap,
      [targetUserId]: !isCurrentlyFollowing
    };
    setFollowingMap(updatedMap);
    try {
      localStorage.setItem(`gm_following_${user?.id}`, JSON.stringify(updatedMap));
    } catch (_) {}

    alert(isCurrentlyFollowing ? `تم إلغاء متابعة "${targetUserName}"` : `بدأت الآن بمتابعة "${targetUserName}" 👤✨`);
  };

  const handleAddCommentReply = async (listingId, commentId, text) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    const target = listings.find(l => l.id === listingId);
    if (!target || !target.comments) return;

    const newReply = cleanObject({
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.id || '',
      userName: user?.name || 'مستخدم',
      userAvatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1877F2&color=fff`,
      text,
      createdAt: new Date().toISOString()
    });

    const updatedComments = target.comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    try {
      if (db) {
        await setDoc(doc(db, 'listings', listingId), cleanObject({ comments: updatedComments }), { merge: true });
      }
    } catch (err) {
      console.warn('[Add Comment Reply Error]:', err);
    }
  };

  const handleDeleteCommentReply = async (listingId, commentId, replyId) => {
    const target = listings.find(l => l.id === listingId);
    if (!target || !target.comments) return;

    const updatedComments = target.comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: (c.replies || []).filter(r => r.id !== replyId)
        };
      }
      return c;
    });

    try {
      if (db) {
        await setDoc(doc(db, 'listings', listingId), cleanObject({ comments: updatedComments }), { merge: true });
      }
    } catch (_) {}
  };

  const handleMarkNotificationsRead = (userId) => {
    notifications.forEach(async (n) => {
      if ((n.targetUserId === userId || n.targetUserEmail === user?.email || n.recipientId === userId) && !n.isRead && db) {
        try { await setDoc(doc(db, 'notifications', n.id), { isRead: true }, { merge: true }); } catch (_) {}
      }
    });
  };

  const handleNotificationClick = async (notif) => {
    if (!notif) return;

    if (!notif.isRead && db) {
      try {
        await setDoc(doc(db, 'notifications', notif.id), { isRead: true }, { merge: true });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (_) {}
    }

    if (notif.listingId) {
      const targetListing = listings.find(l => l.id === notif.listingId);
      if (targetListing) {
        if (targetListing.isDeal) {
          setActiveTab('deals');
        } else {
          setActiveTab('market');
        }
        setSearchQuery('');
        setSelectedCategory('ALL');

        setTimeout(() => {
          const el = document.getElementById(`listing-${notif.listingId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.boxShadow = '0 0 20px #1877F2';
            setTimeout(() => { el.style.boxShadow = ''; }, 2500);
          } else {
            handleOpenEditModal(targetListing);
          }
        }, 350);
      }
    } else if (notif.type === 'partnership_request' || notif.type === 'partnership_accepted') {
      setActiveTab('profile');
    }
  };

  const handleSaveRecordedStream = async (streamData) => {
    if (!streamData) return;

    const listingId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const userId = user?.id || user?.uid || firebaseUser?.uid || 'user_' + Date.now();
    const userName = user?.name || user?.userName || firebaseUser?.displayName || 'مستخدم في المنصة';
    const userAvatar = user?.avatar || firebaseUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=EF4444&color=fff`;

    const payload = cleanObject({
      id: listingId,
      title: streamData.title || `تسجيل بث مباشر 🔴 - ${userName}`,
      description: streamData.description || `مقطع تسجيل البث المباشر على منصة السوق العالمي.`,
      price: 0,
      currency: 'IQD',
      category: streamData.category || 'أخرى',
      governorate: user?.governorate || 'بغداد',
      area: user?.area || 'العراق',
      nearestLandmark: 'بث مباشر مسجّل',
      phone: user?.phone || '07700000000',
      condition: 'جديد',
      images: streamData.images || [
        'https://assets.mixkit.co/videos/preview/mixkit-recording-a-live-stream-video-41487-large.mp4'
      ],
      userId: userId,
      userName: userName,
      userAvatar: userAvatar,
      userEmail: user?.email || '',
      status: 'active',
      isLiveRecorded: true,
      likesCount: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setListings(prev => [payload, ...prev]);

    try {
      if (db) {
        await setDoc(doc(db, 'listings', listingId), payload, { merge: true });
      }
      alert('تم حفظ ونشر تسجيل البث المباشر في صفحتك الشخصية وسوق المنصة بنجاح! 📡🔴');
      setViewedUser(null);
      setActiveTab('profile');
    } catch (err) {
      console.error('[Save Recorded Stream Error]:', err);
      alert('حدث خطأ أثناء حفظ تسجيل البث المباشر.');
    }
  };

  const handleUpdateUser = (updatedData) => {
    updateUser(updatedData);
  };

  const OWNER_EMAIL = '888ssafaa@gmail.com';
  const isRealOwner = Boolean(
    user?.role === 'APP_OWNER' || 
    (user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase())
  );

  const handleToggleRole = () => {
    if (!isRealOwner) return;
    if (user?.role === 'APP_OWNER') {
      updateUser({ role: 'REGULAR_USER' });
    } else {
      updateUser({ role: 'APP_OWNER' });
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
  };

  // 🤝 الشراكة الاقتصادية
  const handleRequestPartnership = async (targetUserId, targetUserName = '', targetUserEmail = '') => {
    if (isSendingPartnership) return;
    setIsSendingPartnership(true);

    try {
      if (!isLoggedIn) {
        setIsAuthModalOpen(true);
        return;
      }

      const senderId = user?.id || user?.uid;
      const recipientId = targetUserId;

      if (!senderId || !recipientId) return;

      if (senderId === recipientId || (targetUserEmail && user?.email && targetUserEmail.toLowerCase() === user.email.toLowerCase())) {
        alert('لا يمكنك إرسال طلب شراكة إلى نفسك! 🤝');
        return;
      }

      const isAlreadyPartner = partnerships.some(p => 
        (p.status === 'accepted') &&
        (((p.user1Id === senderId || p.senderId === senderId) && (p.user2Id === recipientId || p.recipientId === recipientId || (targetUserEmail && p.user2Email === targetUserEmail))) ||
        ((p.user1Id === recipientId || p.senderId === recipientId) && (p.user2Id === senderId || p.recipientId === senderId)))
      );
      if (isAlreadyPartner) {
        alert(`أنت بالفعل شريك اقتصادي مع ${targetUserName || 'هذا المستخدم'}! 🤝`);
        return;
      }

      const isPending = partnerships.some(p =>
        p.status === 'pending' &&
        (p.senderId === senderId || p.user1Id === senderId) &&
        (p.recipientId === recipientId || p.user2Id === recipientId || (targetUserEmail && p.recipientEmail === targetUserEmail))
      ) || notifications.some(n => 
        n.type === 'partnership_request' &&
        (n.senderId === senderId || n.actorUserId === senderId || n.actorUserEmail === user.email) &&
        (String(n.recipientId || n.targetUserId).toLowerCase() === String(recipientId).toLowerCase() || (targetUserEmail && String(n.targetUserEmail).toLowerCase() === String(targetUserEmail).toLowerCase())) &&
        !n.actionTaken
      );
      if (isPending) {
        alert(`لقد أرسلت بالفعل طلب شراكة إلى ${targetUserName || 'هذا المستخدم'} وهو قيد الانتظار! ⏳`);
        return;
      }

      // 1️⃣ خطوة 1: حفظ مستند طلب الشراكة المعلق 'pending' في مجموعة partnerships
      const partnershipId = `part_req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const partnershipDoc = cleanObject({
        id: partnershipId,
        senderId: senderId,
        senderName: user.name || 'مستخدم في المنصة',
        senderEmail: user.email || '',
        senderAvatar: user.avatar || '',
        recipientId: recipientId,
        recipientName: targetUserName || '',
        recipientEmail: targetUserEmail || '',
        user1Id: senderId,
        user1Name: user.name || 'مستخدم',
        user1Email: user.email || '',
        user2Id: recipientId,
        user2Name: targetUserName || 'مستخدم',
        user2Email: targetUserEmail || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 2️⃣ خطوة 2: إنشاء مستند الإشعار السحابي الحقيقي (Notification Document) للمستلم (recipientId)
      const notifId = `notif_part_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newNotif = cleanObject({
        id: notifId,
        recipientId: recipientId,
        targetUserId: recipientId,
        targetUserEmail: targetUserEmail || '',
        targetUserName: targetUserName || '',
        senderId: senderId,
        actorUserId: senderId,
        actorUserEmail: user.email || '',
        actorName: user.name || 'مستخدم في المنصة',
        actorAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=10B981&color=fff`,
        type: 'partnership_request',
        title: 'طلب شراكة اقتصادية 🤝',
        listingTitle: 'طلب شراكة اقتصادية 🤝',
        message: `أرسل لك ${user.name || 'مستخدم'} طلب شراكة اقتصادية جديد`,
        text: `أرسل لك ${user.name || 'مستخدم'} طلب شراكة اقتصادية جديد`,
        eventUrl: '/profile',
        link: '/profile',
        partnershipId: partnershipId,
        isRead: false,
        createdAt: new Date().toISOString(),
        actionTaken: false
      });

      setPartnerships(prev => [...prev.filter(p => p.id !== partnershipId), partnershipDoc]);
      setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== notifId)]);

      if (db) {
        await setDoc(doc(db, 'partnerships', partnershipId), partnershipDoc);
        // إنشاء سجل الإشعار السحابي الفعلي في مجموعة notifications عبر addDoc و serverTimestamp للمستلم (recipientId)
        await addDoc(collection(db, 'notifications'), cleanObject({
          recipientId: recipientId,
          senderId: senderId,
          title: 'طلب شراكة اقتصادية 🤝',
          message: `أرسل لك ${user.name || 'مستخدم'} طلب شراكة اقتصادية جديد`,
          text: `أرسل لك ${user.name || 'مستخدم'} طلب شراكة اقتصادية جديد`,
          createdAt: serverTimestamp(),
          isRead: false,
          targetUserId: recipientId,
          targetUserEmail: targetUserEmail || '',
          targetUserName: targetUserName || '',
          actorUserId: senderId,
          actorUserEmail: user.email || '',
          actorName: user.name || 'مستخدم في المنصة',
          actorAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=10B981&color=fff`,
          type: 'partnership_request',
          listingTitle: 'طلب شراكة اقتصادية 🤝',
          eventUrl: '/profile',
          link: '/profile',
          partnershipId: partnershipId,
          actionTaken: false
        }));
        await setDoc(doc(db, 'notifications', notifId), newNotif);
      }

      alert(`تم إرسال طلب الشراكة الاقتصادية بنجاح إلى ${targetUserName || 'المستخدم'}! 🤝`);
    } catch (err) {
      console.error('[Partnership Request Error]:', err);
    } finally {
      setIsSendingPartnership(false);
    }
  };

  const handleAcceptPartnership = async (notif) => {
    if (isSendingPartnership) return;
    setIsSendingPartnership(true);

    try {
      if (!user?.id || !notif) return;

      const partnershipId = notif.partnershipId || `part_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const senderId = notif.senderId || notif.actorUserId;
      const recipientId = user.id || user.uid;

      const pDoc = cleanObject({
        id: partnershipId,
        senderId: senderId,
        senderName: notif.actorName || 'مستخدم',
        senderEmail: notif.actorUserEmail || '',
        recipientId: recipientId,
        recipientName: user.name || 'مستخدم',
        recipientEmail: user.email || '',
        user1Id: recipientId,
        user1Name: user.name || 'مستخدم',
        user1Email: user.email || '',
        user2Id: senderId,
        user2Name: notif.actorName || 'مستخدم',
        user2Email: notif.actorUserEmail || '',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setPartnerships(prev => [...prev.filter(p => p.id !== partnershipId), pDoc]);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, actionTaken: true, isRead: true } : n));

      const accNotifId = `part_acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const acceptedNotif = cleanObject({
        id: accNotifId,
        recipientId: senderId,
        targetUserId: senderId,
        targetUserEmail: notif.actorUserEmail || '',
        targetUserName: notif.actorName || '',
        senderId: recipientId,
        actorUserId: recipientId,
        actorUserEmail: user.email || '',
        actorName: user.name || 'مستخدم',
        actorAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=10B981&color=fff`,
        type: 'partnership_accepted',
        title: 'تم قبول طلب الشراكة الاقتصادية 🤝',
        listingTitle: 'تم قبول طلب الشراكة الاقتصادية 🤝',
        message: `قام ${user.name || 'المستخدم'} بقبول طلب الشراكة الاقتصادية معنا 🤝`,
        text: `قام ${user.name || 'المستخدم'} بقبول طلب الشراكة الاقتصادية معنا 🤝`,
        eventUrl: '/profile',
        link: '/profile',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      setNotifications(prev => [acceptedNotif, ...prev.filter(n => n.id !== accNotifId)]);

      if (db) {
        await setDoc(doc(db, 'partnerships', partnershipId), pDoc);
        await setDoc(doc(db, 'notifications', notif.id), { actionTaken: true, isRead: true }, { merge: true });
        await addDoc(collection(db, 'notifications'), cleanObject({
          ...acceptedNotif,
          createdAt: serverTimestamp()
        }));
        await setDoc(doc(db, 'notifications', accNotifId), acceptedNotif);
      }

      alert(`تهانينا! أصبحت الآن شريكاً اقتصادياً رسمياً مع ${notif.actorName || 'المستخدم'} 🤝`);
    } catch (err) {
      console.error('[Accept Partnership Error]:', err);
    } finally {
      setIsSendingPartnership(false);
    }
  };

  const handleRejectPartnership = async (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, actionTaken: true, isRead: true } : n));
    try {
      if (db) await setDoc(doc(db, 'notifications', notif.id), { actionTaken: true, isRead: true }, { merge: true });
    } catch (_) {}
  };

  const handleRemovePartner = async (partnerUserId) => {
    if (!user?.id || !partnerUserId) return;

    if (!window.confirm('هل أنت تأكد من رغبتك في إنهاء هذه الشراكة الاقتصادية؟ 🤝')) {
      return;
    }

    const uId = String(user.id || user.uid || '').toLowerCase().trim();
    const pId = String(partnerUserId).toLowerCase().trim();

    // 1. تصفية وحذف كافة مستندات الشراكة المطابقة بين هذين الطرفين
    const matchingPartnerships = partnerships.filter(p => {
      const u1 = String(p.user1Id || p.senderId || '').toLowerCase().trim();
      const u2 = String(p.user2Id || p.recipientId || '').toLowerCase().trim();
      return (u1 === uId && u2 === pId) || (u1 === pId && u2 === uId);
    });

    // 2. انعكاس التحديث فورياً في الواجهة المحلية للطرفين
    setPartnerships(prev => prev.filter(p => {
      const u1 = String(p.user1Id || p.senderId || '').toLowerCase().trim();
      const u2 = String(p.user2Id || p.recipientId || '').toLowerCase().trim();
      return !((u1 === uId && u2 === pId) || (u1 === pId && u2 === uId));
    }));

    // 3. حذف المستندات وإرسال إشعار الإنهاء في Firestore
    try {
      if (db) {
        for (const pDoc of matchingPartnerships) {
          if (pDoc.id) {
            await deleteDoc(doc(db, 'partnerships', pDoc.id));
          }
        }

        await addDoc(collection(db, 'notifications'), cleanObject({
          recipientId: partnerUserId,
          targetUserId: partnerUserId,
          senderId: user.id || user.uid,
          actorUserId: user.id || user.uid,
          actorName: user.name || 'مستخدم',
          actorAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=10B981&color=fff`,
          type: 'partnership_terminated',
          title: 'تم إنهاء الشراكة الاقتصادية 🤝',
          message: `قام ${user.name || 'المستخدم'} بإنهاء الشراكة الاقتصادية معنا.`,
          text: `قام ${user.name || 'المستخدم'} بإنهاء الشراكة الاقتصادية معنا.`,
          createdAt: serverTimestamp(),
          isRead: false
        }));
      }
    } catch (err) {
      console.error('[Remove Partner Error]:', err);
    }

    alert('تم إنهاء الشراكة الاقتصادية وتحديث الحالة بنجاح 🤝');
  };

  // 🔍 دوال استخراج المعرفات الموحدة لكافة الحقول المحتملة في قاعدة بيانات Firestore
  const getDocSenderId = (doc) => {
    return String(
      doc?.senderId ||
      doc?.user1Id ||
      doc?.actorUserId ||
      doc?.userId ||
      doc?.fromUserId ||
      doc?.sender ||
      ''
    ).toLowerCase().trim();
  };

  const getDocRecipientId = (doc) => {
    return String(
      doc?.recipientId ||
      doc?.receiverId ||
      doc?.targetUserId ||
      doc?.user2Id ||
      doc?.toUserId ||
      doc?.recipient ||
      doc?.receiver ||
      ''
    ).toLowerCase().trim();
  };

  const getDocSenderEmail = (doc) => {
    return String(
      doc?.senderEmail ||
      doc?.user1Email ||
      doc?.actorUserEmail ||
      doc?.userEmail ||
      ''
    ).toLowerCase().trim();
  };

  const getDocRecipientEmail = (doc) => {
    return String(
      doc?.recipientEmail ||
      doc?.receiverEmail ||
      doc?.targetUserEmail ||
      doc?.user2Email ||
      ''
    ).toLowerCase().trim();
  };

  const checkIsPartner = (otherUserId, otherUserEmail = '') => {
    if (!user || !otherUserId) return false;
    const uId = String(user.id || user.uid || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();
    const oId = String(otherUserId || '').toLowerCase().trim();
    const oEmail = String(otherUserEmail || '').toLowerCase().trim();

    return partnerships.some(p => {
      if (p.status !== 'accepted' && p.status !== undefined) return false;
      const sId = getDocSenderId(p);
      const rId = getDocRecipientId(p);
      const sEmail = getDocSenderEmail(p);
      const rEmail = getDocRecipientEmail(p);

      const isMeSender = (uId && sId === uId) || (uEmail && sEmail && sEmail === uEmail);
      const isMeRecipient = (uId && rId === uId) || (uEmail && rEmail && rEmail === uEmail);
      const isOtherSender = (oId && sId === oId) || (oEmail && sEmail && sEmail === oEmail);
      const isOtherRecipient = (oId && rId === oId) || (oEmail && rEmail && rEmail === oEmail);

      return (isMeSender && isOtherRecipient) || (isMeRecipient && isOtherSender);
    });
  };

  const checkHasPendingPartnership = (otherUserId, otherUserEmail = '') => {
    if (!user || !otherUserId) return false;
    const currentUid = String(user.id || user.uid || '').toLowerCase().trim();
    const currentEmail = String(user.email || '').toLowerCase().trim();
    const targetUid = String(otherUserId || '').toLowerCase().trim();
    const targetEmail = String(otherUserEmail || '').toLowerCase().trim();

    if (currentUid === targetUid) return false;

    // 1. فحص الشراكة المعلقة في partnerships (حيث أنا المرسل senderId والآخر هو المستلم recipientId/receiverId)
    const hasPendingDoc = partnerships.some(p => {
      if (p.status !== 'pending') return false;
      const sId = getDocSenderId(p);
      const rId = getDocRecipientId(p);
      const sEmail = getDocSenderEmail(p);
      const rEmail = getDocRecipientEmail(p);

      const isSenderMe = (currentUid && sId === currentUid) || (currentEmail && sEmail && sEmail === currentEmail);
      const isRecipientOther = (targetUid && rId === targetUid) || (targetEmail && rEmail && rEmail === targetEmail);

      return isSenderMe && isRecipientOther;
    });

    if (hasPendingDoc) return true;

    // 2. فحص الإشعارات (حيث أنا المرسل actorUserId/senderId والآخر هو المستلم targetUserId/recipientId)
    return notifications.some(n => {
      if (n.type !== 'partnership_request' || n.actionTaken) return false;
      const sId = getDocSenderId(n);
      const rId = getDocRecipientId(n);
      const sEmail = getDocSenderEmail(n);
      const rEmail = getDocRecipientEmail(n);

      const isActorMe = (currentUid && sId === currentUid) || (currentEmail && sEmail && sEmail === currentEmail);
      const isTargetOther = (targetUid && rId === targetUid) || (targetEmail && rEmail && rEmail === targetEmail);

      return isActorMe && isTargetOther;
    });
  };

  const getIncomingPartnershipNotif = (otherUserId, otherUserEmail = '') => {
    if (!user || !otherUserId) return null;
    const currentUid = String(user.id || user.uid || '').toLowerCase().trim();
    const currentEmail = String(user.email || '').toLowerCase().trim();
    const targetUid = String(otherUserId || '').toLowerCase().trim();
    const targetEmail = String(otherUserEmail || '').toLowerCase().trim();

    if (currentUid === targetUid) return null;

    // 1. البحث في الإشعارات (حيث أنا المستقبل recipientId والآخر هو المرسل senderId)
    const foundNotif = notifications.find(n => {
      if (n.type !== 'partnership_request' || n.actionTaken) return false;
      const sId = getDocSenderId(n);
      const rId = getDocRecipientId(n);
      const sEmail = getDocSenderEmail(n);
      const rEmail = getDocRecipientEmail(n);

      const isTargetMe = (currentUid && rId === currentUid) || (currentEmail && rEmail && rEmail === currentEmail);
      const isActorOther = (targetUid && sId === targetUid) || (targetEmail && sEmail && sEmail === targetEmail);

      return isTargetMe && isActorOther;
    });

    if (foundNotif) return foundNotif;

    // 2. فحص مستند الشراكات (حيث أنا المستقبل recipientId والآخر هو المرسل senderId)
    const pendingDoc = partnerships.find(p => {
      if (p.status !== 'pending') return false;
      const sId = getDocSenderId(p);
      const rId = getDocRecipientId(p);
      const sEmail = getDocSenderEmail(p);
      const rEmail = getDocRecipientEmail(p);

      const isRecipientMe = (currentUid && rId === currentUid) || (currentEmail && rEmail && rEmail === currentEmail);
      const isSenderOther = (targetUid && sId === targetUid) || (targetEmail && sEmail && sEmail === targetEmail);

      return isRecipientMe && isSenderOther;
    });

    if (pendingDoc) {
      return {
        id: `notif_${pendingDoc.id}`,
        partnershipId: pendingDoc.id,
        recipientId: user.id || user.uid,
        receiverId: user.id || user.uid,
        targetUserId: user.id || user.uid,
        senderId: pendingDoc.senderId || pendingDoc.user1Id || pendingDoc.userId,
        actorUserId: pendingDoc.senderId || pendingDoc.user1Id || pendingDoc.userId,
        actorName: pendingDoc.senderName || pendingDoc.user1Name || 'مستخدم',
        actorUserEmail: pendingDoc.senderEmail || pendingDoc.user1Email || '',
        type: 'partnership_request',
        actionTaken: false
      };
    }

    return null;
  };

  // 🚫 الحظر
  const handleBlockUser = (targetUserId, targetUserName) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (targetUserId === user.id) return;

    if (window.confirm(`هل أنت متاكد من رغبتك في حظر ${targetUserName}؟ لن تظهر إعلاناته لك بعد الآن.`)) {
      setBlockedUsers(prev => [
        ...prev.filter(b => b.userId !== targetUserId),
        { userId: targetUserId, userName: targetUserName, blockedAt: new Date().toISOString() }
      ]);
      alert(`تم حظر ${targetUserName} بنجاح.`);
    }
  };

  const handleUnblockUser = (targetUserId) => {
    setBlockedUsers(prev => prev.filter(b => b.userId !== targetUserId));
    alert('تم إلغاء الحظر بنجاح.');
  };

  // 🚩 البلاغات
  const handleOpenReportModal = (listing) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setReportingListing(listing);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (reportData) => {
    try {
      if (db) await setDoc(doc(db, 'reports', reportData.id), reportData);
    } catch (_) {}
  };

  const handleDismissReport = async (reportId) => {
    try {
      if (db) await deleteDoc(doc(db, 'reports', reportId));
    } catch (_) {}
  };

  const handleDisableReportedListing = (listingId) => {
    handleToggleDisableListing(listingId);
  };

  const handleDeleteReportedListing = (listingId, reportId) => {
    handleDeleteListing(listingId);
    handleDismissReport(reportId);
  };

  // 🏷️🔥 تصفية واستخراج العروض المخفضة النشطة والعداد التنازلي التلقائي (Auto Expiration Logic)
  const nowMs = Date.now();
  const activeDealsList = listings.filter((l) => {
    if (!l.isDeal) return false;
    if (l.status === 'disabled') return false;
    if (!l.dealEndDate) return true;
    // الانتهاء التلقائي: استبعاد العرض فور انتهاء تاريخه
    return new Date(l.dealEndDate).getTime() > nowMs;
  });

  const blockedIdsSet = new Set(blockedUsers.map(b => b.userId));

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

  // المستطيل الثاني: تجميع وقراءة قائمة أصحاب الحسابات والمستخدمين المطابقين للبحث
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

  const allUsersList = Array.from(uniqueUsersMap.values());
  const normUserSearch = normalizeText(userSearchQuery);

  const matchingUsers = userSearchQuery.trim() ? allUsersList.filter(u => {
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
  }) : [];

  // المستطيل الأول: فلترة الإعلانات حسب الكلمات المفتاحية والأقسام والمحافظة
  const normListingSearch = normalizeText(searchQuery);

  const filteredListings = listings
    .filter((item) => {
      if (user?.id && blockedIdsSet.has(item.userId)) {
        return false;
      }

      if (item.status === 'disabled') {
        const isOwner = user?.id === item.userId;
        if (!isOwner && !isRealOwner) return false;
      }

      // إذا كنا في تبويب العروض المخفضة
      if (activeTab === 'deals') {
        if (!item.isDeal) return false;
        if (item.dealEndDate && new Date(item.dealEndDate).getTime() <= nowMs) return false;
      }

      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      if (governorateFilter !== 'ALL' && item.governorate !== governorateFilter) {
        return false;
      }

      if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) {
        return false;
      }

      if (timeFilter !== 'ALL') {
        const createdMs = new Date(item.createdAt).getTime();
        const diffHours = (nowMs - createdMs) / (1000 * 3600);

        if (timeFilter === '1d' && diffHours > 24) return false;
        if (timeFilter === '7d' && diffHours > 24 * 7) return false;
        if (timeFilter === '30d' && diffHours > 24 * 30) return false;
      }

      if (normListingSearch) {
        const titleNorm = normalizeText(item.title);
        const descNorm = normalizeText(item.description);
        const areaNorm = normalizeText(item.area);
        const govNorm = normalizeText(item.governorate);
        const userNorm = normalizeText(item.userName);
        const catNorm = normalizeText(item.category);

        if (!titleNorm.includes(normListingSearch) &&
            !descNorm.includes(normListingSearch) &&
            !areaNorm.includes(normListingSearch) &&
            !govNorm.includes(normListingSearch) &&
            !userNorm.includes(normListingSearch) &&
            !catNorm.includes(normListingSearch)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // 🤝 تجميع وتصفية قائمة الشركاء الاقتصاديين مع تفعيل منع التكرار (Deduplication) 100%
  const currentPartnerUid = String(user?.id || user?.uid || '').toLowerCase().trim();
  const currentPartnerEmail = String(user?.email || '').toLowerCase().trim();

  const userPartnersMap = new Map();

  (partnerships || []).forEach(p => {
    // تجميع الحسابات المقبولة فقط 'accepted' أو المعتمدة افتراضياً
    if (p.status && p.status !== 'accepted') return;

    const sId = getDocSenderId(p);
    const rId = getDocRecipientId(p);
    const sEmail = getDocSenderEmail(p);
    const rEmail = getDocRecipientEmail(p);

    const isSenderMe = (currentPartnerUid && sId === currentPartnerUid) || (currentPartnerEmail && sEmail && sEmail === currentPartnerEmail);
    const isRecipientMe = (currentPartnerUid && rId === currentPartnerUid) || (currentPartnerEmail && rEmail && rEmail === currentPartnerEmail);

    if (!isSenderMe && !isRecipientMe) return;

    // استخراج معلومات الشريك الأخر
    const partnerId = isSenderMe ? (p.recipientId || p.receiverId || p.user2Id || p.targetUserId) : (p.senderId || p.user1Id || p.actorUserId || p.userId);
    const partnerName = isSenderMe ? (p.recipientName || p.user2Name || p.targetUserName) : (p.senderName || p.user1Name || p.actorName);
    const partnerEmail = isSenderMe ? (p.recipientEmail || p.user2Email || p.targetUserEmail) : (p.senderEmail || p.user1Email || p.actorUserEmail);

    const partnerIdNorm = String(partnerId || partnerEmail || '').toLowerCase().trim();

    if (partnerIdNorm && partnerIdNorm !== currentPartnerUid && !userPartnersMap.has(partnerIdNorm)) {
      const regUser = uniqueUsersMap.get(partnerId) || (allRegisteredUsers || []).find(u => String(u.id).toLowerCase() === partnerIdNorm || String(u.email).toLowerCase() === partnerIdNorm);

      userPartnersMap.set(partnerIdNorm, {
        userId: partnerId || regUser?.id || partnerIdNorm,
        userName: partnerName || regUser?.name || partnerEmail?.split('@')[0] || 'شريك اقتصادي',
        userEmail: partnerEmail || regUser?.email || '',
        userAvatar: regUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName || 'P')}&background=10B981&color=fff`,
        partnershipId: p.id
      });
    }
  });

  const userPartners = Array.from(userPartnersMap.values());

  if (authLoading && !authUser) {
    return (
      <div dir="rtl" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--fb-bg-dark, #18191a)', color: '#fff', gap: '16px'
      }}>
        <div style={{ fontSize: '2.5rem' }}>🌐</div>
        <div style={{ fontSize: '1.1rem', fontWeight: '700', opacity: 0.8 }}>جارٍ تحميل Global Market IQ...</div>
        <div style={{
          width: '40px', height: '40px', border: '4px solid #1877F2',
          borderTop: '4px solid transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 🔔 الإشعارات والتنبيهات المنبثقة الفورية */}
      <ToastNotification 
        notifications={notifications}
        currentUser={user}
        onAcceptPartnership={handleAcceptPartnership}
        onRejectPartnership={handleRejectPartnership}
        onMarkRead={(notifId) => {
          setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
          if (db) setDoc(doc(db, 'notifications', notifId), { isRead: true }, { merge: true }).catch(() => {});
        }}
      />

      {/* شريط التنقل العلوي */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userSearchQuery={userSearchQuery}
        setUserSearchQuery={setUserSearchQuery}
        onToggleRole={handleToggleRole}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenLiveStream={handleOpenLiveStream}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onAcceptPartnership={handleAcceptPartnership}
        onRejectPartnership={handleRejectPartnership}
        onOpenMyProfile={handleOpenMyProfile}
        onNotificationClick={handleNotificationClick}
      />

      <main className="main-content">
        {/* 🏷️🔥 شريط قسم العروض المخفضة البارز في صدر الصفحة الرئيسية */}
        {activeTab === 'market' && activeDealsList.length > 0 && (
          <DealsBanner 
            deals={activeDealsList}
            onSelectListing={(deal) => handleOpenEditModal(deal)}
            onAddDeal={handleOpenCreateDealModal}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {/* شريط الأقسام الـ 11 والفلترة بالسوق العام وتبويب العروض */}
        {(activeTab === 'market' || activeTab === 'deals') && (
          <>
            <CategoryBar 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {activeTab === 'deals' && (
              <div style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff', padding: '18px 24px', borderRadius: '20px',
                marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '16px',
                boxShadow: '0 8px 30px rgba(239, 68, 68, 0.35)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Flame size={28} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900' }}>قسم العروض المخفضة الحصرية 🏷️🔥</h2>
                    <div style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: '2px' }}>صفقات سريعة بأسعار ممتازة وحاسبة عداد تنازلي حقيقية</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={handleOpenCreateDealModal}
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#fff', border: 'none', padding: '10px 20px',
                      borderRadius: '12px', fontWeight: '900', fontSize: '0.95rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Zap size={18} />
                    <span>🔥 أضف عرضاً مخفضاً جديداً</span>
                  </button>

                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem' }}>
                    {filteredListings.length} عرض نشط
                  </div>
                </div>
              </div>
            )}

            <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div className="filter-group" style={{ flexWrap: 'wrap' }}>
                <SlidersHorizontal size={18} color="var(--fb-text-secondary)" />
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>تصفية حسب:</span>

                <select 
                  className="select-control"
                  value={governorateFilter}
                  onChange={(e) => setGovernorateFilter(e.target.value)}
                >
                  <option value="ALL">كل المحافظات</option>
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>

                <select 
                  className="select-control"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                >
                  <option value="ALL">جديد ومستخدم</option>
                  <option value="جديد">جديد فقط</option>
                  <option value="مستخدم">مستخدم فقط</option>
                </select>

                <select
                  className="select-control"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{ border: '1px solid #8B5CF6' }}
                >
                  <option value="ALL">كل الأوقات</option>
                  <option value="1d">قبل يوم (آخر 24 ساعة)</option>
                  <option value="7d">قبل أسبوع (آخر 7 أيام)</option>
                  <option value="30d">قبل شهر (آخر 30 يوماً)</option>
                </select>

                <select
                  className="select-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ border: '1px solid #1877F2', fontWeight: '700' }}
                >
                  <option value="newest">الأحدث أولاً ⬇️</option>
                  <option value="oldest">الأقدم أولاً ⬆️</option>
                </select>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--fb-text-secondary)', fontWeight: '700' }}>
                عدد العناصر المعروضة: {filteredListings.length}
              </div>
            </div>

            {/* قسم نتائج البحث عن المستخدمين والمشتركين المطابقين للمستطيل الثاني */}
            {userSearchQuery.trim() && (
              <div style={{
                background: 'var(--fb-card-bg)',
                border: '2px solid #7C3AED',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: 'var(--fb-shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#7C3AED' }}>
                    <Users size={22} />
                    <span>المستخدمون والمشتركون المطابقون للبحث ({matchingUsers.length}) 👥</span>
                  </h3>
                  <button
                    onClick={() => setUserSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--fb-text-secondary)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    إغلاق نتائج بحث المشتركين ✖
                  </button>
                </div>

                {matchingUsers.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--fb-text-secondary)', fontWeight: '700' }}>
                    لا توجد نتائج مطابقة للبحث عن المستخدمين والمشتركين بحسب العبارة "{userSearchQuery}"
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {matchingUsers.map(u => (
                      <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px', borderRadius: '12px', background: 'var(--fb-input-bg)',
                        border: '1px solid var(--fb-divider)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                      }}>
                        <img src={u.avatar} alt={u.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: u.isBanned ? '2px solid #EF4444' : '2px solid #7C3AED' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{u.name}</span>
                            {u.isBanned && <span style={{ fontSize: '0.68rem', background: '#EF4444', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>محظور</span>}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)', marginTop: '2px' }}>📍 {u.governorate} • {u.listingsCount} إعلان</div>
                        </div>
                        <button
                          onClick={() => handleViewUserProfile(u)}
                          style={{
                            padding: '7px 12px', borderRadius: '8px', border: 'none',
                            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer'
                          }}
                        >
                          الملف 👤
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredListings.length === 0 ? (
              <div className="empty-state">
                <Store className="empty-state-icon" />
                <h3>
                  {activeTab === 'deals'
                    ? 'لا توجد عروض مخفضة نشطة حالياً. كن أول من ينشر عرضاً مخفضاً!'
                    : 'لا توجد إعلانات مطابقة للبحث أو الفلتر المحدد'}
                </h3>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setGovernorateFilter('ALL');
                    setConditionFilter('ALL');
                    setTimeFilter('ALL');
                    setSortBy('newest');
                    setSearchQuery('');
                  }}
                  style={{ margin: '16px auto 0 auto' }}
                >
                  إعادة ضبط البحث والفلاتر
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {filteredListings.map((listing) => (
                  <ListingCard 
                    key={listing?.id}
                    listing={listing}
                    currentUser={user}
                    onLike={handleLikeListing}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteListing}
                    onToggleDisableComments={handleToggleDisableComments}
                    onManagePhotos={handleOpenManagePhotosModal}
                    onRequestPartnership={handleRequestPartnership}
                    isPartner={checkIsPartner(listing.userId, listing.userEmail)}
                    hasPendingPartnership={checkHasPendingPartnership(listing.userId, listing.userEmail)}
                    incomingPartnershipNotif={getIncomingPartnershipNotif(listing.userId, listing.userEmail)}
                    onAcceptPartnership={handleAcceptPartnership}
                    onBlockUser={handleBlockUser}
                    onReportListing={handleOpenReportModal}
                    onViewUserProfile={handleViewUserProfile}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* الصفحة الشخصية العامة والشخصية — محمية بـ Firebase Auth */}
        {activeTab === 'profile' && (
          (viewedUser || (isLoggedIn && user)) ? (
            <ProfileView
              user={viewedUser || user}
              onUpdateUser={handleUpdateUser}
              listings={listings}
              currentUser={user}
              onLike={handleLikeListing}
              onEditListing={handleOpenEditModal}
              onDeleteListing={handleDeleteListing}
              onToggleDisableComments={handleToggleDisableComments}
              onManagePhotos={handleOpenManagePhotosModal}
              onOpenCreateModal={handleOpenCreateModal}
              partners={userPartners}
              blockedUsers={blockedUsers}
              onRemovePartner={handleRemovePartner}
              onUnblockUser={handleUnblockUser}
              onRequestPartnership={handleRequestPartnership}
              isPartner={checkIsPartner((viewedUser || user)?.id, (viewedUser || user)?.email)}
              hasPendingPartnership={checkHasPendingPartnership((viewedUser || user)?.id, (viewedUser || user)?.email)}
              incomingPartnershipNotif={getIncomingPartnershipNotif((viewedUser || user)?.id, (viewedUser || user)?.email)}
              onAcceptPartnership={handleAcceptPartnership}
              onRejectPartnership={handleRejectPartnership}
              onBlockUser={handleBlockUser}
              onBackToMarket={() => { setViewedUser(null); setActiveTab('market'); }}
              onOpenLiveStream={handleOpenLiveStream}
              onToggleFollow={handleToggleFollow}
              isFollowing={Boolean(followingMap[(viewedUser || user)?.id || (viewedUser || user)?.uid])}
              followersCount={Object.keys(followingMap).length + 3}
              followingCount={Object.values(followingMap).filter(Boolean).length}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: '60vh', gap: '20px',
              textAlign: 'center', padding: '40px 20px'
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1877F2, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', marginBottom: '8px'
              }}>🔒</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                هذه الصفحة خاصة بك
              </h2>
              <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
                يجب تسجيل الدخول بحسابك أولاً للوصول إلى ملفك الشخصي وإعلاناتك.
              </p>
              <button
                className="btn-primary"
                onClick={() => setIsAuthModalOpen(true)}
                style={{ fontSize: '1rem', padding: '12px 32px', borderRadius: '12px' }}
              >
                🔑 تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          )
        )}

        {/* لوحة تحكم مالك التطبيق — محمية لمالك التطبيق فقط */}
        {activeTab === 'admin' && (
          (user && isRealOwner) ? (
            <AdminDashboard 
              listings={listings}
              currentUser={user}
              onLike={handleLikeListing}
              onEditListing={handleOpenEditModal}
              onDeleteListing={handleDeleteListing}
              onToggleDisableComments={handleToggleDisableComments}
              onManagePhotos={handleOpenManagePhotosModal}
              reports={reports}
              onDismissReport={handleDismissReport}
              onDisableReportedListing={handleDisableReportedListing}
              onDeleteReportedListing={handleDeleteReportedListing}
              registeredUsersCount={registeredUsersCount}
              allRegisteredUsers={allRegisteredUsers}
              onAdminBanUser={handleAdminBanUser}
              onAdminDeleteUser={handleAdminDeleteUser}
              onViewUserProfile={handleViewUserProfile}
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: '60vh', gap: '16px',
              textAlign: 'center', padding: '40px 20px'
            }}>
              <div style={{ fontSize: '3rem' }}>⛔</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#DC2626' }}>
                وصول غير مصرح به
              </h2>
              <p style={{ color: 'var(--fb-text-secondary)', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
                هذه اللوحة محمية وخاصة بمالك التطبيق فقط.
              </p>
              <button
                className="btn-primary"
                onClick={() => setActiveTab('market')}
                style={{ fontSize: '1rem', padding: '10px 24px', borderRadius: '12px' }}
              >
                العودة إلى السوق العام
              </button>
            </div>
          )
        )}
      </main>

      {/* 1. نافذة الإعلان والتعليقات وإدارة الصور */}
      <ListingModal 
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSubmit={handleSaveListing}
        editingListing={editingListing}
        currentUser={user}
        onlyPhotosMode={onlyPhotosMode}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onAddCommentReply={handleAddCommentReply}
        onDeleteCommentReply={handleDeleteCommentReply}
        defaultIsDeal={defaultIsDealInModal}
        onViewUserProfile={handleViewUserProfile}
      />

      {/* 2. نافذة تسجيل الدخول بالبريد الإلكتروني */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 3. نافذة اتفاقية الاستخدام والتبرؤ المالي الإجبارية */}
      <TosModal 
        isOpen={isTosModalOpen}
        onAccept={handleAcceptTos}
      />

      {/* 4. نافذة الإبلاغ عن الإعلانات المسيئة */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listing={reportingListing}
        onSubmitReport={handleSubmitReport}
      />

      {/* 5. نافذة البث المباشر التفاعلي */}
      <LiveStreamModal
        isOpen={isLiveStreamModalOpen}
        onClose={() => setIsLiveStreamModalOpen(false)}
        currentUser={user}
        streamerUser={liveStreamerUser}
        onSaveRecordedStream={handleSaveRecordedStream}
      />

      {/* 6. الفوتر الرئيسي لتذييل الموقع وروابط الموثوقية والثقة */}
      <Footer onOpenPage={(page) => setActiveFooterPage(page)} />

      {/* 7. مودال عرض صفحات الموثوقية (اتصل بنا، من نحن، الخصوصية، الشروط) */}
      <FooterPagesModal 
        pageKey={activeFooterPage} 
        onClose={() => setActiveFooterPage(null)} 
        onNavigate={(page) => setActiveFooterPage(page)} 
      />
    </div>
  );
}
