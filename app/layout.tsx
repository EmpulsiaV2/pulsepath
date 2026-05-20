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
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: 'rgba(255,252,247,0.95)',
                color: '#1A1108',
                border: '0.5px solid rgba(160,120,80,0.18)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
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
