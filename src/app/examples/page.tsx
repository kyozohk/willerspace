'use client';

import { TextCard } from '@/components/TextCard';
import { VoiceCard } from '@/components/VoiceCard';
import { VideoCard } from '@/components/VideoCard';
import { getPosts } from '@/lib/posts-data';
import { getAudioPosts } from '@/lib/audio-posts';
import { getVideoPosts } from '@/lib/video-posts';
import { useState } from 'react';

export default function ExamplesPage() {
  const posts = getPosts();
  const audioPosts = getAudioPosts();
  const videoPosts = getVideoPosts();
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Component Examples</h1>
        
        {/* View mode toggle */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded ${viewMode === 'mobile' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Mobile View
          </button>
          <button 
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded ${viewMode === 'desktop' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Desktop View
          </button>
        </div>
        
        {/* Written Content Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-medium text-white mb-8">Written Content Cards</h2>
          <div className={`grid ${viewMode === 'mobile' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-8`}>
            <TextCard post={posts[0]} layout={viewMode} />
            <TextCard post={posts[1]} layout={viewMode} />
            <TextCard post={posts[2]} layout={viewMode} />
          </div>
        </section>
        
        {/* Audio Content Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-medium text-white mb-8">Audio Content Cards</h2>
          <div className={`grid ${viewMode === 'mobile' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-8`}>
            <VoiceCard post={audioPosts[0]} layout={viewMode} />
            <VoiceCard post={audioPosts[1]} layout={viewMode} />
          </div>
        </section>
        
        {/* Video Content Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-medium text-white mb-8">Video Content Cards</h2>
          <div className={`grid ${viewMode === 'mobile' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-8`}>
            <VideoCard post={videoPosts[0]} layout={viewMode} />
            <VideoCard post={videoPosts[1]} layout={viewMode} />
          </div>
        </section>
      </div>
    </div>
  );
}
