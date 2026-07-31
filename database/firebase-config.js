/* ==========================================
   PAPPRITO HRIS
   FIREBASE CONFIG
========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";
/* ==========================================
   FIREBASE CONFIGURATION
========================================== */

const firebaseConfig = {

    apiKey: "AIzaSyAehoq0teVYHiJ4bkKOgBqIgJZrQpce3k8",

    authDomain: "hr-system-38fc3.firebaseapp.com",

    projectId: "hr-system-38fc3",

    storageBucket: "hr-system-38fc3.firebasestorage.app",

    messagingSenderId: "615471610834",

    appId: "1:615471610834:web:a0d671d4e3f4c1b57b660b"

};

/* ==========================================
   INITIALIZE FIREBASE
========================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);
/* ==========================================
   EXPORT
========================================== */

export {

    app,

    auth,

    db,

    storage

};
