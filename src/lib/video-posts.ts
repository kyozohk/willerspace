export type VideoType = 'short' | 'long';

export interface VideoPost {
  id: string;
  title: string;
  description: string;
  type: VideoType;
  duration: string;
  durationInMinutes: number;
  href: string;
  thumbnailUrl: string;
  videoUrl: string;
  downloadUrl?: string;
}

export const videoPosts: VideoPost[] = [
  {
    id: "1",
    title: "Video content here",
    description: "Preview short description and even a download link",
    type: "short",
    duration: "00/00/00",
    durationInMinutes: 4,
    href: "/watch/creative-showcase",
    thumbnailUrl: "/video_example.png",
    videoUrl: "/videos/creative-showcase.mp4",
    downloadUrl: "/download/creative-showcase.mp4"
  },
  {
    id: "2",
    title: "Behind the scenes",
    description: "Preview short description and even a download link",
    type: "short",
    duration: "00/00/00",
    durationInMinutes: 6,
    href: "/watch/behind-the-scenes",
    thumbnailUrl: "/video_example.png",
    videoUrl: "/videos/behind-the-scenes.mp4",
    downloadUrl: "/download/behind-the-scenes.mp4"
  },
  {
    id: "3",
    title: "Full documentary",
    description: "Preview short description and even a download link",
    type: "long",
    duration: "00/00/00",
    durationInMinutes: 45,
    href: "/watch/full-documentary",
    thumbnailUrl: "/video_example.png",
    videoUrl: "/videos/full-documentary.mp4",
    downloadUrl: "/download/full-documentary.mp4"
  }
];

export function getVideoPosts(): VideoPost[] {
  return videoPosts;
}

export function getVideoPostById(id: string): VideoPost | undefined {
  return videoPosts.find(post => post.id === id);
}
