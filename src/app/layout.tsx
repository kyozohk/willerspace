import type { Metadata } from 'next';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: "Willer's Space",
  description: "Willer Pool's personal social media website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-['Inter',sans-serif] overflow-x-hidden w-full">
        {/* Fixed background */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/bg.png"
            alt="Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        
        {/* Wrap everything in AuthProvider */}
        <AuthProvider>
          {/* Fixed header - no background */}
          <Header />
          
          {/* Scrollable content */}
          <div className="relative z-10 min-h-screen pt-20">
            <main className="flex-grow">
              {children}
            </main>
          </div>
          
          {/* Toast notifications */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}