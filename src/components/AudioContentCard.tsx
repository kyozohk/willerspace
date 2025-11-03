import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { AudioPlayer } from './AudioPlayer';
import type { Post } from '@/lib/posts';

type AudioContentCardProps = {
  post: Post;
};

export function AudioContentCard({ post }: AudioContentCardProps) {
  return (
    <Card className="overflow-hidden bg-card hover:bg-muted/50 transition-colors p-6">
        <CardHeader className="p-0 mb-2">
            <div className="flex items-center gap-2 mb-2">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-blue-500/20 text-blue-300">{tag}</Badge>
                ))}
            </div>
            <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mb-4">
            <p className="text-muted-foreground">{post.content}</p>
        </CardContent>
        <CardFooter className="p-0 flex flex-col items-start gap-4">
            {post.audioUrl && <AudioPlayer src={post.audioUrl} />}
            <div className="text-xs text-muted-foreground w-full flex justify-between">
                <span>{format(new Date(post.createdAt), 'MM/dd/yy')}</span>
                <span>{post.duration}</span>
            </div>
        </CardFooter>
    </Card>
  );
}
