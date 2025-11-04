'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SimpleHeader() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Feed', href: '/' },
    { name: 'Read', href: '/read' },
    { name: 'Listen', href: '/listen' },
    { name: 'Watch', href: '/watch' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full py-6 px-8 md:px-16 flex justify-between items-center bg-transparent z-50">
      <div>
        <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={100} height={40} className="object-contain" />            
        </Link>
      </div>
      
      <nav className="flex items-center space-x-8 md:space-x-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-lg tracking-wide transition-all relative pb-1 group",
                isActive 
                  ? "text-white font-normal border-b border-white" 
                  : "text-white/80 font-light hover:text-white"
              )}
            >
              {item.name}
              {!isActive && (
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
