// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXgTOks5QD463exz236alExHuZVVbvIvE",
  authDomain: "micomidafavorita-5ee4e.firebaseapp.com",
  projectId: "micomidafavorita-5ee4e",
  storageBucket: "micomidafavorita-5ee4e.appspot.com",
  messagingSenderId: "876756927156",
  appId: "1:876756927156:web:6f87a9aa64c4c3d9ca0de1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export other Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);