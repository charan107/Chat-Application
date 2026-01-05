import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATczWeLl3AiEOYt9RA-VCc1QNvE6bvnmA",
  authDomain: "cognitive-messenger.firebaseapp.com",
  projectId: "cognitive-messenger",
  storageBucket: "cognitive-messenger.firebasestorage.app",
  messagingSenderId: "210610465048",
  appId: "1:210610465048:web:cb21885c7d489e9157d66d",
  measurementId: "G-3Y1XGT1SYG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
