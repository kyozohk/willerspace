import Image from 'next/image';
import { format } from 'date-fns';
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
    <Card className="overflow-hidden bg-card hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {post.imageUrl && (
            <div className="sm:w-1/3 relative min-h-[150px] sm:min-h-0">
                <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                />
            </div>
        )}
        <div className={`p-6 ${post.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
            <CardHeader className="p-0 mb-2">
                <div className="flex items-center gap-2 mb-2">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary">{tag}</Badge>
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
                    Read <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </div>
      </div>
    </Card>
  );
}
