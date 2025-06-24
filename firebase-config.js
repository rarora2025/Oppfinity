// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBV26J38YjHJp22CZ84DhGa554GouqShEQ",
    authDomain: "oppfinity-3446d.firebaseapp.com",
    projectId: "oppfinity-3446d",
    storageBucket: "oppfinity-3446d.firebasestorage.app",
    messagingSenderId: "224970889092",
    appId: "1:224970889092:web:dc1f411ef625cc0688afd1",
    measurementId: "G-8Y9DF7X3GD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Firebase Firestore
const db = firebase.firestore();
window.db = db; // Export db for use in other files

// Export auth for use in other files
window.auth = auth;
window.googleProvider = googleProvider;

// Log Firebase initialization
console.log('Firebase initialized successfully'); 