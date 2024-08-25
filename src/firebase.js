import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCVBNMcvnVE-45H-dWIayRjZcxf9vMQhYY",
  authDomain: "story-rpg-7f672.firebaseapp.com",
  projectId: "story-rpg-7f672",
  storageBucket: "story-rpg-7f672.appspot.com",
  messagingSenderId: "349930984245",
  appId: "1:349930984245:web:3c1c5f952c45b97289f27c",
  measurementId: "G-Y702DW5JND",
};

// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, app, db, functions };
