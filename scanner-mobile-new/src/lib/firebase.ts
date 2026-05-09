import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5cei3yHomoAd83CKcR2tWZD2-eCR0aG8",
  authDomain: "scoutprogram-1ed29.firebaseapp.com",
  projectId: "scoutprogram-1ed29",
  storageBucket: "scoutprogram-1ed29.firebasestorage.app",
  messagingSenderId: "991586377103",
  appId: "1:991586377103:web:317f6982a3c5d4d8367ffa",
  measurementId: "G-02QNR36348"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
