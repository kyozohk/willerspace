import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PlayCircle } from 'lucide-react';
import type { Post } from '@/lib/posts';

type VideoContentCardProps = {
  post: Post;
};

export function VideoContentCard({ post }: VideoContentCardProps) {
  return (
    <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border border-border transition-colors shadow-lg shadow-black/20">
      {post.imageUrl && (
        <div className="relative aspect-video">
          <Image 
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white/80 hover:text-white transition-colors cursor-pointer" />
            </div>
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
            {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{tag}</Badge>
            ))}
        </div>
        <CardTitle className="font-headline text-xl mb-2">{post.title}</CardTitle>
        <p className="text-muted-foreground text-sm mb-4">{post.content}</p>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{post.duration}</span>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary p-0 h-auto">
                Watch <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </div>
    </Card>
  );
}