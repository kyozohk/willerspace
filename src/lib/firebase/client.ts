import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics
if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported) {
            getAnalytics(app);
        }
    });
}


export { app, db, storage, auth };
