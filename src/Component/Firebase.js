import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyClesig_B6lGWi45UhTSLm5pF1ivQLJ1eE",
  authDomain: "react-login-cdc29.firebaseapp.com",
  projectId: "react-login-cdc29",
  storageBucket: "react-login-cdc29.firebasestorage.app",
  messagingSenderId: "559748473642",
  appId: "1:559748473642:web:9f7d1d64845f994fdcb453"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);

