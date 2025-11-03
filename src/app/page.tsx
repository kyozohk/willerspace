import { getPosts, type Post } from '@/lib/posts';
import { MessageSquare } from 'lucide-react';
import { CommunityAvatar } from '@/components/CommunityAvatar';
import { SubscribeForm } from '@/components/SubscribeForm';
import { WrittenContentCard } from '@/components/WrittenContentCard';
import { AudioContentCard } from '@/components/AudioContentCard';
import { VideoContentCard } from '@/components/VideoContentCard';
import Image from 'next/image';

export const revalidate = 60; // Revalidate every 60 seconds

const renderPost = (post: Post) => {
  switch (post.type) {
    case 'text':
      return <WrittenContentCard key={post.id} post={post} />;
    case 'audio':
      return <AudioContentCard key={post.id} post={post} />;
    case 'video':
      return <VideoContentCard key={post.id} post={post} />;
    default:
      return null;
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12 md:mb-20 space-y-4">
            <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-8">
              <Image src="/Intro desktop.png" alt="Intro" fill className="object-cover"/>
            </div>
            <div className='flex items-center justify-center gap-4 mb-4'>
                <CommunityAvatar />
                <div>
                    <h1 className='text-xl font-bold font-headline text-foreground'>Willer Community</h1>
                    <p className='text-muted-foreground text-sm'>A living journal of ideas, process and creative evolution</p>
                </div>
            </div>
          <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-foreground">
            Exploring the space between sound and thought
          </h2>
        </header>

        <section className="mb-12 md:mb-20">
            <div className="bg-card/80 backdrop-blur-sm border border-border p-6 sm:p-8 rounded-lg shadow-2xl shadow-black/20">
                <h3 className="text-2xl font-bold font-headline text-foreground mb-2">I'd love you to join the community</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                Get exclusive content, updates, and insights delivered straight to your inbox. Members will be able to respond to content pieces, and receive private responses to what Willer writes. Willer will respond where possible.
                </p>
                <SubscribeForm />
            </div>
        </section>

        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map(renderPost)
          ) : (
            <div className="text-center py-20 bg-card/50 rounded-lg shadow-sm border border-dashed">
              <div className="flex justify-center mb-4">
                <MessageSquare className="w-16 h-16 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-headline text-muted-foreground">No posts yet.</h2>
              <p className="text-muted-foreground mt-2">Come back later for updates from Willer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
