import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

// Initialize Storage with CORS settings
const storage = getStorage(app);

// If in development environment, use Storage emulator to avoid CORS issues
if (process.env.NODE_ENV === 'development') {
  try {
    // This will only run in development mode
    console.log('Using Firebase Storage emulator for development');
    // Uncomment the line below if you have a local emulator running
    // connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.error('Error connecting to Storage emulator:', error);
  }
}

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, storage, analytics };
