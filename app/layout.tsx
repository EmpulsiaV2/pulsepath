import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PulsePath',
  description: 'Build powerful daily routines.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PulsePath',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#07070a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PulsePath" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: 'var(--bg-3)',
                color: 'var(--tx-1)',
                border: '1px solid var(--border-2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'Geist, sans-serif',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                padding: '10px 14px',
              },
              success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-3)' } },
              error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-3)' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
