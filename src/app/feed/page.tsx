'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function FeedPage() {
  const router = useRouter();
  const { user, profile } = useAuthContext();

  useEffect(() => {
    // If user is logged in and has a handle, redirect to their profile
    if (user && profile?.handle) {
      router.push(`/${profile.handle}`);
    } else {
      // Otherwise redirect to home page
      router.push('/');
    }
  }, [user, profile, router]);

  // Show nothing while redirecting
  return null;
}
