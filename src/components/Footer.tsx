import { Logo } from "./icons/Logo";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t mt-16">
            <div className="container py-8 text-center text-sm text-muted-foreground">
                 <div className="flex items-center justify-center gap-2 mb-4">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold font-headline text-lg text-foreground">Willer's Space</span>
                 </div>
                <p>&copy; {new Date().getFullYear()} Willer Pool. All Rights Reserved.</p>
                 <div className="flex justify-center gap-4 mt-4">
                    <Link href="#" className="hover:text-primary transition-colors">Home</Link>
                    <Link href="#" className="hover:text-primary transition-colors">About</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                 </div>
            </div>
        </footer>
    );
}
