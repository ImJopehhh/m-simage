// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCx_JA976UZt59iQ3AE-AwZten95r_rVU",
  authDomain: "simage-179b7.firebaseapp.com",
  projectId: "simage-179b7",
  storageBucket: "simage-179b7.firebasestorage.app",
  messagingSenderId: "443225663990",
  appId: "1:443225663990:web:0d5f2f47724c7688fd7fd7"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = app.database();
const auth = app.auth(); // Untuk kebutuhan Admin Login

export { database, auth };
