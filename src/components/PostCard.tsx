import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { AudioPlayer } from './AudioPlayer';
import type { Post } from '@/lib/posts';

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] w-full overflow-hidden rounded-xl shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-300">
      <Image
        src={post.backgroundImageUrl}
        alt="Post background"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        data-ai-hint="abstract background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
      <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8 text-white">
        <p className="font-body text-base md:text-xl lg:text-2xl leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>
        <div className="flex items-center justify-between text-xs text-white/70">
          <time dateTime={post.createdAt.toISOString()}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </time>
          {post.audioUrl && <AudioPlayer src={post.audioUrl} />}
        </div>
      </div>
    </Card>
  );
}
