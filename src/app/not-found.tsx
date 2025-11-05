import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-9xl font-bold text-white mb-6">404</h1>
        <h2 className="text-4xl font-medium text-white mb-8">Page Not Found</h2>
        <p className="text-xl text-white/70 mb-12 max-w-lg mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
          
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-black/20" asChild>
            <Link href="/explore">
              <Search className="mr-2 h-5 w-5" />
              Explore Content
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
