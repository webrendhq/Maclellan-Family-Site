import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, continue to show the restricted page.
    } else {
      // No user is signed in, redirect to login page.
      window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/home.html';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('enter-site-button');
    
    button.addEventListener('click', function() {
        window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/sign-in.html';
    });
});

