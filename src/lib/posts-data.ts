export type PostType = 'short' | 'long';
export type PostFormat = 'text' | 'image-text';
export type PostLayout = 'mobile' | 'desktop';

export interface Post {
  id: string;
  title: string;
  content: string;
  type: PostType;
  format: PostFormat;
  date: string;
  readTime: string;
  href: string;
  imageUrl?: string;
}

export const posts: Post[] = [
  {
    id: "1",
    title: "Written content card",
    content: "Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, conse eiusmod tempor incidid, Lorem ipsum dolor sit amet Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    type: "short",
    format: "text",
    date: "00/00/00",
    readTime: "8 min read",
    href: "/read/short-form-1"
  },
  {
    id: "2",
    title: "Written content card",
    content: "Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, conse eiusmod tempor incidid, Lorem ipsum dolor sit amet Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    type: "long",
    format: "text",
    date: "00/00/00",
    readTime: "8 min read",
    href: "/read/long-form-1"
  },
  {
    id: "3",
    title: "Written content card",
    content: "Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, conse eiusmod tempor incidid, Lorem ipsum dolor sit amet Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    type: "long",
    format: "image-text",
    date: "00/00/00",
    readTime: "8 min read",
    href: "/read/image-post-1",
    imageUrl: "/text_image_example.png"
  }
];

export function getPosts(): Post[] {
  return posts;
}

export function getPostById(id: string): Post | undefined {
  return posts.find(post => post.id === id);
}
