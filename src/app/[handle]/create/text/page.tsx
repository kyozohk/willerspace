'use client';

import { useState, useEffect, useRef } from 'react';
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
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    // Cleanup function for image preview URL
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [user, handle, router, toast, imagePreview]);

  const triggerFileInput = () => {
    console.log('Triggering file input click');
    if (fileInputRef.current) {
      console.log('File input ref exists, clicking...');
      fileInputRef.current.click();
    } else {
      console.log('File input ref is null');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image input change event triggered', e);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select a valid image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image file size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        true, // Published by default
        imageFile || undefined // Pass the image file if it exists
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
            <div className="h-40 bg-black/20 rounded"></div>
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
        
        <Card className="bg-black/20 backdrop-blur-md border-white/20">
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
                  className="bg-black/20 border-white/20 text-white"
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
                  className="bg-black/20 border-white/20 text-white min-h-[300px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-white flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Featured Image (Optional)
                </Label>
                
                {imagePreview ? (
                  <div className="relative rounded-md overflow-hidden border border-white/20">
                    <div className="aspect-video relative">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full" 
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/30 rounded-md p-6 text-center bg-black/20">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 mb-2 text-white/70" />
                      <span className="text-white/70 text-sm">Click to upload an image</span>
                      <span className="text-white/50 text-xs mt-1">PNG, JPG, GIF up to 5MB</span>
                      
                      <label className="mt-4 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <div className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded cursor-pointer text-center">
                          Choose File
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Technology, Art, Personal"
                    className="bg-black/20 border-white/20 text-white"
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
                    className="bg-black/20 border-white/20 text-white"
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
