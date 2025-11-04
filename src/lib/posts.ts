import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, query, orderBy, Timestamp, where } from 'firebase/firestore';

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
    videoUrl?: string;
}

// Hardcoded posts for demonstration
const hardcodedPosts: Omit<Post, 'id' | 'createdAt'>[] = [
    {
      type: 'text',
      title: 'Written content card',
      content: 'Lorem ipsum det, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
      tags: ['Read', 'Short form'],
      duration: '4 min read',
      imageUrl: '/Read short - desktop.png',
    },
    {
      type: 'audio',
      title: 'Track title here',
      content: 'Preview short description and even a download link',
      tags: ['Listen', 'Podcast'],
      duration: '24:03',
      audioUrl: 'https://storage.googleapis.com/willer-dc7ae.appspot.com/audio/sample.mp3',
      imageUrl: '/Listen music - desktop.png',
    },
     {
      type: 'audio',
      title: 'Another track title',
      content: 'This is another audio track with a description.',
      tags: ['Listen', 'Music'],
      duration: '03:15',
      audioUrl: 'https://storage.googleapis.com/willer-dc7ae.appspot.com/audio/sample.mp3',
      imageUrl: '/Listen music - desktop.png',
    },
    {
      type: 'video',
      title: 'Video content here',
      content: 'Preview short description and even a download link',
      tags: ['Watch', 'Short form video'],
      imageUrl: '/Video card - Single hero image - desktop.png',
      duration: '4 min video',
    },
     {
      type: 'video',
      title: 'Another video content',
      content: 'A stunning visual journey through urban landscapes.',
      tags: ['Watch', 'Featured'],
      imageUrl: '/Photo card - Inage fill.png',
      duration: '12 min video',
    },
];


export async function getPosts(type?: PostType): Promise<Post[]> {
  try {
    const postsCollection = collection(db, 'posts');
    let q;
    
    if (type) {
      q = query(postsCollection, where('type', '==', type), orderBy('createdAt', 'desc'));
    } else {
      q = query(postsCollection, orderBy('createdAt', 'desc'));
    }
    
    const postSnapshot = await getDocs(q);
    
    let postList = postSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || (data.audioUrl ? 'audio' : (data.videoUrl ? 'video' : 'text')),
        title: data.title || "A new post",
        content: data.content,
        tags: data.tags || ['Read'],
        imageUrl: data.imageUrl || data.backgroundImageUrl,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        duration: data.duration || "5 min read",
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      } as Post;
    });

    if (postList.length === 0) {
        console.log("No posts in Firestore, returning hardcoded posts.");
        const now = new Date();
        const demoPosts = hardcodedPosts.map((p, i) => ({
            ...p,
            id: `hardcoded-${i}`,
            createdAt: new Date(now.getTime() - i * 1000 * 60 * 60 * 24),
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
        createdAt: new Date(now.getTime() - i * 1000 * 60 * 60 * 24),
    }));
  }
}

export async function addPost(post: NewPost) {
    try {
        const postsCollection = collection(db, 'posts');
        const newPost: Partial<Post> = {
            content: post.content,
            imageUrl: post.backgroundImageUrl,
            createdAt: new Date(),
            type: post.audioUrl ? 'audio' : (post.videoUrl ? 'video' : 'text'),
            title: post.content.substring(0, 30) + '...',
            tags: post.audioUrl ? ['Listen'] : (post.videoUrl ? ['Watch'] : ['Read']),
            duration: post.audioUrl || post.videoUrl ? '0:00' : '3 min read',
        }

        if (post.audioUrl) {
            newPost.audioUrl = post.audioUrl;
        }
        
        if (post.videoUrl) {
            newPost.videoUrl = post.videoUrl;
        }

        await addDoc(postsCollection, {
            ...newPost,
            createdAt: Timestamp.fromDate(newPost.createdAt as Date),
        });
    } catch (error) {
        console.error("Error adding post: ", error);
        throw new Error("Could not save the post.");
    }
}
