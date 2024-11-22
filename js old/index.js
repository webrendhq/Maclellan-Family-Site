import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = '/picture-of-the-day.html';
    } else {
      // No user is signed in, redirect to login page.
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('enter-site-button');
    
    button.addEventListener('click', function() {
        window.location.href = '/sign-in.html';
    });
});

