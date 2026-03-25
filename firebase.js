// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChuFohCLVS6SCgs7NxNh35F-bC1PY0WnE",
  authDomain: "swayam-82994.firebaseapp.com",
  projectId: "swayam-82994",
  storageBucket: "swayam-82994.firebasestorage.app",
  messagingSenderId: "897141966103",
  appId: "1:897141966103:web:7ee9d3cd565d5b0415e352"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export
export { auth, db }