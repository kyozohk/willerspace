'use client';

import { Play, Pause, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { type AudioPost } from '@/lib/audio-posts';

type AudioContentCardProps = {
  post: AudioPost;
  layout?: 'mobile' | 'desktop';
};

export function AudioContentCard({ post, layout = 'desktop' }: AudioContentCardProps) {
  const { title, description, type, duration, audioUrl, href } = post;
  const isMobile = layout === 'mobile';
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg",
      isMobile ? "max-w-sm" : "w-full"
    )}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Background Image */}
      <Image 
        src="/audio_card_bg.png" 
        alt="Card background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
        width={800}
        height={400}
        priority
      />
      
      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col">
        {/* Top badges */}
        <div className="flex gap-2 mb-4">
          <span className="bg-[#5B91D7] text-white px-4 py-1 rounded-full text-sm font-medium">Listen</span>
          <span className="bg-transparent border border-[#5B91D7] text-[#5B91D7] px-4 py-1 rounded-full text-sm">
            {type === 'music' ? 'Music' : 'Podcast'}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-slate-800 text-xl font-medium mb-2">{title}</h3>
        
        {/* Description */}
        <p className="text-slate-700 mb-6">{description}</p>
        
        {/* Audio progress bar */}
        <div className="w-full bg-[#5B91D7]/20 h-2 rounded-full mb-2 overflow-hidden">
          <div 
            className="bg-[#5B91D7] h-full rounded-full" 
            style={{ width: `${(currentTime / audioDuration) * 100 || 0}%` }}
          ></div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-slate-600 text-sm">{duration}</span>
          
          <div className="flex items-center gap-2">
            {isMobile ? (
              <button 
                onClick={togglePlayPause}
                className="bg-gray-500 rounded-full p-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-white" />
                ) : (
                  <Play className="h-4 w-4 text-white ml-0.5" />
                )}
              </button>
            ) : (
              <>
                <button 
                  onClick={togglePlayPause}
                  className="bg-gray-500 rounded-full p-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white ml-0.5" />
                  )}
                </button>
                <Link href="#" className="ml-2">
                  <Share2 className="h-4 w-4 text-gray-500" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
