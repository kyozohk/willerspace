export type AudioType = 'music' | 'podcast';

export interface AudioPost {
  id: string;
  title: string;
  description: string;
  type: AudioType;
  duration: string;
  durationInSeconds: number;
  href: string;
  audioUrl: string;
  downloadUrl?: string;
}

export const audioPosts: AudioPost[] = [
  {
    id: "1",
    title: "Ambient Reflections",
    description: "Preview short description and even a download link",
    type: "music",
    duration: "01:04:47",
    durationInSeconds: 3887,
    href: "/listen/ambient-reflections",
    audioUrl: "/audio/ambient-reflections.mp3",
    downloadUrl: "/download/ambient-reflections.mp3"
  },
  {
    id: "2",
    title: "Creative Process Discussion",
    description: "Preview short description and even a download link",
    type: "podcast",
    duration: "01:04:57",
    durationInSeconds: 3897,
    href: "/listen/creative-process-podcast",
    audioUrl: "/audio/creative-process-podcast.mp3",
    downloadUrl: "/download/creative-process-podcast.mp3"
  },
  {
    id: "3",
    title: "Midnight Sonata",
    description: "Preview short description and even a download link",
    type: "music",
    duration: "00:06:57",
    durationInSeconds: 417,
    href: "/listen/midnight-sonata",
    audioUrl: "/audio/midnight-sonata.mp3",
    downloadUrl: "/download/midnight-sonata.mp3"
  },
  {
    id: "4",
    title: "Design Thinking Episode 12",
    description: "Preview short description and even a download link",
    type: "podcast",
    duration: "00:45:21",
    durationInSeconds: 2721,
    href: "/listen/design-thinking-ep12",
    audioUrl: "/audio/design-thinking-ep12.mp3",
    downloadUrl: "/download/design-thinking-ep12.mp3"
  }
];

export function getAudioPosts(): AudioPost[] {
  return audioPosts;
}

export function getAudioPostById(id: string): AudioPost | undefined {
  return audioPosts.find(post => post.id === id);
}
