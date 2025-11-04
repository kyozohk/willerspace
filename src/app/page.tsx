import { SubscribeForm } from '@/components/SubscribeForm';
import { WrittenContentCard } from '@/components/WrittenContentCard';
import { AudioContentCard } from '@/components/AudioContentCard';
import { VideoContentCard } from '@/components/VideoContentCard';
import { getPosts } from '@/lib/posts-data';
import { getAudioPosts } from '@/lib/audio-posts';
import { getVideoPosts } from '@/lib/video-posts';
import Image from 'next/image';


export default async function Home() {
  const posts = getPosts();
  const audioPosts = getAudioPosts();
  const videoPosts = getVideoPosts();
  
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-36 pb-24 md:pb-40">
      <div className="max-w-5xl mx-auto">
        {/* Title component with logo and subtitle */}
        <div className="flex items-center mb-12">
          <Image 
            src="/favicon.png" 
            alt="Willer Community Logo" 
            width={72} 
            height={72} 
            className="rounded-full"
            priority
          />
          <div className="ml-4">
            <h2 className="text-2xl font-medium text-slate-600">Willer Community</h2>
            <p className="text-slate-500/90 text-sm md:text-base">A living journal of ideas, process, and creative evolution</p>
          </div>
        </div>
        
        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-[#7b6d9b] mt-12 leading-[1.15] font-['Playfair_Display']">
          Exploring the space between<br />
          sound and thought
        </h1>
        
        {/* Subscribe Form */}
        <div className="mt-16">
          <SubscribeForm />
        </div>
        
        {/* Content Cards */}
        <div className="mt-24 space-y-16">
          {/* Written Content Cards - Text Only */}
          <div>
            <div className="space-y-6 md:block hidden">
              {posts.filter(post => post.format === 'text').map((post) => (
                <WrittenContentCard key={post.id} post={post} layout="desktop" />
              ))}
            </div>
            <div className="md:hidden grid grid-cols-1 gap-6">
              {posts.filter(post => post.format === 'text').map((post) => (
                <WrittenContentCard key={post.id} post={post} layout="mobile" />
              ))}
            </div>
          </div>
          
          {/* Written Content Cards - With Image */}
          <div>
            <div className="space-y-6 md:block hidden">
              {posts.filter(post => post.format === 'image-text').map((post) => (
                <WrittenContentCard key={post.id} post={post} layout="desktop" />
              ))}
            </div>
            <div className="md:hidden grid grid-cols-1 gap-6">
              {posts.filter(post => post.format === 'image-text').map((post) => (
                <WrittenContentCard key={post.id} post={post} layout="mobile" />
              ))}
            </div>
          </div>
          
          {/* Audio Content Cards */}
          <div>
            <div className="space-y-6 md:block hidden">
              {audioPosts.slice(0, 2).map((post) => (
                <AudioContentCard key={post.id} post={post} layout="desktop" />
              ))}
            </div>
            <div className="md:hidden grid grid-cols-1 gap-6">
              {audioPosts.slice(0, 2).map((post) => (
                <AudioContentCard key={post.id} post={post} layout="mobile" />
              ))}
            </div>
          </div>
          
          {/* Video Content Cards */}
          <div>
            <div className="space-y-6 md:block hidden">
              {videoPosts.slice(0, 2).map((post) => (
                <VideoContentCard key={post.id} post={post} layout="desktop" />
              ))}
            </div>
            <div className="md:hidden grid grid-cols-1 gap-6">
              {videoPosts.slice(0, 2).map((post) => (
                <VideoContentCard key={post.id} post={post} layout="mobile" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
