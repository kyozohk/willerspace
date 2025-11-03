import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { AudioPlayer } from './AudioPlayer';
import type { Post } from '@/lib/posts';
import Image from 'next/image';

type AudioContentCardProps = {
  post: Post;
};

export function AudioContentCard({ post }: AudioContentCardProps) {
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
        </div>
      )}
        <CardContent className="p-4 sm:p-6">
             <div className="flex items-center gap-2 mb-3">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20">{tag}</Badge>
                ))}
            </div>
            <CardTitle className="font-headline text-xl mb-2">{post.title}</CardTitle>
            <p className="text-muted-foreground text-sm mb-4">{post.content}</p>
            {post.audioUrl && <AudioPlayer src={post.audioUrl} />}
        </CardContent>
    </Card>
  );
}
