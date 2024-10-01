import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

// Handle sign-out
function handleSignOut() {
    signOut(auth).then(() => {
      // Refreshes the current page
      console.log('User signed out');
      window.location.href = '/';
    }).catch((error) => {
      console.log(error.message);
    });
}

// Add event listener for sign-out button
document.addEventListener('DOMContentLoaded', () => {
    const signOutButton = document.getElementById('signout');
    if (signOutButton) {
        signOutButton.addEventListener('click', handleSignOut);
    }
});