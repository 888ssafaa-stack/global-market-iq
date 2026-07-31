import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Send, 
  Heart, 
  Users, 
  Radio, 
  Flame, 
  Sparkles,
  Share2,
  ThumbsUp,
  MessageSquare,
  Flag,
  Ban,
  Handshake,
  Edit3,
  Trash2
} from 'lucide-react';

export default function LiveStreamModal({
  isOpen,
  onClose,
  currentUser,
  streamerUser,
  onSaveRecordedStream,
  onLike,
  onReport,
  onBlock,
  onEdit,
  onDelete,
  onRequestPartnership,
  isPartner = false,
  hasPendingPartnership = false,
  incomingPartnershipNotif = null,
  onAcceptPartnership,
  onViewUserProfile
}) {
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [viewerCount, setViewerCount] = useState(1);
  const [heartsCount, setHeartsCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const isStreamer = !streamerUser || streamerUser.id === currentUser?.id;
  const activeStreamer = streamerUser || currentUser;

  // بدء الكاميرا الحقيقية عند البث
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsLive(false);
      return;
    }

    if (isStreamer && isLive) {
      startCamera();
    }

    // محاكاة زيادة المشاهدين في البث
    const viewerInterval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 4000);

    return () => {
      clearInterval(viewerInterval);
      stopCamera();
    };
  }, [isOpen, isLive, isStreamer]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('[LiveStream Camera Warning]:', err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    } else {
      setCameraActive(!cameraActive);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    } else {
      setMicActive(!micActive);
    }
  };

  const handleStartStream = () => {
    setIsLive(true);
    setComments([
      {
        id: `sys_${Date.now()}`,
        userName: 'النظام 🤖',
        text: 'تم بدء البث المباشر بنجاح! يسعدنا انضمام المتابعين الآن. 📡',
        isSystem: true
      }
    ]);
  };

  const handleEndStream = () => {
    if (window.confirm('هل أنت تأكد من رغبتك في إنهاء البث المباشر ونشر نسخته على صفحتك الشخصية والسوق؟ 🔴')) {
      stopCamera();
      setIsLive(false);
      if (onSaveRecordedStream) {
        onSaveRecordedStream({
          title: `تسجيل بث مباشر 🔴 - ${activeStreamer?.name || 'مستخدم'}`,
          description: `تسجيل أحدث بث مباشر تم إذاعته في منصة السوق العالمي عبر المستخدم ${activeStreamer?.name || ''}`,
          category: 'أخرى',
          isLiveRecorded: true,
          images: [
            'https://assets.mixkit.co/videos/preview/mixkit-recording-a-live-stream-video-41487-large.mp4',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
          ]
        }, activeStreamer || currentUser);
      }
      onClose();
    }
  };

  const handleSendHeart = () => {
    if (!isLiked) {
      setHeartsCount((prev) => prev + 1);
      setIsLiked(true);
      if (onLike) onLike(activeStreamer?.id || currentUser?.id);
    }
    const newH = {
      id: `h_${Date.now()}_${Math.random()}`,
      left: Math.random() * 80 + 10
    };
    setFloatingHearts((prev) => [...prev, newH]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newH.id));
    }, 2000);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comm = {
      id: `c_${Date.now()}`,
      userId: currentUser?.id,
      userName: currentUser?.name || 'مستخدِم',
      userAvatar: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=1877F2&color=fff`,
      text: newComment.trim(),
      createdAt: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
    };

    setComments((prev) => [...prev, comm]);
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '520px', 
          width: '100%', 
          borderRadius: '20px', 
          padding: '0', 
          overflow: 'hidden', 
          background: '#0f172a',
          color: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* رأس النافذة: شارة البث المباشر وشريط التحكم */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.95), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: isLive ? '#EF4444' : '#64748B',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: isLive ? 'pulse 2s infinite' : 'none'
            }}>
              <Radio size={14} />
              <span>{isLive ? 'بث مباشر 🔴 LIVE' : 'جاهز للبث 📡'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#94A3B8' }}>
              <Users size={14} color="#38BDF8" />
              <span>{viewerCount} مشاهد</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '14px 18px 0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={handleSendHeart} style={{ border: 'none', background: isLiked ? '#1877F2' : 'rgba(24,119,242,0.12)', color: isLiked ? '#fff' : '#1877F2', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ThumbsUp size={16} fill={isLiked ? '#fff' : 'none'} />
            <span>{heartsCount} إعجاب</span>
          </button>

          <button onClick={() => setShowComments((prev) => !prev)} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} />
            <span>{showComments ? 'إخفاء التعليقات' : 'التعليقات'}</span>
          </button>

          {!isStreamer && currentUser && (
            <>
              <button onClick={() => onReport ? onReport(activeStreamer) : alert('تم الإبلاغ عن هذا البث بنجاح')} style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag size={16} />
                <span>إبلاغ</span>
              </button>

              <button onClick={() => onBlock ? onBlock(activeStreamer?.id, activeStreamer?.name) : alert('تم حظر هذا المستخدم')} style={{ border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.12)', color: '#FCD34D', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ban size={16} />
                <span>حظر</span>
              </button>
            </>
          )}

          {!isStreamer && currentUser && (
            !isPartner ? (
              incomingPartnershipNotif ? (
                <button onClick={() => onAcceptPartnership && onAcceptPartnership(incomingPartnershipNotif)} style={{ border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Handshake size={16} />
                  <span>قبول شراكة</span>
                </button>
              ) : hasPendingPartnership ? (
                <span style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', borderRadius: '999px', padding: '8px 12px', fontWeight: '700' }}>طلب شراكة قيد الانتظار</span>
              ) : (
                <button onClick={() => onRequestPartnership && onRequestPartnership(activeStreamer?.id, activeStreamer?.name, activeStreamer?.email)} style={{ border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.12)', color: '#A7F3D0', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Handshake size={16} />
                  <span>طلب شراكة</span>
                </button>
              )
            ) : (
              <span style={{ background: 'rgba(16,185,129,0.16)', color: '#A7F3D0', borderRadius: '999px', padding: '8px 12px', fontWeight: '700' }}>شريك اقتصادي</span>
            )
          )}

          {isStreamer && (
            <>
              <button onClick={() => onEdit ? onEdit(activeStreamer) : alert('سيتم إضافة تعديل هذا البث قريباً')} style={{ border: '1px solid rgba(24,119,242,0.35)', background: 'rgba(24,119,242,0.12)', color: '#93C5FD', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={16} />
                <span>تعديل</span>
              </button>

              <button onClick={() => onDelete ? onDelete(activeStreamer) : onClose()} style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', borderRadius: '999px', padding: '8px 12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={16} />
                <span>حذف</span>
              </button>
            </>
          )}
        </div>

        {/* شاشة البث المباشر والفيديو */}
        <div style={{ position: 'relative', width: '100%', height: '320px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLive ? (
            cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                <VideoOff size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>الكاميرا متوقفة حالياً</p>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <img
                src={activeStreamer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeStreamer?.name || 'Live')}&background=1877F2&color=fff`}
                alt={activeStreamer?.name}
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #EF4444', margin: '0 auto 14px', objectFit: 'cover' }}
              />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>{activeStreamer?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '20px' }}>
                جاهز لبدء البث المباشر والتفاعل مع الشركاء والمتابعين
              </p>

              {isStreamer && (
                <button
                  onClick={handleStartStream}
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Radio size={20} />
                  <span>بدء البث المباشر الآن 📡</span>
                </button>
              )}
            </div>
          )}

          {/* القلوب المتطايرة */}
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: `${h.left}%`,
                color: '#EF4444',
                fontSize: '24px',
                animation: 'floatUp 2s ease-out forwards',
                pointerEvents: 'none'
              }}
            >
              ❤️
            </div>
          ))}

          {/* معلومات صاحب البث في أسفل الشاشة */}
          {isLive && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={activeStreamer?.avatar || 'https://ui-avatars.com/api/?name=User'}
                  alt=""
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #EF4444', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>{activeStreamer?.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: '#10B981' }}>بث مباشر تفاعلي 📡</span>
                </div>
              </div>

              {/* أزرار التحكم بالكاميرا والصوت للمذيع */}
              {isStreamer && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={toggleCamera} style={{ background: cameraActive ? 'rgba(255,255,255,0.15)' : '#EF4444', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                    {cameraActive ? <Video size={16} /> : <VideoOff size={16} />}
                  </button>
                  <button onClick={toggleMic} style={{ background: micActive ? 'rgba(255,255,255,0.15)' : '#EF4444', border: 'none', color: '#fff', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                    {micActive ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                  <button onClick={handleEndStream} style={{ background: '#DC2626', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
                    إنهاء 🔴
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* قسم الدردشة والتفاعلات الحية */}
        {showComments && (
          <div style={{ padding: '16px', background: '#0f172a', height: '240px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 الدردشة المباشرة ({comments.length})
              </span>
              <button 
                onClick={handleSendHeart}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '4px 12px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Heart size={14} fill="#EF4444" />
                <span>{heartsCount}</span>
              </button>
            </div>

            {/* قائمة التعليقات */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.82rem', margin: 'auto' }}>
                  لا توجد تعليقات حتى الآن. كن أول من يتفاعل في البث! 🎉
                </div>
              ) : (
                comments.map((c) => (
                  <div 
                    key={c.id} 
                    style={{
                      background: c.isSystem ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      borderRight: c.isSystem ? '3px solid #38BDF8' : 'none'
                    }}
                  >
                    {!c.isSystem && (
                      <span style={{ fontWeight: '800', color: '#38BDF8', marginLeft: '6px' }}>
                        {c.userName}:
                      </span>
                    )}
                    <span>{c.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* إدخال تعليق جديد */}
            <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="اكتب تعليقاً في البث المباشر..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#1877F2',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
