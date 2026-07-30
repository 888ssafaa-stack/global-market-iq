// src/components/FooterPagesModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  Info, 
  ShieldCheck, 
  FileText, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Globe, 
  Lock, 
  Users, 
  Handshake, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function FooterPagesModal({ pageKey, onClose, onNavigate }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (!pageKey) return null;

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const renderContent = () => {
    switch (pageKey) {
      case 'contact':
        return (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <PhoneCall size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--fb-text-primary, #fff)' }}>
                  اتصل بنا (Contact Us) 📞
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
                  يسعدنا التواصل معك دائماً! فريق دعم منصة "السوق العالمي IQ" متواجد على مدار الساعة لمساعدتك واستقبال استفساراتك.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* تفاصيل الاتصال */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))',
                  border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--fb-text-primary, #fff)' }}>المقر الرئيسي</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>جمهورية العراق - بغداد - الكرادة</p>
                  </div>
                </div>

                <div style={{
                  background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))',
                  border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--fb-text-primary, #fff)' }}>البريد الإلكتروني للدعم الرسمية</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>888ssafaa@gmail.com</p>
                  </div>
                </div>

                <div style={{
                  background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))',
                  border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--fb-text-primary, #fff)' }}>أوقات العمل واستقبال الطلبات</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>24 ساعة / 7 أيام في الأسبوع عبر النظام الفوري</p>
                  </div>
                </div>
              </div>

              {/* نموذج إرسال رسالة مباشرة */}
              <div style={{
                background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))',
                border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--fb-text-primary, #fff)' }}>
                  أرسل رسالة مباشرة لإدارة المنصة ✉️
                </h3>

                {contactSent ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#10B981',
                    fontWeight: '700'
                  }}>
                    <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto' }} />
                    تم إرسال رسالتك بنجاح إلى إدارة منصة "السوق العالمي"! وسنقوم بالرد عليك في أقرب وقت.
                  </div>
                ) : (
                  <form onSubmit={handleSendContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--fb-text-secondary, #cbd5e1)' }}>
                        الاسم الكامل
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="أدخل اسمك الكريم" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--fb-input-border, rgba(255, 255, 255, 0.15))',
                          background: 'var(--fb-input-bg, rgba(15, 23, 42, 0.6))',
                          color: 'var(--fb-text-primary, #fff)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--fb-text-secondary, #cbd5e1)' }}>
                        البريد الإلكتروني أو رقم الهاتف
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="example@mail.com أو 0770xxxxxxx" 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--fb-input-border, rgba(255, 255, 255, 0.15))',
                          background: 'var(--fb-input-bg, rgba(15, 23, 42, 0.6))',
                          color: 'var(--fb-text-primary, #fff)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--fb-text-secondary, #cbd5e1)' }}>
                        نص الرسالة أو الاستفسار
                      </label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="اكتب استفسارك أو طلبك هنا..." 
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--fb-input-border, rgba(255, 255, 255, 0.15))',
                          background: 'var(--fb-input-bg, rgba(15, 23, 42, 0.6))',
                          color: 'var(--fb-text-primary, #fff)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <Send size={18} />
                      <span>إرسال الرسالة الآن</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <Info size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--fb-text-primary, #fff)' }}>
                  من نحن / عن المنصة (About Us) ℹ️
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
                  تعرّف على رؤية ورسالة "السوق العالمي IQ" — المنصة الوطنية الرائدة للتجارة المباشرة والشراكات الاقتصادية.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7', color: 'var(--fb-text-secondary, #cbd5e1)', fontSize: '0.95rem' }}>
              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '20px', borderRadius: '14px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h3 style={{ color: '#10B981', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} />
                  <span>نبذة عن منصة "السوق العالمي IQ"</span>
                </h3>
                <p style={{ margin: 0 }}>
                  تأسست منصة <strong>"السوق العالمي IQ" (Global Market IQ)</strong> لتكون أحدث بيئة رقمية متكاملة لربط البائعين، المشترين، أصحاب المحلات، والمستثمرين في العراق والعالم العربي تحت سقف واحد، بدون وسطاء أو عمولات خفية.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '20px', borderRadius: '14px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                  <h4 style={{ color: '#3B82F6', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Handshake size={18} />
                    <span>الشراكات الاقتصادية 🤝</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    تتيح المنصة نظاماً فريداً للربط الشراكي المباشر بين تجار الجملة، أصحاب المشاريع، وأصحاب رؤوس الأموال لتوسيع نطاق الأعمال وتحقيق الأرباح المتبادلة.
                  </p>
                </div>

                <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '20px', borderRadius: '14px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                  <h4 style={{ color: '#F59E0B', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={18} />
                    <span>السهولة والسرعة ⚡</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    إمكانية إضافة الإعلانات وتعديلها أو التفاعل معها بنقرة واحدة، مع تصفية الإعلانات حسب الأقسام والمحافظات العراقية بدقة فائقة.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '20px', borderRadius: '14px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h3 style={{ color: '#EF4444', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} />
                  <span>التزامنا بالأمان والموثوقية</span>
                </h3>
                <p style={{ margin: 0 }}>
                  نحن نلزم أنفسنا بتوفير أعلى درجات الحماية لبيانات المستخدمين، وحظر كافة السلوكيات الإحتيالية أو المنتهكة لحقوق الملكية، مع توفير أدوات إبلاغ فورية وفريق إشراف وإدارة متاح باستمرار.
                </p>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F59E0B, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--fb-text-primary, #fff)' }}>
                  سياسة الخصوصية (Privacy Policy) 🔒
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
                  تلتزم منصة "السوق العالمي IQ" بحماية خصوصية بياناتك وتوفير أقصى درجات الأمان لمعلوماتك الشخصية.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', color: 'var(--fb-text-secondary, #cbd5e1)', fontSize: '0.92rem', lineHeight: '1.7' }}>
              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#F59E0B', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>1. جمع المعلومات والبيانات</h4>
                <p style={{ margin: 0 }}>
                  نقوم بجمع البيانات التي تقدمها طوعاً عند إنشاء حسابك أو نشر إعلان (مثل الاسم، رقم الهاتف، البريد الإلكتروني، والمنطقة). نستخدم هذه البيانات حصرياً لتسهيل التواصل بين البائعين والمشترين وإدارة طلبات الشراكة.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#10B981', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>2. حماية البيانات والتشفير</h4>
                <p style={{ margin: 0 }}>
                  نستخدم تقنيات التشفير الحديثة واستضافة السحابة الآمنة عبر Firebase وVercel لحماية بياناتك من أي وصول غير مصرح به. لن يتم بيع أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة لأغراض تسويقية.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#3B82F6', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>3. ملفات تعريف الارتباط (Cookies) والملكية المحلية</h4>
                <p style={{ margin: 0 }}>
                  نستخدم التخزين المحلي الآمن (localStorage) لحفظ التفضيلات المؤقتة مثل حالة تسجيل الدخول، لغة العرض، وصورة البروفايل لضمان سرعة واستجابة واجهة التطبيق على الهاتف والويب.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#EC4899', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>4. حقوق المستخدم</h4>
                <p style={{ margin: 0 }}>
                  يحق لك في أي وقت تعديل بياناتك الشخصية، حذف إعلاناتك، أو طلب حذف حسابك بالكامل بالتواصل المباشر مع إدارة المنصة عبر البريد الرسمي <strong>888ssafaa@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(16, 185, 129, 0.15))',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #EC4899, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <FileText size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--fb-text-primary, #fff)' }}>
                  شروط الاستخدام (Terms & Conditions) 📜
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--fb-text-secondary, #94a3b8)' }}>
                  يرجى قراءة شروط وأحكام استخدام منصة "السوق العالمي IQ" لضمان بيئة آمنة لجميع المستخدمين.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', color: 'var(--fb-text-secondary, #cbd5e1)', fontSize: '0.92rem', lineHeight: '1.7' }}>
              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#EC4899', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>1. قبول الشروط والالتزامات</h4>
                <p style={{ margin: 0 }}>
                  باستخدامك لمنصة "السوق العالمي IQ"، فإنك توافق التزامك الكامل بكل القوانين العراقية والمحلية النافذة وعدم نشر أي إعلانات مخالفة أو مضللة.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#10B981', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>2. ضوابط ونشر الإعلانات</h4>
                <p style={{ margin: 0 }}>
                  يتحمل المعلن المسؤولية القانونية والأخلاقية الكاملة عن صحة السلع، الأوصاف، والأسعار المذكورة في إعلاناته. يُمنع منعاً باتاً نشر الأسلحة، المواد المحظورة، أو المنتجات غير المشروعة.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#3B82F6', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>3. طلبات الشراكة الاقتصادية</h4>
                <p style={{ margin: 0 }}>
                  تتيح المنصة خدمة الربط الشراكي كأداة للتعارف التجاري. تُنصح الأطراف دائماً بإجراء الفحص النافي للجهالة وتوثيق عقود الشراكة رسمياً، والمنصة غير مسؤولة عن النزاعات المادية بين الشركاء.
                </p>
              </div>

              <div style={{ background: 'var(--fb-card-bg, rgba(30, 41, 59, 0.7))', padding: '18px', borderRadius: '12px', border: '1px solid var(--fb-card-border, rgba(255, 255, 255, 0.1))' }}>
                <h4 style={{ color: '#EF4444', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>4. حظر الحسابات والإشراف</h4>
                <p style={{ margin: 0 }}>
                  تحتفظ إدارة المنصة بحق تعطيل أو حظر أي حساب أو إعلان ينتهك شروط الاستخدام أو يتلقى بلاغات احتيال متعددة لحماية سلامة باقي المشتركين.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'var(--fb-surface, #1e293b)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* شريط أعلى المودال */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--fb-surface, #1e293b)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => onNavigate('contact')} 
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: pageKey === 'contact' ? '#10B981' : 'transparent', color: pageKey === 'contact' ? '#fff' : 'var(--fb-text-secondary, #94a3b8)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              اتصل بنا
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: pageKey === 'about' ? '#10B981' : 'transparent', color: pageKey === 'about' ? '#fff' : 'var(--fb-text-secondary, #94a3b8)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              من نحن
            </button>
            <button 
              onClick={() => onNavigate('privacy')} 
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: pageKey === 'privacy' ? '#10B981' : 'transparent', color: pageKey === 'privacy' ? '#fff' : 'var(--fb-text-secondary, #94a3b8)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              الخصوصية
            </button>
            <button 
              onClick={() => onNavigate('terms')} 
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: pageKey === 'terms' ? '#10B981' : 'transparent', color: pageKey === 'terms' ? '#fff' : 'var(--fb-text-secondary, #94a3b8)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              الشروط
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--fb-text-primary, #fff)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* جسم المودال المحتوى */}
        <div style={{ padding: '24px 28px 36px 28px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
