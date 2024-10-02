import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { refreshDropboxAccessToken, createDropboxInstance, getDropboxInstance, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { query, getDocs, collection, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getUserCount, updateTotalFileCount } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/usercount.js';






const dbx = getDropboxInstance();
await fetchAndDisplayUserDropboxFolder(userData.folderPath, dbx);
await updateFileCount(userData.folderPath, dbx);
await updateTotalFileCount(dbx);
await displayAllUsers(); // Display all users for admin
await getUserCount();
    

async function handleRemoveAdmin(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = document.getElementById('remove-admin-email').value;

    try {
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            const errorText = document.getElementById('remove-admin-error-message');
            errorText.innerHTML = "User not found.";
            return;
        }

        const userDoc = querySnapshot.docs[0];

        await updateDoc(userDoc.ref, {
            role: 'user'
        });

        console.log('User role updated to user: ' + email);
    } catch (error) {
        const errorMessage = error.message;
        const errorText = document.getElementById('remove-admin-error-message');
        console.log('Error during role removal:', errorMessage);
        errorText.innerHTML = errorMessage;
    }
}

// handle delete user
async function handleDeleteUser(e, uid) {
    e.preventDefault();
    e.stopPropagation();

    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            await deleteDoc(userDocRef);
            console.log('User document deleted from Firestore.');
        }

        const user = auth.currentUser;
        if (user && user.uid === uid) {
            await deleteUser(user);
        } else {
            const userCredential = await signInWithEmailAndPassword(auth, userDoc.data().email, "dummy-password");
            await deleteUser(userCredential.user);
        }

        await displayAllUsers(); // Refresh the user list after deletion
    } catch (error) {
        const errorMessage = error.message;
        console.log('Error during user deletion:', errorMessage);
    }
}

//handles assignment of admins
async function handleAssignAdmin(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = document.getElementById('assign-admin-email').value;

    try {
        const userQuery = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            const errorText = document.getElementById('assign-admin-error-message');
            errorText.innerHTML = "User not found.";
            return;
        }

        const userDoc = querySnapshot.docs[0];

        await updateDoc(userDoc.ref, {
            role: 'admin'
        });

        console.log('User role updated to admin: ' + email);
    } catch (error) {
        const errorMessage = error.message;
        const errorText = document.getElementById('assign-admin-error-message');
        console.log('Error during role assignment:', errorMessage);
        errorText.innerHTML = errorMessage;
    }
}

// handles changing your email
async function handleChangeEmail(e) {
    e.preventDefault();
    e.stopPropagation();

    const currentPasswordForEmailChange = document.getElementById('current-password-email-change').value;
    const newEmail = document.getElementById('new-email').value;
    const user = auth.currentUser;
    const changeEmailMessage = document.getElementById('change-email-message');

    if (user) {
        const credential = EmailAuthProvider.credential(user.email, currentPasswordForEmailChange);
        try {
            console.log('Reauthenticating user...');
            await reauthenticateWithCredential(user, credential);
            console.log('Reauthentication successful. Updating email...');
            await updateEmail(user, newEmail);
            console.log('Email updated in Firebase Auth.');

            // Send verification email
            await sendEmailVerification(user);
            console.log('Verification email sent.');

            // Update the Firestore user document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                email: newEmail
            });
            console.log('Email updated in Firestore.');

            changeEmailMessage.style.color = "green";
            changeEmailMessage.innerHTML = "Email successfully updated. Please check your inbox to verify your new email.";
        } catch (error) {
            console.log('Error during email change:', error.message);
            changeEmailMessage.innerHTML = error.message;
        }
    } else {
        changeEmailMessage.innerHTML = "No user is currently signed in.";
    }
}

// changes pass based on current password
async function handleChangePassword(e) {
    e.preventDefault();
    e.stopPropagation();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const user = auth.currentUser;
    const changePasswordMessage = document.getElementById('change-password-message');

    if (user) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            changePasswordMessage.style.color = "green";
            changePasswordMessage.innerHTML = "Password successfully updated.";
        } catch (error) {
            console.log('Error during password change:', error.message);
            changePasswordMessage.innerHTML = error.message;
        }
    } else {
        changePasswordMessage.innerHTML = "No user is currently signed in.";
    }
}

// handles forgottne password and emails you
async function handleForgotPassword(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = document.getElementById('forgot-password-email').value;
    const forgotPasswordMessage = document.getElementById('forgot-password-message');

    try {
        await sendPasswordResetEmail(auth, email);
        forgotPasswordMessage.style.color = "green";
        forgotPasswordMessage.innerHTML = "Password reset email sent successfully. Please check your inbox.";
    } catch (error) {
        console.log('Error during password reset:', error.message);
        forgotPasswordMessage.style.color = "red";
        forgotPasswordMessage.innerHTML = error.message;
    }
}

// gets all active users
async function displayAllUsers() {
    try {
        const usersDisplayed = document.getElementById('users-displayed');
        if (!usersDisplayed) {
            console.error('Element with id "users-displayed" not found.');
            return;
        }
        usersDisplayed.innerHTML = ''; // Clear existing content

        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerText = userData.name;

            const removeButton = document.createElement('button');
            removeButton.innerText = 'REMOVE';
            removeButton.onclick = (e) => handleDeleteUser(e, userData.uid);

            userItem.appendChild(removeButton);
            usersDisplayed.appendChild(userItem);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

//update file count
async function updateFileCount(folderPath, dbx) {
    try {
        const response = await dbx.filesListFolder({ path: folderPath });
        const files = response.result.entries;
        const fileCountElement = document.getElementById('file-count');
        if (fileCountElement) {
            fileCountElement.innerText = files.length;
        } else {
            console.error('Element with id "file-count" not found.');
        }
    } catch (error) {
        console.error('Error fetching file count:', error);
        const fileCountElement = document.getElementById('file-count');
        if (fileCountElement) {
            fileCountElement.innerText = 'Error fetching file count';
        }
    }
}


// listeners
document.addEventListener('DOMContentLoaded', async function () {

    // remove admin button listener
    const removeAdminButton = document.getElementById('remove-admin-button');
    if (removeAdminButton) {
        removeAdminButton.addEventListener('click', handleRemoveAdmin);
    }

    //change password listener
    const changePasswordForm = document.getElementsByClassName('change-password-form');
    if (changePasswordForm.length > 0) {
        for (let i = 0; i < changePasswordForm.length; i++) {
            changePasswordForm[i].addEventListener('submit', handleChangePassword, true);
        }
    }
    
    // forgot password form listsneer
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword, true);
    }

    // upload button listener
    const uploadButton = document.getElementById('uploadButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', uploadImage);
    }

    // assign admin button listener
    const assignAdminButton = document.getElementById('assign-admin-button');
    if (assignAdminButton) {
        assignAdminButton.addEventListener('click', handleAssignAdmin);
    }

    // change email listener
    const changeEmailForm = document.getElementById('update-email-button');
    if (changeEmailForm) {
        changeEmailForm.addEventListener('submit', handleChangeEmail, true);
    }

})