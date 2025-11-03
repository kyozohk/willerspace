import { SubscribeForm } from "./SubscribeForm";
import { Logo } from "./icons/Logo";

export function Footer() {
    return (
        <footer className="border-t">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-start gap-2">
                         <div className="flex items-center gap-2">
                            <Logo className="h-6 w-6" />
                            <span className="font-bold font-headline text-lg">Willer's Space</span>
                         </div>
                        <p className="text-sm text-muted-foreground">
                            A personal corner of the internet for Willer Pool.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-headline text-lg font-medium">Get updates</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to receive notifications about new content straight to your inbox.
                        </p>
                        <SubscribeForm />
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Willer Pool. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
