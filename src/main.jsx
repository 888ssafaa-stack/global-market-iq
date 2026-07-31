import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Error Boundary لعرض أي خطأ على الشاشة بدلاً من الصفحة البيضاء
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" style={{
          padding: '40px',
          fontFamily: 'sans-serif',
          backgroundColor: '#1a1a2e',
          color: '#e0e0e0',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#EF4444' }}>⚠️ حدث خطأ في التطبيق</h1>
          <pre style={{
            background: '#16213e',
            padding: '20px',
            borderRadius: '12px',
            overflow: 'auto',
            fontSize: '14px',
            color: '#f8d7da',
            border: '1px solid #EF4444'
          }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 28px',
              background: '#1877F2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            🔄 إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🗺️ معالج خريطة الموقع المباشر (Sitemap Handler)
if (window.location.pathname === '/sitemap.xml' || window.location.pathname === '/sitemap') {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.global-market-iq.com/</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.global-market-iq.com/deals</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.global-market-iq.com/about</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.global-market-iq.com/contact</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.global-market-iq.com/privacy</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.global-market-iq.com/terms</loc>
    <lastmod>2026-07-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  document.open('text/xml');
  document.write(xmlContent);
  document.close();
} else {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
