import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
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