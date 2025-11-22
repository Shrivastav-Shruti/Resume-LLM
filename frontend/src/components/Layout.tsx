import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: '#1f2937',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginRight: 'auto' }}>
            Resume Screening Tool
          </h1>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
          >
            Home
          </Link>
          <Link
            to="/chat"
            style={{
              color: location.pathname === '/chat' ? '#60a5fa' : 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
          >
            Chat
          </Link>
        </div>
      </nav>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        background: '#f9fafb',
        padding: '16px',
        textAlign: 'center',
        color: '#6b7280',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p>Resume Screening Tool - Powered by RAG & LLM</p>
      </footer>
    </div>
  );
}
