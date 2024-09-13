// Import the functions you need from the SDKs you need
// import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs , collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { dbx } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, db, app } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';


let cursor = null;

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
        
        console.log('User successfully created: ' + user.email);

        const folderPath = `/${name}`;
        console.log(`Attempting to create folder in Dropbox at path: ${folderPath}`);

        try {
            const createFolderResponse = await dbx.filesCreateFolderV2({ path: folderPath, autorename: true });
            console.log('Folder created in Dropbox for user:', createFolderResponse);
        } catch (dropboxError) {
            if (dropboxError.status === 409) {
                console.log('Folder already exists, proceeding with sign-up');
                // You might want to generate a unique name here instead
            } else {
                console.error('Dropbox folder creation failed:', dropboxError);
                throw dropboxError;
            }
        }
        

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: user.email,
            role: 'user',
            
            folderPath: folderPath
        });

        console.log('User document created with content and folder path.');
        window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/home';

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
            window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/home';
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


