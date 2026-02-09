import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCjOiLnKJYS4urgsu2W7nnCtxFL5uwLcIA",
  authDomain: "travelbudi.firebaseapp.com",
  projectId: "travelbudi",
  storageBucket: "travelbudi.firebasestorage.app",
  messagingSenderId: "334491242987",
  appId: "1:334491242987:web:8f21e369951ebd1fc949ae",
  measurementId: "G-616R0R2C8H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const STORAGE_BUCKET = firebaseConfig.storageBucket;
export default app;
