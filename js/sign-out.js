import { refreshDropboxAccessToken, createDropboxInstance, getDropboxInstance, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCqGV5J3if7mJoH464xGx6bZ5wgU_wMn3I",
    authDomain: "maclellen.firebaseapp.com",
    projectId: "maclellen",
    storageBucket: "maclellen.appspot.com",
    messagingSenderId: "254246388059",
    appId: "1:254246388059:web:ca15c2405a33477665da7e"
};

// Handle sign-out
function handleSignOut() {
    signOut(auth).then(() => {
      // Refreshes the current page
      console.log('User signed out');
      window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/index.html';
    }).catch((error) => {
      console.log(error.message);
    });
}

// Add event listener for sign-out button
document.addEventListener('DOMContentLoaded', () => {
    const signOutButton = document.getElementById('sign-out');
    if (signOutButton) {
        signOutButton.addEventListener('click', handleSignOut);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, continue to show the restricted page.
    } else {
      // No user is signed in, redirect to login page.
      window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/index.html';
    }
});