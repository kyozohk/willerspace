import PostCard from '@/components/PostCard';
import { getPosts, type Post } from '@/lib/posts';
import { MessageSquare } from 'lucide-react';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-20 bg-background rounded-lg shadow-sm border border-dashed">
            <div className="flex justify-center mb-4">
              <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-headline text-muted-foreground">No posts yet.</h2>
            <p className="text-muted-foreground mt-2">Come back later for updates from Willer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
