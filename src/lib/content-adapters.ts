import { Content, ReadContent, ListenContent, WatchContent } from "@/types/content";
import { Post as ComponentPost, PostType, PostFormat } from "@/lib/posts-data";
import { AudioPost as ComponentAudioPost, AudioType } from "@/lib/audio-posts";
import { VideoPost as ComponentVideoPost, VideoType } from "@/lib/video-posts";

// Re-export the component types for convenience
export type Post = ComponentPost;
export type AudioPost = ComponentAudioPost;
export type VideoPost = ComponentVideoPost;

// Format date for display
const formatDate = (date: Date | null): string => {
  if (!date) return '00/00/00';
  return date.toLocaleDateString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
};

// Convert ReadContent to Post
export const adaptReadContent = (content: ReadContent, handle: string): Post => {
  return {
    id: content.id,
    title: content.title,
    content: content.description, // Use description as preview content
    type: content.readTime > 5 ? 'long' : 'short', // Determine type based on read time
    format: 'text', // Default to text format
    date: formatDate(content.publishedAt || content.createdAt),
    readTime: `${content.readTime} min read`,  // Convert number to string format
    href: `/${handle}/post/${content.id}`
  };
};

// Convert ListenContent to AudioPost
export const adaptListenContent = (content: ListenContent, handle: string): AudioPost => {
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    type: content.podcastName ? 'podcast' : 'music', // Determine type based on podcastName
    duration: formatDuration(content.duration),
    durationInSeconds: content.duration,
    audioUrl: content.audioUrl,
    href: `/${handle}/audio/${content.id}`
  };
};

// Convert WatchContent to VideoPost
export const adaptWatchContent = (content: WatchContent, handle: string): VideoPost => {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    type: 'short', // Default to short video type
    duration: '00/00/00', // Default duration format
    durationInMinutes: Math.ceil(content.duration / 60), // Duration in minutes
    videoUrl: content.videoUrl,
    thumbnailUrl: content.thumbnailUrl,
    href: `/${handle}/video/${content.id}`
  };
};

// Adapt any content type to the appropriate component props
export const adaptContent = (content: Content, handle: string): Post | AudioPost | VideoPost => {
  switch (content.type) {
    case 'read':
      return adaptReadContent(content as ReadContent, handle);
    case 'listen':
      return adaptListenContent(content as ListenContent, handle);
    case 'watch':
      return adaptWatchContent(content as WatchContent, handle);
    default:
      throw new Error(`Unknown content type: ${(content as any).type}`);
  }
};
