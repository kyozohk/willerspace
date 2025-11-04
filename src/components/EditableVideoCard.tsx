'use client';

import { useState } from 'react';
import { VideoCard } from './VideoCard';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteContent } from '@/lib/content';
import { useToast } from '@/hooks/use-toast';
import { VideoPost } from '@/lib/video-posts';

interface EditableVideoCardProps {
  post: VideoPost;
  layout?: 'mobile' | 'desktop';
  isOwner: boolean;
  userId: string;
  handle: string;
}

export function EditableVideoCard({ post, layout = 'desktop', isOwner, userId, handle }: EditableVideoCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = () => {
    router.push(`/${handle}/edit/video/${post.id}`);
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    setIsDeleting(true);
    
    try {
      await deleteContent(post.id);
      
      toast({
        title: 'Success',
        description: 'Content deleted successfully.',
      });
      
      // Refresh the page to show updated content list
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="relative group">
      <VideoCard post={post} layout={layout} />
      
      {isOwner && (
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-red-500/20"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-md border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Content</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this video content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white border-white/20 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
