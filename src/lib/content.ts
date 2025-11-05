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
    console.log('Creating audio content with file:', audioFile);
    
    // Generate a safer filename
    const timestamp = Date.now();
    const safeFileName = audioFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `audio/${userId}/${timestamp}_${safeFileName}`;
    
    console.log('Uploading to path:', filePath);
    
    // Upload audio file to Firebase Storage with metadata
    const storageRef = ref(storage, filePath);
    
    // Add content type metadata to help with CORS
    const metadata = {
      contentType: audioFile.type || 'audio/wav',
      customMetadata: {
        'uploaded-by': userId,
        'timestamp': timestamp.toString()
      }
    };
    
    // Upload with metadata
    await uploadBytes(storageRef, audioFile, metadata);
    const audioUrl = await getDownloadURL(storageRef);
    
    console.log('Upload successful, URL:', audioUrl);
    
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
    console.log('Creating video content with file:', videoFile);
    console.log('Thumbnail file:', thumbnailFile);
    
    // Generate safer filenames with timestamps
    const videoTimestamp = Date.now();
    const videoSafeFileName = videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const videoFilePath = `video/${userId}/${videoTimestamp}_${videoSafeFileName}`;
    
    const thumbnailTimestamp = Date.now() + 1; // Ensure unique timestamp
    const thumbnailSafeFileName = thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const thumbnailFilePath = `thumbnails/${userId}/${thumbnailTimestamp}_${thumbnailSafeFileName}`;
    
    console.log('Uploading video to path:', videoFilePath);
    console.log('Uploading thumbnail to path:', thumbnailFilePath);
    
    // Upload video file to Firebase Storage with metadata
    const videoStorageRef = ref(storage, videoFilePath);
    const videoMetadata = {
      contentType: videoFile.type || 'video/webm',
      customMetadata: {
        'uploaded-by': userId,
        'timestamp': videoTimestamp.toString(),
        'duration': duration.toString()
      }
    };
    
    console.log('Starting video upload with metadata:', videoMetadata);
    await uploadBytes(videoStorageRef, videoFile, videoMetadata);
    const videoUrl = await getDownloadURL(videoStorageRef);
    console.log('Video upload successful, URL:', videoUrl);
    
    // Upload thumbnail file to Firebase Storage with metadata
    const thumbnailStorageRef = ref(storage, thumbnailFilePath);
    const thumbnailMetadata = {
      contentType: thumbnailFile.type || 'image/jpeg',
      customMetadata: {
        'uploaded-by': userId,
        'timestamp': thumbnailTimestamp.toString(),
        'for-video': videoFilePath
      }
    };
    
    console.log('Starting thumbnail upload with metadata:', thumbnailMetadata);
    await uploadBytes(thumbnailStorageRef, thumbnailFile, thumbnailMetadata);
    const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);
    console.log('Thumbnail upload successful, URL:', thumbnailUrl);
    
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
