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

// Add event listeners for sign-out buttons
document.addEventListener('DOMContentLoaded', () => {
    const signOutButtons = document.querySelectorAll('#signout, #signout-settings');
    signOutButtons.forEach(button => {
        button.addEventListener('click', handleSignOut);
    });
});