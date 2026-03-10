import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavigation } from '@/components/AppNavigation';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#25671E',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CarbonX | AI Industrial IoT Platform',
  description:
    'CarbonX — AI-Driven Industrial IoT Platform for real-time energy monitoring, carbon footprint tracking, and machine health analysis using RX/TX architecture.',
  keywords: ['energy monitoring', 'industrial IoT', 'carbon footprint', 'machine health', 'AI', 'CarbonX'],
  authors: [{ name: 'CarbonX Team' }],
  creator: 'CarbonX',
  manifest: '/manifest.json',
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CarbonX" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden`}>
        <SystemProvider>
          {/* PWA Install Prompt Banner */}
          <PWAInstallBanner />

          {/* Responsive Navigation — top-left for desktop, hamburger for mobile */}
          <AppNavigation />

          {/* Ambient Glows for the Liquid Glass look */}
          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green-light/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-yellow/10 blur-[150px] rounded-full pointer-events-none" />

          <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] pb-8">
            {children}
          </main>
        </SystemProvider>
      </body>
    </html>
  );
}
