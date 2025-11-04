import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type Post } from '@/lib/posts-data';

type TextCardProps = {
  post: Post;
  layout?: 'mobile' | 'desktop';
};

export function TextCard({ post, layout = 'desktop' }: TextCardProps) {
  const { title, content, type, format, date, readTime, href, imageUrl } = post;
  const isImageFormat = format === 'image-text';
  const isShortForm = type === 'short';
  const isMobile = layout === 'mobile';
  
  // Determine badge text based on type
  const typeBadgeText = isShortForm ? 'Short form' : 'Long form article';
  
  // For image + text format with mobile layout
  if (isImageFormat && isMobile) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        {/* Image */}
        <div className="relative h-64">
          <Image 
            src={imageUrl || '/text_image_example.png'} 
            alt={title} 
            className="object-cover"
            fill
            priority
          />
        </div>
        
        {/* Content with background */}
        <div className="relative overflow-hidden">
          <Image 
            src="/text_card_bg.png" 
            alt="Card background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
            width={800}
            height={400}
          />
          
          <div className="relative z-10 p-6 flex flex-col">
            {/* Top badges */}
            <div className="flex gap-2 mb-4">
              <span className="bg-[#C170CF] text-white px-4 py-1 rounded-full text-sm font-medium">Read</span>
              <span className="bg-transparent border border-[#C170CF] text-[#C170CF] px-4 py-1 rounded-full text-sm">{typeBadgeText}</span>
            </div>
            
            {/* Title */}
            <h3 className="text-slate-800 text-xl font-medium mb-3">{title}</h3>
            
            {/* Content */}
            <p className="text-slate-700 mb-6 line-clamp-4">{content}</p>
            
            {/* Footer */}
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">{date} • {readTime}</span>              
              <Link href={href} className="flex items-center gap-2">
                <span className="text-slate-700 font-medium text-base">READ</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#666876]">
                  <ArrowRight className="h-5 w-5 text-white" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // For image + text format with desktop layout
  if (isImageFormat && !isMobile) {
    return (
      <div className="relative overflow-hidden rounded-lg flex">
        {/* Image (left side) */}
        <div className="relative w-1/2">
          <Image 
            src={imageUrl || '/text_image_example.png'} 
            alt={title} 
            className="object-cover"
            fill
            priority
          />
        </div>
        
        {/* Content with background (right side) */}
        <div className="relative w-1/2 overflow-hidden">
          <Image 
            src="/text_card_bg.png" 
            alt="Card background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
            width={800}
            height={400}
          />
          
          <div className="relative z-10 p-6 flex flex-col h-full">
            {/* Top badges */}
            <div className="flex gap-2 mb-4">
              <span className="bg-[#C170CF] text-white px-4 py-1 rounded-full text-sm font-medium">Read</span>
              <span className="bg-transparent border border-[#C170CF] text-[#C170CF] px-4 py-1 rounded-full text-sm">{typeBadgeText}</span>
            </div>
            
            {/* Title */}
            <h3 className="text-slate-800 text-2xl font-medium mb-3">{title}</h3>
            
            {/* Content */}
            <p className="text-slate-700 mb-8 flex-grow">{content}</p>
            
            {/* Footer */}
            <div className="flex justify-between items-center mt-auto">
              <span className="text-slate-600 text-sm">{date} • {readTime}</span>
              
              <Link href={href} className="flex items-center gap-1">
                <div className="flex items-center bg-gray-500 rounded-full py-1.5 px-4">
                  <span className="text-white font-medium mr-2">READ</span>
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
  
  // Standard text card (for both mobile and desktop)
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg",
      isMobile ? "max-w-xs" : "w-full"
    )}>
      {/* Background Image */}
      <Image 
        src="/text_card_bg.png" 
        alt="Card background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
        width={800}
        height={400}
        priority
      />
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Top badges */}
        <div className="flex gap-2 mb-4">
          <span className="bg-[#C170CF] text-white px-4 py-1 rounded-full text-sm font-medium">Read</span>
          <span className="bg-transparent border border-[#C170CF] text-[#C170CF] px-4 py-1 rounded-full text-sm">{typeBadgeText}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-slate-800 text-2xl font-medium mb-3">{title}</h3>
        
        {/* Content */}
        <p className="text-slate-700 mb-8 flex-grow">{content}</p>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-auto">
          <span className="text-slate-600 text-sm">{date} • {readTime}</span>
          
          <Link href={href} className="flex items-center gap-1">
            <div className="flex items-center bg-gray-500 rounded-full py-1.5 px-4">
              <span className="text-white font-medium mr-2">READ</span>
              <div className="rounded-full">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
