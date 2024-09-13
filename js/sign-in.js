// Import the functions you need from the SDKs you need
// import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs , collection } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let cursor = null;

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB5DMIx5yWtZJsZFrNFjkFc68rtWDzdW_k",
    authDomain: "tina-coombs-site.firebaseapp.com",
    databaseURL: "https://tina-coombs-site-default-rtdb.firebaseio.com",
    projectId: "tina-coombs-site",
    storageBucket: "tina-coombs-site.appspot.com",
    messagingSenderId: "414945778846",
    appId: "1:414945778846:web:38d525b62f09bf215f6f8f"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function getUserCount() {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.size;
}

// Handle sign-up
async function handleSignUp(e) {
    e.preventDefault();
    e.stopPropagation();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    console.log("Name is " + name);
    console.log("Email is " + email);

    try {
        const userCount = await getUserCount();
        if (userCount >= 6) {
            const errorText = document.getElementById('signup-error-message');
            errorText.innerHTML = "User limit reached. No more sign-ups allowed.";
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uniqueKey = generateUniqueKey();
        console.log('User successfully created: ' + user.email);

        const folderPath = `/${name}`;
        console.log(`Creating folder in Dropbox at path: ${folderPath}`);
        

        try {
            const createFolderResponse = await dbx.filesCreateFolderV2({ path: folderPath });
            console.log('Folder created in Dropbox for user:', createFolderResponse);
        } catch (dropboxError) {
            if (dropboxError.response) {
                const errorText = await dropboxError.response.text();
                console.error('Dropbox folder creation failed:', errorText);
            } else {
                console.error('Dropbox folder creation failed:', dropboxError);
            }
            throw dropboxError;
        }

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: user.email,
            role: 'user',
            content: `This is the personalized content for ${email}. Your unique key is ${uniqueKey}.`,
            folderPath: folderPath
        });

        console.log('User document created with content and folder path.');
        window.location.href = 'https://www.macllelan.com/home.html';

    } catch (error) {
        const errorMessage = error.message;
        const errorText = document.getElementById('signup-error-message');
        console.log('Error during sign-up:', errorMessage);
        errorText.innerHTML = errorMessage;
    }
}

// Handle sign-in
async function handleSignIn(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in: ' + user.email);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(`User document data: ${JSON.stringify(userData)}`);
            window.location.href = 'https://www.macllelan.com/home.html';
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        const errorMessage = error.message;
        const errorText = document.getElementById('signin-error-message');
        console.log('Error during sign-in:', errorMessage);
        errorText.innerHTML = errorMessage;
    }
}

// Attach event listeners to the form elements
document.getElementById('signup-form').addEventListener('submit', handleSignUp);
document.getElementById('signin-form').addEventListener('submit', handleSignIn);

// if (signOutButton) signOutButton.addEventListener('click', handleSignOut);


