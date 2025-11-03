import Link from 'next/link';
import { getSession } from '@/lib/session';
import { Logo } from '@/components/icons/Logo';
import { LogoutButton } from './LogoutButton';
import { Button } from './ui/button';
import { CommunityAvatar } from './CommunityAvatar';

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <CommunityAvatar className="h-8 w-8" />
            <span className="font-bold font-headline sm:inline-block text-foreground">
              Willer's Space
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {session?.isAuthed ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/post">Create Post</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
               <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
