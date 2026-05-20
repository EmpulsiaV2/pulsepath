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

// Runs before React hydrates — creates the splash div imperatively
// so React never owns it and there's zero hydration mismatch.
const splashScript = `
(function(){
  var css = [
    '@keyframes pp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.94)}}',
    '@keyframes pp-dot{0%,80%,100%{opacity:.2;transform:scale(.85)}40%{opacity:1;transform:scale(1.2)}}',
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var el = document.createElement('div');
  el.id = 'pp-splash';
  el.innerHTML = [
    '<div style="',
      'width:72px;height:72px;border-radius:20px;',
      'background:#D4612A;',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:36px;',
      'box-shadow:0 8px 28px rgba(212,97,42,.35),inset 0 1px 0 rgba(255,255,255,.22);',
      'animation:pp-pulse 1.8s ease-in-out infinite;',
    '">⚡</div>',
    '<p style="',
      'font-family:-apple-system,Inter,system-ui,sans-serif;',
      'font-size:22px;font-weight:700;letter-spacing:-.03em;',
      'color:#1A1108;margin:0;',
    '">PulsePath</p>',
    '<div style="display:flex;gap:6px;margin-top:4px;">',
      [0,1,2].map(function(i){
        return '<div style="width:6px;height:6px;border-radius:50%;background:#D4612A;animation:pp-dot 1.2s ease-in-out '+(i*.2)+'s infinite;"></div>';
      }).join(''),
    '</div>',
  ].join('');
  Object.assign(el.style, {
    position:'fixed', inset:'0', zIndex:'99999',
    background:'#F2EDE4',
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', gap:'16px',
    transition:'opacity .32s ease',
    pointerEvents:'none',
  });
  document.body.appendChild(el);

  function hide(){
    el.style.opacity='0';
    setTimeout(function(){ el.parentNode&&el.parentNode.removeChild(el); }, 350);
  }
  if(document.readyState==='complete'){ setTimeout(hide,100); }
  else { window.addEventListener('load',function(){ setTimeout(hide,100); }); }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PulsePath" />
        {/*
          Script runs synchronously before paint — creates the splash div
          before React mounts, so React never sees it and hydration is clean.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body>
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
