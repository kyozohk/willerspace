import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { Content, ReadContent, ListenContent, WatchContent } from "@/types/content";

// Get content by user ID
export const getUserContent = async (userId: string): Promise<Content[]> => {
  try {
    const contentRef = collection(db, "content");
    const q = query(
      contentRef,
      where("userId", "==", userId),
      where("published", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        publishedAt: data.publishedAt?.toDate() || null
      } as Content;
    });
  } catch (error) {
    console.error("Error getting user content:", error);
    throw error;
  }
};

// Get content by ID
export const getContentById = async (contentId: string): Promise<Content | null> => {
  try {
    const contentDoc = await getDoc(doc(db, "content", contentId));
    
    if (!contentDoc.exists()) {
      return null;
    }
    
    const data = contentDoc.data();
    return {
      ...data,
      id: contentDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      publishedAt: data.publishedAt?.toDate() || null
    } as Content;
  } catch (error) {
    console.error("Error getting content by ID:", error);
    throw error;
  }
};

// Create text content
export const createTextContent = async (
  userId: string,
  title: string,
  description: string = "",
  content: string,
  category: string,
  readTime: number,
  published: boolean = true
): Promise<string> => {
  try {
    const now = Timestamp.now();
    
    const contentData: Omit<ReadContent, "id"> = {
      type: "read",
      userId,
      title,
      description,
      content,
      category,
      readTime,
      shortForm: readTime < 5, // Less than 5 minutes is short form
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      publishedAt: published ? now.toDate() : null,
      published
    };
    
    const docRef = await addDoc(collection(db, "content"), contentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating text content:", error);
    throw error;
  }
};

// Create audio content
export const createAudioContent = async (
  userId: string,
  title: string,
  description: string = "",
  audioFile: File,
  duration: number,
  podcastName?: string,
  published: boolean = true
): Promise<string> => {
  try {
    // Upload audio file to Firebase Storage
    const storageRef = ref(storage, `audio/${userId}/${Date.now()}_${audioFile.name}`);
    await uploadBytes(storageRef, audioFile);
    const audioUrl = await getDownloadURL(storageRef);
    
    const now = Timestamp.now();
    
    const contentData: Omit<ListenContent, "id"> = {
      type: "listen",
      userId,
      title,
      description,
      audioUrl,
      duration,
      podcastName,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      publishedAt: published ? now.toDate() : null,
      published
    };
    
    const docRef = await addDoc(collection(db, "content"), contentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating audio content:", error);
    throw error;
  }
};

// Create video content
export const createVideoContent = async (
  userId: string,
  title: string,
  description: string = "",
  videoFile: File,
  thumbnailFile: File,
  duration: number,
  published: boolean = true
): Promise<string> => {
  try {
    // Upload video file to Firebase Storage
    const videoStorageRef = ref(storage, `video/${userId}/${Date.now()}_${videoFile.name}`);
    await uploadBytes(videoStorageRef, videoFile);
    const videoUrl = await getDownloadURL(videoStorageRef);
    
    // Upload thumbnail file to Firebase Storage
    const thumbnailStorageRef = ref(storage, `thumbnails/${userId}/${Date.now()}_${thumbnailFile.name}`);
    await uploadBytes(thumbnailStorageRef, thumbnailFile);
    const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);
    
    const now = Timestamp.now();
    
    const contentData: Omit<WatchContent, "id"> = {
      type: "watch",
      userId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      publishedAt: published ? now.toDate() : null,
      published
    };
    
    const docRef = await addDoc(collection(db, "content"), contentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating video content:", error);
    throw error;
  }
};

// Update content
export const updateContent = async (contentId: string, updates: Partial<Content>): Promise<void> => {
  try {
    const contentRef = doc(db, "content", contentId);
    
    // If publishing for the first time, set publishedAt
    let updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    if (updates.published && !(await getContentById(contentId))?.publishedAt) {
      updateData.publishedAt = Timestamp.now();
    }
    
    await updateDoc(contentRef, updateData);
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

// Delete content
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    const content = await getContentById(contentId);
    
    if (!content) {
      throw new Error("Content not found");
    }
    
    // Delete associated files from storage if needed
    if (content.type === "listen") {
      const audioContent = content as ListenContent;
      const audioRef = ref(storage, audioContent.audioUrl);
      await deleteObject(audioRef);
    } else if (content.type === "watch") {
      const videoContent = content as WatchContent;
      const videoRef = ref(storage, videoContent.videoUrl);
      const thumbnailRef = ref(storage, videoContent.thumbnailUrl);
      await deleteObject(videoRef);
      await deleteObject(thumbnailRef);
    }
    
    // Delete the content document
    await deleteDoc(doc(db, "content", contentId));
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};
