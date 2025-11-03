import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PlayCircle } from 'lucide-react';
import type { Post } from '@/lib/posts';

type VideoContentCardProps = {
  post: Post;
};

export function VideoContentCard({ post }: VideoContentCardProps) {
  return (
    <Card className="overflow-hidden bg-card hover:bg-muted/50 transition-colors">
      {post.imageUrl && (
        <div className="relative aspect-video">
          <Image 
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white/70" />
            </div>
        </div>
      )}
      <div className="p-6">
        <CardHeader className="p-0 mb-2">
            <div className="flex items-center gap-2 mb-2">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-yellow-500/20 text-yellow-300">{tag}</Badge>
                ))}
            </div>
            <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mb-4">
            <p className="text-muted-foreground">{post.content}</p>
        </CardContent>
        <CardFooter className="p-0 flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
                <span>{format(new Date(post.createdAt), 'MM/dd/yy')} - </span>
                <span>{post.duration}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                Watch <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
