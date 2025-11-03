import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import './globals.css';
import Image from 'next/image';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background relative">
        <Image
          src="/bg.png"
          alt="Community background"
          fill
          className="object-cover object-center z-0 opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/50 to-transparent mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-background/80 z-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 z-0">
          <Image src="/Ellipse 1.png" alt="gradient ellipse" fill className="object-contain" />
        </div>
        
        <div className="relative z-20 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
