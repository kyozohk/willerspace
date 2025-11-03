import Link from 'next/link';
import { getSession } from '@/lib/session';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

async function NavLinks() {
    const session = await getSession();

    return (
        <>
            <Button asChild variant="link" className="text-foreground">
                <Link href="#">Read</Link>
            </Button>
            <Button asChild variant="link" className="text-foreground">
                <Link href="#">Listen</Link>
            </Button>
            <Button asChild variant="link" className="text-foreground">
                <Link href="#">Watch</Link>
            </Button>
             {session?.isAuthed ? (
                <>
                <Button asChild variant="link" className="text-foreground">
                    <Link href="/post">Post</Link>
                </Button>
                <Button asChild variant="link" className="text-foreground">
                    <Link href="#">Profile</Link>
                </Button>
                </>
             ) : (
                <Button asChild variant="link" className="text-foreground">
                    <Link href="/login">Profile</Link>
                </Button>
             )}
        </>
    );
}

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container flex h-20 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline sm:inline-block text-foreground text-xl">
                Kyozo
            </span>
        </Link>
        
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
            <NavLinks />
        </div>

        <div className="flex md:hidden flex-1 items-center justify-end">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <NavLinks />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}