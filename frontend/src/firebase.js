import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2OWZTbVcGeRevy9cgWBxTwYDtzwI1D4M",
  authDomain: "athx-security.firebaseapp.com",
  projectId: "athx-security",
  storageBucket: "athx-security.firebasestorage.app",
  messagingSenderId: "401368027515",
  appId: "1:401368027515:web:3a8bff321220b29b026dde",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;