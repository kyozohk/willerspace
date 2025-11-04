import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type VideoPost } from '@/lib/video-posts';

type VideoCardProps = {
  post: VideoPost;
  layout?: 'mobile' | 'desktop';
};

export function VideoCard({ post, layout = 'desktop' }: VideoCardProps) {
  const { title, description, type, duration, durationInMinutes, href, thumbnailUrl } = post;
  const isMobile = layout === 'mobile';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg",
      isMobile ? "max-w-sm" : "w-full"
    )}>
      {/* Thumbnail Image */}
      <div className="relative aspect-video">
        <Image 
          src={thumbnailUrl || '/video_example.png'}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>
      
      {/* Content with background */}
      <div className="relative overflow-hidden">
        <Image 
          src="/video_card_bg.png" 
          alt="Card background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          width={800}
          height={400}
        />
        
        <div className="relative z-10 p-6 flex flex-col">
          {/* Top badges */}
          <div className="flex gap-2 mb-4">
            <span className="bg-[#FFB619] text-white px-4 py-1 rounded-full text-sm font-medium">Watch</span>
            <span className="bg-transparent border border-[#FFB619] text-[#FFB619] px-4 py-1 rounded-full text-sm">
              {type === 'short' ? 'Short form video' : 'Long form video'}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-slate-800 text-xl font-medium mb-2">{title}</h3>
          
          {/* Description */}
          <p className="text-slate-700 mb-6">{description}</p>
          
          {/* Footer */}
          <div className="flex justify-between items-center mt-auto">
            <span className="text-slate-600 text-sm">{duration} • {durationInMinutes} min video</span>
            
            <Link href={href} className="flex items-center gap-1">
              <div className="flex items-center bg-gray-500 rounded-full py-1.5 px-4">
                <span className="text-white font-medium mr-2">WATCH</span>
                <div className="rounded-full">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}