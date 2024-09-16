import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDbw11U5ix7qSzwT4VxX_7YNID3xaaWmHA",
  authDomain: "fremontyc.firebaseapp.com",
  projectId: "fremontyc",
  storageBucket: "fremontyc.appspot.com",
  messagingSenderId: "295938461539",
  appId: "1:295938461539:web:97f09b7e83bdbccc0a0d56",
  measurementId: "G-RQ5BHE8WSX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
