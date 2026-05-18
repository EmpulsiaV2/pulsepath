import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PulsePath — Daily Routine Tracker',
  description: 'Build powerful daily routines. Track habits, stay consistent, and unlock your best self.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PulsePath',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'PulsePath',
    description: 'Build powerful daily routines.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PulsePath" />
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#18181b',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'var(--font-sora)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#18181b' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#18181b' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
