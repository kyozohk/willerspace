import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export type PostType = 'text' | 'audio' | 'video';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: string; // e.g., "8 min read", "24:03", "4 min video"
  createdAt: Date;
}

export interface NewPost {
    content: string;
    backgroundImageUrl: string;
    audioUrl?: string;
}

// Hardcoded posts for demonstration
const hardcodedPosts: Omit<Post, 'id' | 'createdAt'>[] = [
    {
      type: 'text',
      title: 'Written content card',
      content: 'Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
      tags: ['Read', 'Short form'],
      duration: '4 min read',
    },
    {
      type: 'audio',
      title: 'Track title here',
      content: 'Preview short description and even a download link',
      tags: ['Listen', 'Podcast'],
      duration: '24:03',
      audioUrl: 'https://storage.googleapis.com/willer-dc7ae.appspot.com/audio/sample.mp3',
    },
     {
      type: 'audio',
      title: 'Another track title',
      content: 'This is another audio track with a description.',
      tags: ['Listen', 'Music'],
      duration: '03:15',
      audioUrl: 'https://storage.googleapis.com/willer-dc7ae.appspot.com/audio/sample.mp3',
    },
    {
      type: 'text',
      title: 'Written content card',
      content: 'Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
      tags: ['Read', 'Long form article'],
      imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=2070&auto=format&fit=crop',
      duration: '8 min read',
    },
    {
      type: 'video',
      title: 'Video content here',
      content: 'Preview short description and even a download link',
      tags: ['Watch', 'Short form video'],
      imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop',
      duration: '4 min video',
    },
     {
      type: 'video',
      title: 'Another video content',
      content: 'A stunning visual journey through urban landscapes.',
      tags: ['Watch', 'Featured'],
      imageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1931&auto=format&fit=crop',
      duration: '12 min video',
    },
];


export async function getPosts(): Promise<Post[]> {
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const postSnapshot = await getDocs(q);
    
    let postList = postSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || 'text',
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        imageUrl: data.imageUrl || data.backgroundImageUrl,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        duration: data.duration,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      } as Post;
    });

    if (postList.length === 0) {
        console.log("No posts in Firestore, returning hardcoded posts.");
        const now = new Date();
        const demoPosts = hardcodedPosts.map((p, i) => ({
            ...p,
            id: `hardcoded-${i}`,
            createdAt: new Date(now.getTime() - i * 1000 * 60 * 60 * 24), //
        }));
        return demoPosts;
    }

    return postList;
  } catch (error) {
    console.error("Error fetching posts: ", error);
    const now = new Date();
    return hardcodedPosts.map((p, i) => ({
        ...p,
        id: `hardcoded-${i}`,
        createdAt: new Date(now.getTime() - i * 1000 * 60 * 60 * 24), //
    }));
  }
}

export async function addPost(post: NewPost) {
    try {
        const postsCollection = collection(db, 'posts');
        await addDoc(postsCollection, {
            ...post,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error adding post: ", error);
        throw new Error("Could not save the post.");
    }
}
