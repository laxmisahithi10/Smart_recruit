// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQXbz-Sep3V4bhCW5IQcDn3Y1tXPcA3o4",
  authDomain: "smart-recruit-a7609.firebaseapp.com",
  projectId: "smart-recruit-a7609",
  storageBucket: "smart-recruit-a7609.firebasestorage.app",
  messagingSenderId: "494923652226",
  appId: "1:494923652226:web:07fa3444265eb52e29a89b",
  measurementId: "G-31H65HJJT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);