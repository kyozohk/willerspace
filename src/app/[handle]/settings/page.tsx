'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { getUserByHandle } from '@/lib/users';
import { updateUserProfile } from '@/lib/profile';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [headline, setHeadline] = useState('');
  
  useEffect(() => {
    const fetchUserAndCheckOwnership = async () => {
      try {
        // Fetch user profile by handle
        const userProfile = await getUserByHandle(handle as string);
        setProfileUser(userProfile);
        
        if (userProfile) {
          // Check if current user is the owner of this profile
          const ownerStatus = user ? await isHandleOwner(user.uid, handle as string) : false;
          setIsOwner(ownerStatus);
          
          if (!ownerStatus) {
            // Redirect if not the owner
            toast({
              title: 'Access Denied',
              description: 'You do not have permission to edit this profile.',
              variant: 'destructive',
            });
            router.push(`/${handle}`);
            return;
          }
          
          // Set form values
          setFirstName(userProfile.firstName || '');
          setLastName(userProfile.lastName || '');
          setBio(userProfile.bio || '');
          setTagline(userProfile.tagline || '');
          setHeadline(userProfile.headline || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndCheckOwnership();
  }, [handle, user, router, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileUser || !isOwner) {
      return;
    }
    
    setSaving(true);
    
    try {
      await updateUserProfile(profileUser.uid, {
        firstName,
        lastName,
        bio,
        tagline,
        headline,
      });
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      
      // Redirect back to profile
      router.push(`/${handle}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-white/20 rounded"></div>
            <div className="h-4 w-48 bg-white/20 rounded"></div>
            <div className="h-40 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profileUser || !isOwner) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href={`/${handle}`} className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </div>
        
        <Card className="bg-black/20 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Profile Settings</CardTitle>
            <CardDescription className="text-white/70">
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-white">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A short description that appears under your username"
                  className="bg-black/20 border-white/20 text-white"
                />
                <p className="text-white/50 text-xs">Example: A living journal of ideas, process, and creative evolution</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headline" className="text-white">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="A bold statement that appears at the top of your profile"
                  className="bg-black/20 border-white/20 text-white"
                />
                <p className="text-white/50 text-xs">Example: Exploring the space between sound and thought</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  className="bg-black/20 border-white/20 text-white min-h-[150px]"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
