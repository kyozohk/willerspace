import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User
} from "firebase/auth";
import { auth, db } from "./firebase";
import { useState, useEffect } from "react";
import React from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { UserProfile } from "../types/user";
import { useRouter } from "next/navigation";

// Sign up with email and password
export const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      handle: null, // Will be set later
      photoURL: null,
      bio: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Update display name in Firebase Auth
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user profile exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create new user profile
      const names = user.displayName?.split(" ") || ["", ""];
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        handle: null, // Will be set later
        photoURL: user.photoURL,
        bio: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
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
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Update user handle
export const updateUserHandle = async (uid: string, handle: string, skipExistenceCheck: boolean = false): Promise<void> => {
  try {
    // Check if handle is already taken (unless we're skipping this check)
    if (!skipExistenceCheck) {
      const handleExists = await checkHandleExists(handle);
      if (handleExists) {
        throw new Error(`Handle @${handle} is already taken`);
      }
    }
    
    // Update user profile
    await setDoc(doc(db, "users", uid), {
      handle,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating user handle:", error);
    throw error;
  }
};

// Check if handle exists
export const checkHandleExists = async (handle: string): Promise<boolean> => {
  try {
    // First check in the handles collection (for quick lookups)
    const handleDoc = await getDoc(doc(db, "handles", handle));
    return handleDoc.exists();
  } catch (error) {
    console.error("Error checking handle existence:", error);
    throw error;
  }
};

// Reserve handle
export const reserveHandle = async (uid: string, handle: string): Promise<void> => {
  try {
    await setDoc(doc(db, "handles", handle), {
      uid,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error reserving handle:", error);
    throw error;
  }
};

// Custom hook to get the current user and profile
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
          
          // If user doesn't have a handle, redirect to handle setup
          if (userProfile && !userProfile.handle && !window.location.pathname.includes('/setup-handle')) {
            router.push('/setup-handle');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  return { user, profile, loading };
};

// Check if the user is an admin (will@kyozo.com)
export const isAdmin = (user: User | null): boolean => {
  return user?.email === "will@kyozo.com";
};

// Check if the user is the owner of a handle
export const isHandleOwner = async (uid: string | null, handle: string): Promise<boolean> => {
  if (!uid) return false;
  
  try {
    const handleDoc = await getDoc(doc(db, "handles", handle));
    if (!handleDoc.exists()) return false;
    
    return handleDoc.data().uid === uid;
  } catch (error) {
    console.error("Error checking handle ownership:", error);
    return false;
  }
};

// Auth context provider
export const withAuth = (Component: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return React.createElement("div", null, "Loading...");
    }
    
    return React.createElement(Component, { ...props, user });
  };
};
