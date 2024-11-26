// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqGV5J3if7mJoH464xGx6bZ5wgU_wMn3I",
  authDomain: "maclellen.firebaseapp.com",
  projectId: "maclellen",
  storageBucket: "maclellen.firebasestorage.app",
  messagingSenderId: "254246388059",
  appId: "1:254246388059:web:ca15c2405a33477665da7e"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();

// Make signOut function global
window.signOut = function() {
  auth.signOut()
      .then(() => {
          sessionStorage.clear();
          window.location.href = 'index.html';
      })
      .catch(error => {
          console.error('Sign out error:', error);
          alert('Error signing out: ' + error.message);
      });
}

// Auth state observer for protected pages
function checkAuth() {
  auth.onAuthStateChanged(user => {
      const protectedPages = ['main.html', 'events.html', 'images.html'];
      const currentPage = window.location.pathname.split('/').pop();
      
      if (!user && protectedPages.includes(currentPage)) {
          window.location.href = 'index.html';
      }
  });
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);