'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { isHandleOwner } from '@/lib/auth';
import { createTextContent } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTextPage() {
  const { handle } = useParams();
  const { user } = useAuthContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [readTime, setReadTime] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !handle || typeof handle !== 'string') {
        setIsOwner(false);
        return;
      }

      try {
        const ownerStatus = await isHandleOwner(user.uid, handle);
        setIsOwner(ownerStatus);
        
        if (!ownerStatus) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to create content for this profile.',
            variant: 'destructive',
          });
          router.push(`/${handle}`);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setInitialLoad(false);
      }
    };
    
    checkOwnership();
  }, [user, handle, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isOwner) {
      toast({
        title: 'Error',
        description: 'You must be logged in and own this profile to create content.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title || !content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await createTextContent(
        user.uid,
        title,
        "", // Empty description
        content,
        category,
        readTime,
        true // Published by default
      );
      
      toast({
        title: 'Success',
        description: 'Your text content has been created successfully.',
      });
      
      router.push(`/${handle}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state or redirect if not owner
  if (initialLoad) {
    return (
      <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-white/20 rounded"></div>
            <div className="h-4 w-48 bg-white/20 rounded"></div>
            <div className="h-40 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
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
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create Text Content</CardTitle>
            <CardDescription className="text-white/70">
              Share your thoughts, ideas, or stories with your audience
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
                  placeholder="Enter a title for your content"
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              
              
              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your content here..."
                  className="bg-white/10 border-white/20 text-white min-h-[300px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Technology, Art, Personal"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readTime" className="text-white">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min={1}
                    value={readTime}
                    onChange={(e) => setReadTime(parseInt(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
