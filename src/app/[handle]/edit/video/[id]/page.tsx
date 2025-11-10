'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { getContentById, updateContent } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { WatchContent } from '@/types/content';

export default function EditVideoPage() {
  const { handle, id } = useParams();
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkOwnershipAndLoadContent = async () => {
      if (!user || !handle || typeof handle !== 'string' || !id || typeof id !== 'string') {
        setIsOwner(false);
        return;
      }

      try {
        const ownerStatus = await isHandleOwner(user.uid, handle);
        setIsOwner(ownerStatus);
        
        if (!ownerStatus) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to edit content for this profile.',
            variant: 'destructive',
          });
          router.push(`/${handle}`);
          return;
        }
        
        const contentData = await getContentById(id);
        
        if (!contentData || contentData.type !== 'watch') {
          toast({
            title: 'Error',
            description: 'Video content not found or invalid.',
            variant: 'destructive',
          });
          router.push(`/${handle}`);
          return;
        }
        
        const videoContent = contentData as WatchContent;
        setTitle(videoContent.title);

      } catch (error) {
        console.error('Error checking ownership or loading content:', error);
        setIsOwner(false);
      } finally {
        setInitialLoad(false);
      }
    };
    
    checkOwnershipAndLoadContent();
  }, [user, handle, id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isOwner || typeof id !== 'string') {
      toast({ title: 'Error', description: 'Permission denied.', variant: 'destructive' });
      return;
    }
    
    if (!title) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      await updateContent(id, {
        title,
      });
      
      toast({
        title: 'Success',
        description: 'Your video content has been updated.',
      });
      
      router.push(`/${handle}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
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

  if (!isOwner) {
    return null;
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
            <CardTitle className="text-2xl text-white">Edit Video Content</CardTitle>
            <CardDescription className="text-white/70">
              Update the title of your video content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your video"
                  className="bg-black/20 border-white/20 text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-[#FFB619] hover:bg-[#FFB619]/90 text-white"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Video Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
