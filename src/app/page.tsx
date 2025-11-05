'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user, profile, loading } = useAuthContext();
  const router = useRouter();

  // Redirect logged-in users to their profile page
  useEffect(() => {
    if (!loading && user && profile?.handle) {
      router.push(`/${profile.handle}`);
    }
  }, [user, profile, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-48 bg-white/20 rounded mx-auto"></div>
            <div className="h-8 w-64 bg-white/20 rounded mx-auto"></div>
            <div className="h-40 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but doesn't have a handle, redirect to handle setup
  if (user && !profile?.handle) {
    router.push('/setup-handle');
    return null;
  }

  // Landing page for non-logged-in users
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-5xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-16">
          <Image 
            src="/logo.png" 
            alt="Willerspace Logo" 
            width={200} 
            height={80} 
            className="mx-auto mb-8"
            style={{ height: 'auto' }}
            priority
          />
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-white mt-8 mb-6 leading-[1.15] font-['Playfair_Display']">
            Share Your Voice
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Create and share text, audio, and video content with your own personalized profile.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/signup">
                <UserPlus className="mr-2 h-5 w-5" />
                Sign Up
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-black/20" asChild>
              <Link href="/signin">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {/* Text content */}
          <Card className="bg-black/20 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Write</CardTitle>
              <CardDescription className="text-white/70">
                Share your thoughts and ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                Create blog posts, articles, and short-form content to share with your audience.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/explore" className="text-purple-300 hover:text-purple-200 flex items-center">
                Explore <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
          
          {/* Audio content */}
          <Card className="bg-black/20 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Record</CardTitle>
              <CardDescription className="text-white/70">
                Share your voice and music
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                Upload or record audio content, podcasts, and music directly from your browser.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/explore" className="text-blue-300 hover:text-blue-200 flex items-center">
                Explore <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
          
          {/* Video content */}
          <Card className="bg-black/20 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Film</CardTitle>
              <CardDescription className="text-white/70">
                Share your videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                Upload or record video content directly from your browser and share with your audience.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/explore" className="text-red-300 hover:text-red-200 flex items-center">
                Explore <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* CTA section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-medium text-white mb-6">Ready to get started?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Create your account today and start sharing your content with the world.
          </p>
          
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
