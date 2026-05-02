import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB1iOhXrl35K6K-dEaDjlllaFrw8gszcsg",
  authDomain: "messenger-app-c4a06.firebaseapp.com",
  projectId: "messenger-app-c4a06",
  storageBucket: "messenger-app-c4a06.firebasestorage.app",
  messagingSenderId: "150950836076",
  appId: "1:150950836076:web:ac16bc251ee87c2ddee549",
  measurementId: "G-9QK8YTJ8N0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
