import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/home.html';
    } else {
      // No user is signed in, redirect to login page.
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('enter-site-button');
    
    button.addEventListener('click', function() {
        window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/sign-in.html';
    });
});

