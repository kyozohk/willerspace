import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { BaseContent, Content, ContentType, ReadContent, ListenContent, WatchContent, SubscriberInfo } from "../types/content";

// Collections
const CONTENT_COLLECTION = "content";
const SUBSCRIBERS_COLLECTION = "subscribers";

// Helper function to convert Firestore data to our Content types
const convertFirestoreData = (doc: DocumentData): Content => {
  const data = doc.data();
  const baseContent: BaseContent = {
    id: doc.id,
    title: data.title,
    description: data.description,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    publishedAt: data.publishedAt?.toDate(),
    published: data.published,
    type: data.type as ContentType,
  };

  switch (data.type) {
    case "read":
      return {
        ...baseContent,
        content: data.content,
        category: data.category,
        readTime: data.readTime,
        shortForm: data.shortForm,
      } as ReadContent;
    case "listen":
      return {
        ...baseContent,
        audioUrl: data.audioUrl,
        duration: data.duration,
        podcastName: data.podcastName,
      } as ListenContent;
    case "watch":
      return {
        ...baseContent,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
      } as WatchContent;
    default:
      throw new Error(`Unknown content type: ${data.type}`);
  }
};

// Content operations
export const addContent = async (content: Omit<Content, "id">): Promise<string> => {
  const now = Timestamp.now();
  const contentData = {
    ...content,
    createdAt: now,
    updatedAt: now,
    publishedAt: content.published ? now : null,
  };
  
  const docRef = await addDoc(collection(db, CONTENT_COLLECTION), contentData);
  return docRef.id;
};

export const updateContent = async (id: string, content: Partial<Content>): Promise<void> => {
  const contentRef = doc(db, CONTENT_COLLECTION, id);
  await updateDoc(contentRef, {
    ...content,
    updatedAt: Timestamp.now(),
    publishedAt: content.published ? Timestamp.now() : null,
  });
};

export const deleteContent = async (id: string): Promise<void> => {
  const contentRef = doc(db, CONTENT_COLLECTION, id);
  await deleteDoc(contentRef);
};

export const getContent = async (id: string): Promise<Content | null> => {
  const contentRef = doc(db, CONTENT_COLLECTION, id);
  const contentSnap = await getDoc(contentRef);
  
  if (!contentSnap.exists()) {
    return null;
  }
  
  return convertFirestoreData(contentSnap);
};

export const getAllContent = async (contentType?: ContentType, publishedOnly = true): Promise<Content[]> => {
  let contentQuery = collection(db, CONTENT_COLLECTION);
  
  const constraints = [];
  
  if (contentType) {
    constraints.push(where("type", "==", contentType));
  }
  
  if (publishedOnly) {
    constraints.push(where("published", "==", true));
  }
  
  constraints.push(orderBy("publishedAt", "desc"));
  
  const q = query(contentQuery, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(convertFirestoreData);
};

export const getLatestContent = async (contentType?: ContentType, count = 5): Promise<Content[]> => {
  let contentQuery = collection(db, CONTENT_COLLECTION);
  
  const constraints = [
    where("published", "==", true),
    orderBy("publishedAt", "desc"),
    limit(count)
  ];
  
  if (contentType) {
    constraints.unshift(where("type", "==", contentType));
  }
  
  const q = query(contentQuery, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(convertFirestoreData);
};

// Subscriber operations
export const addSubscriber = async (email: string): Promise<string> => {
  const subscriberData = {
    email,
    createdAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), subscriberData);
  return docRef.id;
};

export const getSubscribers = async (): Promise<SubscriberInfo[]> => {
  const subscribersQuery = query(collection(db, SUBSCRIBERS_COLLECTION), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(subscribersQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    email: doc.data().email,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

export const checkSubscriberExists = async (email: string): Promise<boolean> => {
  const subscribersQuery = query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email));
  const querySnapshot = await getDocs(subscribersQuery);
  
  return !querySnapshot.empty;
};
