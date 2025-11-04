import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/types/user";

// Get user by handle
export const getUserByHandle = async (handle: string): Promise<UserProfile | null> => {
  try {
    // First check if the handle exists
    const handleDoc = await getDoc(doc(db, "handles", handle));
    
    if (!handleDoc.exists()) {
      return null;
    }
    
    const uid = handleDoc.data().uid;
    
    // Get the user profile
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    return {
      ...userData,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate()
    } as UserProfile;
  } catch (error) {
    console.error("Error getting user by handle:", error);
    throw error;
  }
};

// Search users by name or handle
export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    // Search is case insensitive
    const searchTermLower = searchTerm.toLowerCase();
    
    // Query users collection
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    // Filter users manually (Firestore doesn't support case-insensitive search directly)
    const matchingUsers = usersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as UserProfile;
      })
      .filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const handle = user.handle?.toLowerCase() || "";
        
        return fullName.includes(searchTermLower) || 
               handle.includes(searchTermLower);
      });
    
    return matchingUsers;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Get multiple users by UIDs
export const getUsersByIds = async (uids: string[]): Promise<UserProfile[]> => {
  try {
    if (uids.length === 0) return [];
    
    const users: UserProfile[] = [];
    
    // Firestore doesn't support 'in' queries on document references,
    // so we need to fetch each user individually
    for (const uid of uids) {
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        users.push({
          ...userData,
          createdAt: userData.createdAt.toDate(),
          updatedAt: userData.updatedAt.toDate()
        } as UserProfile);
      }
    }
    
    return users;
  } catch (error) {
    console.error("Error getting users by IDs:", error);
    throw error;
  }
};
