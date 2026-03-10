import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavigation } from '@/components/AppNavigation';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { AuthProvider } from '@/context/AuthContext';
import LiquidEther from '@/components/LiquidEther';
import { AuthGuard } from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#25671E',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'CarbonX | AI Industrial IoT Platform',
    template: '%s | CarbonX',
  },
  description:
    'CarbonX — AI-Driven Industrial IoT Platform for real-time energy monitoring, carbon footprint tracking, and machine health analysis using RX/TX architecture.',
  keywords: ['energy monitoring', 'industrial IoT', 'carbon footprint', 'machine health', 'AI', 'CarbonX'],
  authors: [{ name: 'CarbonX Team' }],
  creator: 'CarbonX',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'CarbonX | AI Industrial IoT Platform',
    description: 'Real-time energy monitoring, carbon footprint tracking, and AI machine health analysis.',
    siteName: 'CarbonX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarbonX | AI Industrial IoT Platform',
    description: 'Real-time energy monitoring, carbon footprint tracking, and AI machine health analysis.',
  },
};

import { SystemProvider } from '@/context/SystemContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/carbon_logo.png" />
        <link rel="apple-touch-icon" href="/carbon_logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CarbonX" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden text-brand-green-dark`} suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <SystemProvider>
              {/* PWA Install Prompt Banner */}
              <PWAInstallBanner />

              {/* Responsive Navigation — top-left for desktop, hamburger for mobile */}
              <AppNavigation />

              {/* LiquidEther React Bits Background */}
              <div className="fixed inset-0 -z-50 bg-black/5">
                <LiquidEther colors={['#25671E', '#48A111', '#bbf7d0']} />
              </div>

              <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] pb-8">
                {children}
              </main>
            </SystemProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
