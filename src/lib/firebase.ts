import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    databaseURL: "https://techfusion-930cf-default-rtdb.firebaseio.com"
};

// Singleton storage to prevent multiple initializations across HMR
let app: FirebaseApp;
let db: Firestore;
let realtimeDb: Database;
let auth: Auth;

const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

if (isConfigValid) {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }

    // Initialize services only once
    db = getFirestore(app);
    realtimeDb = getDatabase(app);
    auth = getAuth(app);
} else {
    // These will be undefined but exported as placeholders
    console.warn("Firebase configuration is missing. Web app is running in SIMULATION MODE.");
}

export { app, db, realtimeDb, auth };
