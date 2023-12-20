import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAyBuIfbTN68JRMpsVGnKUNuFOTcN1txAY",
  authDomain: "gifsearch-f11a0.firebaseapp.com",
  projectId: "gifsearch-f11a0",
  storageBucket: "gifsearch-f11a0.appspot.com",
  messagingSenderId: "12189364580",
  appId: "1:12189364580:web:fa48a7db52c0b2aa330a71",
  measurementId: "G-9XERNBT2Z4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);