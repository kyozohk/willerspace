import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTOfyrw_dNMWJZmCB6nTAlagd7RhKI2lo",
  authDomain: "willer-dc7ae.firebaseapp.com",
  projectId: "willer-dc7ae",
  storageBucket: "willer-dc7ae.firebasestorage.app",
  messagingSenderId: "571857925081",
  appId: "1:571857925081:web:29f4245ba9059578af1fc8",
  measurementId: "G-66W29JP0Q6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, storage, analytics };
