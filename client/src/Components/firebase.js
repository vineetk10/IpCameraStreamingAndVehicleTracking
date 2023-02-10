// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT8_KKgdTKs3pyAPp_bG3ROU06DfveVj0",
  authDomain: "multicameraobjecttracking.firebaseapp.com",
  projectId: "multicameraobjecttracking",
  storageBucket: "multicameraobjecttracking.appspot.com",
  messagingSenderId: "9961666440",
  appId: "1:9961666440:web:aacf0acfcd4216350d2c3d",
  measurementId: "G-6T8T26LGKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);