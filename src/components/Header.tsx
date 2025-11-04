'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuthContext();
  
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Explore', href: '/explore' },
  ];
  
  // Add profile link if user is logged in and has a handle
  if (profile?.handle) {
    navItems.push({ name: 'My Profile', href: `/${profile.handle}` });
  }
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        
        {/* Authentication buttons */}
        {loading ? (
          <div className="h-10 w-10 rounded-full bg-white/20 animate-pulse"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-purple-700 text-white">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                {profile?.firstName} {profile?.lastName}
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {profile?.handle ? `@${profile.handle}` : 'No handle set'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile?.handle && (
                <DropdownMenuItem asChild>
                  <Link href={`/${profile.handle}`}>My Profile</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button className="bg-white text-purple-900 hover:bg-white/90" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
