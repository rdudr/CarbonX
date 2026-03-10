import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavigationDock } from '@/components/NavigationDock';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CarbonX PowerByte | AI Industrial IoT',
  description: 'AI-Driven Industrial IoT Platform for monitoring energy usage, carbon footprint, and machine health.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen pb-24 relative overflow-x-hidden`}>
        {/* Ambient Glows for the Liquid Glass look */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green-light/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-yellow/10 blur-[150px] rounded-full pointer-events-none" />
        
        <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)]">
          {children}
        </main>
        
        <NavigationDock />
      </body>
    </html>
  );
}
