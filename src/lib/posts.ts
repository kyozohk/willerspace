import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  content: string;
  backgroundImageUrl: string;
  audioUrl?: string;
  createdAt: Date;
}

export interface NewPost {
    content: string;
    backgroundImageUrl: string;
    audioUrl?: string;
}

export async function getPosts(): Promise<Post[]> {
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const postSnapshot = await getDocs(q);
    const postList = postSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        backgroundImageUrl: data.backgroundImageUrl,
        audioUrl: data.audioUrl,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Post;
    });
    return postList;
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return [];
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
