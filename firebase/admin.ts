import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    try {
      console.log("Initializing Firebase Admin SDK");
      
      // Make sure the private key is properly formatted
      const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;
      
      console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
      console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
      console.log("Private Key defined:", !!privateKey);
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      
      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw error; // Re-throw to make initialization failures more visible
    }
  } else {
    console.log("Firebase Admin SDK already initialized");
  }

  const auth = getAuth();
  const db = getFirestore();
  
  return { auth, db };
}

export const { auth, db } = initFirebaseAdmin();