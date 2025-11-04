export type ContentType = "read" | "listen" | "watch";

export interface BaseContent {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  published: boolean;
  type: ContentType;
}

export interface ReadContent extends BaseContent {
  type: "read";
  content: string;
  category: string;
  readTime: number; // in minutes
  shortForm: boolean;
}

export interface ListenContent extends BaseContent {
  type: "listen";
  audioUrl: string;
  duration: number; // in seconds
  podcastName?: string;
}

export interface WatchContent extends BaseContent {
  type: "watch";
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
}

export type Content = ReadContent | ListenContent | WatchContent;

export interface SubscriberInfo {
  id: string;
  email: string;
  createdAt: Date;
}
