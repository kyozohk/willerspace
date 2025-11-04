'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { updateUserHandle, reserveHandle, checkHandleExists } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SetupHandlePage() {
  const [handle, setHandle] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { user, profile } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is not logged in or already has a handle
  useEffect(() => {
    if (!user) {
      router.push('/signin');
    } else if (profile?.handle) {
      router.push(`/${profile.handle}`);
    }
  }, [user, profile, router]);

  // Check handle availability with debounce
  useEffect(() => {
    if (!handle) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const exists = await checkHandleExists(handle);
        setIsAvailable(!exists);
      } catch (error) {
        console.error('Error checking handle:', error);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!handle) {
      toast({
        title: 'Error',
        description: 'Please enter a handle.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isAvailable) {
      toast({
        title: 'Error',
        description: `Handle @${handle} is already taken.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // First reserve the handle to prevent race conditions
      await reserveHandle(user.uid, handle);
      
      // Then update the user's profile - skip existence check since we just reserved it
      await updateUserHandle(user.uid, handle, true);
      
      toast({
        title: 'Success',
        description: `Your handle @${handle} has been set successfully.`,
      });
      
      // Redirect to the user's profile page
      router.push(`/${handle}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set handle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle validation
  const validateHandle = (value: string) => {
    return /^[a-zA-Z0-9_]+$/.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    if (value === '' || validateHandle(value)) {
      setHandle(value);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Create Your Handle</CardTitle>
            <CardDescription className="text-center text-white/70">
              Choose a unique handle for your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="handle" className="text-white">Handle</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">@</span>
                  <Input
                    id="handle"
                    value={handle}
                    onChange={handleChange}
                    className="pl-8 bg-white/10 border-white/20 text-white"
                    placeholder="your_handle"
                    required
                  />
                  {handle && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checking ? (
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white/70 animate-spin"></div>
                      ) : isAvailable === true ? (
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isAvailable === false ? (
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/70">
                  Your handle must be unique and can only contain letters, numbers, and underscores.
                </p>
                {handle && !validateHandle(handle) && (
                  <p className="text-xs text-red-400 mt-1">
                    Handle can only contain letters, numbers, and underscores.
                  </p>
                )}
                {handle && isAvailable === false && (
                  <p className="text-xs text-red-400 mt-1">
                    This handle is already taken.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading || !isAvailable || !handle}
              >
                {loading ? 'Setting up...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-white/70">
              This will be your public profile URL: willerspace.com/@{handle || 'your_handle'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
