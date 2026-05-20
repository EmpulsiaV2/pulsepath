import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PulsePath',
  description: 'Build powerful daily routines.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'PulsePath' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#F2EDE4',
  width: 'device-width',
  initialScale: 1, maximumScale: 1, userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PulsePath" />
      </head>
      <body>
        {/*
          Splash screen — pure HTML/CSS, renders before any JS.
          Visible instantly when app opens from home screen.
          Removed by the inline script once window fires 'load'.
        */}
        <div
          id="pp-splash"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#F2EDE4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: '#D4612A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 8px 28px rgba(212,97,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            animation: 'pp-pulse 1.8s ease-in-out infinite',
          }}>
            ⚡
          </div>
          {/* Wordmark */}
          <p style={{
            fontFamily: '-apple-system, Inter, system-ui, sans-serif',
            fontSize: 22, fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#1A1108',
            margin: 0,
          }}>
            PulsePath
          </p>
          {/* Loader dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#D4612A',
                  opacity: 0.25,
                  animation: `pp-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Splash keyframes + removal script — no external deps needed */}
        <style>{`
          @keyframes pp-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 8px 28px rgba(212,97,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
            50%       { transform: scale(0.96); box-shadow: 0 4px 16px rgba(212,97,42,0.20), inset 0 1px 0 rgba(255,255,255,0.25); }
          }
          @keyframes pp-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
            40%            { opacity: 0.9; transform: scale(1.15); }
          }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function hideSplash() {
                  var el = document.getElementById('pp-splash');
                  if (!el) return;
                  el.style.opacity = '0';
                  setTimeout(function() { el && el.remove(); }, 380);
                }
                // Hide once page is interactive
                if (document.readyState === 'complete') {
                  setTimeout(hideSplash, 120);
                } else {
                  window.addEventListener('load', function() {
                    setTimeout(hideSplash, 120);
                  });
                }
              })();
            `,
          }}
        />

        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: 'rgba(255,252,247,0.97)',
                color: '#1A1108',
                border: '0.5px solid rgba(160,120,80,0.18)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(100,60,20,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                padding: '10px 14px',
              },
              success: { iconTheme: { primary: '#4D7C2A', secondary: 'white' } },
              error:   { iconTheme: { primary: '#C03020', secondary: 'white' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
