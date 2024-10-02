import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { refreshDropboxAccessToken, createDropboxInstance, getDropboxInstance, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { query, getDocs, collection, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getUserCount, updateTotalFileCount } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/usercount.js';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, fetch their folder path
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userFolderPath = userDoc.data().folderPath;
                console.log('User folder path:', userFolderPath);
            } else {
                console.error('No folder path found for user:', user.email);
            }
        } catch (error) {
            console.error('Error fetching user folder path:', error);
        }
    } else {
        // No user is signed in, redirect to login page.
        window.location.href = '/';
    }
});



