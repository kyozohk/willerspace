import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/posts';

type WrittenContentCardProps = {
  post: Post;
};

export function WrittenContentCard({ post }: WrittenContentCardProps) {
  return (
    <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border border-border transition-colors shadow-lg shadow-black/20">
        <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">{tag}</Badge>
                ))}
            </div>
            <CardTitle className="font-headline text-xl mb-2">{post.title}</CardTitle>
            <p className="text-muted-foreground text-sm mb-4">{post.content}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{post.duration}</span>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary p-0 h-auto">
                    Read <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}