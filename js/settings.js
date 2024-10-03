import { auth, onAuthStateChanged, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { 
    updateEmail, 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider, 
    sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

import { doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { dbx } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';

const emailChangeForm = document.getElementById('emailChangeForm');
const passwordChangeForm = document.getElementById('passwordChangeForm');
const verifyEmailButton = document.getElementById('verifyEmail');
const modal = document.getElementById('verifyModal');
const closeModal = document.getElementsByClassName('close')[0];
const newFolderNameInput = document.getElementById('newFolderName');
const updateFolderForm = document.getElementById('updateFolderForm');
const statusElement = document.getElementById('status');
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        attachEventListeners(user);
    } else {
        console.log("No user is signed in.");
    }
});

function attachEventListeners(user) {
    emailChangeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!user.emailVerified) {
            showModal();
            return;
        }
        handleEmailChange(e, user);
    });

    passwordChangeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!user.emailVerified) {
            showModal();
            return;
        }
        handlePasswordChange(e, user);
    });

    verifyEmailButton.addEventListener('click', () => {
        sendEmailVerification(user).then(() => {
            alert('Verification email sent. Please check your inbox.');
            hideModal();
        }).catch((error) => {
            alert('Error sending verification email: ' + error.message);
        });
    });

    closeModal.onclick = hideModal;
    window.onclick = (event) => {
        if (event.target == modal) {
            hideModal();
        }
    }
}

function handleEmailChange(e, user) {
    const formData = new FormData(e.target);
    const newEmail = formData.get('newEmail');
    const password = formData.get('emailPassword');

    const credential = EmailAuthProvider.credential(user.email, password);
    reauthenticateWithCredential(user, credential).then(() => {
        updateEmail(user, newEmail).then(() => {
            alert('Email updated successfully. Please verify your new email.');
            e.target.reset();
        }).catch((error) => {
            alert('Error updating email: ' + error.message);
        });
    }).catch((error) => {
        alert('Error reauthenticating: ' + error.message);
    });
}

function handlePasswordChange(e, user) {
    const formData = new FormData(e.target);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');

    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    reauthenticateWithCredential(user, credential).then(() => {
        updatePassword(user, newPassword).then(() => {
            alert('Password updated successfully.');
            e.target.reset();
        }).catch((error) => {
            alert('Error updating password: ' + error.message);
        });
    }).catch((error) => {
        alert('Error reauthenticating: ' + error.message);
    });
}

function showModal() {
    modal.style.display = "block";
}

function hideModal() {
    modal.style.display = "none";
}



// Function to get current user's folderPath

async function getCurrentFolderPath() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        const userData = userDoc.data();
        return userData.folderPath;
    } catch (error) {
        console.error('Error getting current folder path:', error);
        statusElement.textContent = `Error: ${error.message}`;
        return null;
    }
}


// Set current folderPath as placeholder when page loads
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const currentFolderPath = await getCurrentFolderPath();
        if (currentFolderPath) {
            newFolderNameInput.placeholder = currentFolderPath.replace('/', '');
        }
    } else {
        statusElement.textContent = 'Please log in to update your folder name.';
        updateFolderForm.style.display = 'none';
    }
});

updateFolderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newFolderName = newFolderNameInput.value;

    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        const userData = userDoc.data();
        const oldFolderPath = userData.folderPath;

        // Update the folderPath in Firestore
        await setDoc(userDocRef, { folderPath: `/${newFolderName}` }, { merge: true });

        // Rename the folder in Dropbox
        await dbx.filesMove({
            from_path: oldFolderPath,
            to_path: `/${newFolderName}`
        });

        statusElement.textContent = `Folder name updated successfully to /${newFolderName}`;
        newFolderNameInput.placeholder = newFolderName;
        newFolderNameInput.value = '';
    } catch (error) {
        console.error('Error updating folder name:', error);
        statusElement.textContent = `Error: ${error.message}`;
    }
});



// Admin panel

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (userData && userData.role === "admin") {
            document.getElementById("adminPanel").style.display = "block";
            displayUsers(); // Call this function to show the user list for admins
        } else {
            document.getElementById("adminPanel").style.display = "none";
            document.getElementById("userList").style.display = "none";
        }
        
        document.getElementById("currentRole").textContent = userData.role || "unknown";
    } else {
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("userList").style.display = "none";
        document.getElementById("currentRole").textContent = "Not signed in";
    }
});

async function changeUserRole(newRole) {
    if (!currentUser) {
        alert("No user is currently signed in.");
        return;
    }

    try {
        await updateDoc(doc(db, "users", currentUser.uid), { role: newRole });
        alert(`Your role has been changed to ${newRole} successfully! The page will now refresh.`);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error("Error changing user role:", error);
        alert("Error changing your role. Please try again.");
    }
}

window.changeToAdmin = () => changeUserRole("admin");
window.changeToUser = () => changeUserRole("user");

async function displayUsers() {
    const userListDiv = document.getElementById("userList");
    userListDiv.innerHTML = "<h3>User List</h3>";
    userListDiv.style.display = "block";

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userElement = document.createElement("div");
            userElement.innerHTML = `
                <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                <p><strong>Role:</strong> ${userData.role || 'N/A'}</p>
                <hr>
            `;
            userListDiv.appendChild(userElement);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        userListDiv.innerHTML += "<p>Error fetching users. Please try again later.</p>";
    }
}


























// import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
// import { refreshDropboxAccessToken, createDropboxInstance, getDropboxInstance, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
// import { query, getDocs, collection, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
// import { getUserCount, updateTotalFileCount } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/usercount.js';






// const dbx = getDropboxInstance();
// await fetchAndDisplayUserDropboxFolder(userData.folderPath, dbx);
// await updateFileCount(userData.folderPath, dbx);
// await updateTotalFileCount(dbx);
// await displayAllUsers(); // Display all users for admin
// await getUserCount();
    

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         // User is signed in, fetch their folder path
//         try {
//             const userDoc = await getDoc(doc(db, 'users', user.uid));
//             if (userDoc.exists()) {
//                 userFolderPath = userDoc.data().folderPath;
//                 console.log('User folder path:', userFolderPath);
//             } else {
//                 console.error('No folder path found for user:', user.email);
//             }
//         } catch (error) {
//             console.error('Error fetching user folder path:', error);
//         }
//     } else {
//         // No user is signed in, redirect to login page.
//         window.location.href = '/';
//     }
// });

// async function handleRemoveAdmin(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const email = document.getElementById('remove-admin-email').value;

//     try {
//         const userQuery = query(collection(db, "users"), where("email", "==", email));
//         const querySnapshot = await getDocs(userQuery);

//         if (querySnapshot.empty) {
//             const errorText = document.getElementById('remove-admin-error-message');
//             errorText.innerHTML = "User not found.";
//             return;
//         }

//         const userDoc = querySnapshot.docs[0];

//         await updateDoc(userDoc.ref, {
//             role: 'user'
//         });

//         console.log('User role updated to user: ' + email);
//     } catch (error) {
//         const errorMessage = error.message;
//         const errorText = document.getElementById('remove-admin-error-message');
//         console.log('Error during role removal:', errorMessage);
//         errorText.innerHTML = errorMessage;
//     }
// }

// // handle delete user
// async function handleDeleteUser(e, uid) {
//     e.preventDefault();
//     e.stopPropagation();

//     try {
//         const userDocRef = doc(db, "users", uid);
//         const userDoc = await getDoc(userDocRef);
//         if (userDoc.exists()) {
//             await deleteDoc(userDocRef);
//             console.log('User document deleted from Firestore.');
//         }

//         const user = auth.currentUser;
//         if (user && user.uid === uid) {
//             await deleteUser(user);
//         } else {
//             const userCredential = await signInWithEmailAndPassword(auth, userDoc.data().email, "dummy-password");
//             await deleteUser(userCredential.user);
//         }

//         await displayAllUsers(); // Refresh the user list after deletion
//     } catch (error) {
//         const errorMessage = error.message;
//         console.log('Error during user deletion:', errorMessage);
//     }
// }

// //handles assignment of admins
// async function handleAssignAdmin(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const email = document.getElementById('assign-admin-email').value;

//     try {
//         const userQuery = query(collection(db, "users"), where("email", "==", email));
//         const querySnapshot = await getDocs(userQuery);

//         if (querySnapshot.empty) {
//             const errorText = document.getElementById('assign-admin-error-message');
//             errorText.innerHTML = "User not found.";
//             return;
//         }

//         const userDoc = querySnapshot.docs[0];

//         await updateDoc(userDoc.ref, {
//             role: 'admin'
//         });

//         console.log('User role updated to admin: ' + email);
//     } catch (error) {
//         const errorMessage = error.message;
//         const errorText = document.getElementById('assign-admin-error-message');
//         console.log('Error during role assignment:', errorMessage);
//         errorText.innerHTML = errorMessage;
//     }
// }

// // handles changing your email
// async function handleChangeEmail(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const currentPasswordForEmailChange = document.getElementById('current-password-email-change').value;
//     const newEmail = document.getElementById('new-email').value;
//     const user = auth.currentUser;
//     const changeEmailMessage = document.getElementById('change-email-message');

//     if (user) {
//         const credential = EmailAuthProvider.credential(user.email, currentPasswordForEmailChange);
//         try {
//             console.log('Reauthenticating user...');
//             await reauthenticateWithCredential(user, credential);
//             console.log('Reauthentication successful. Updating email...');
//             await updateEmail(user, newEmail);
//             console.log('Email updated in Firebase Auth.');

//             // Send verification email
//             await sendEmailVerification(user);
//             console.log('Verification email sent.');

//             // Update the Firestore user document
//             const userDocRef = doc(db, "users", user.uid);
//             await updateDoc(userDocRef, {
//                 email: newEmail
//             });
//             console.log('Email updated in Firestore.');

//             changeEmailMessage.style.color = "green";
//             changeEmailMessage.innerHTML = "Email successfully updated. Please check your inbox to verify your new email.";
//         } catch (error) {
//             console.log('Error during email change:', error.message);
//             changeEmailMessage.innerHTML = error.message;
//         }
//     } else {
//         changeEmailMessage.innerHTML = "No user is currently signed in.";
//     }
// }

// // changes pass based on current password
// async function handleChangePassword(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const currentPassword = document.getElementById('current-password').value;
//     const newPassword = document.getElementById('new-password').value;
//     const user = auth.currentUser;
//     const changePasswordMessage = document.getElementById('change-password-message');

//     if (user) {
//         const credential = EmailAuthProvider.credential(user.email, currentPassword);
//         try {
//             await reauthenticateWithCredential(user, credential);
//             await updatePassword(user, newPassword);
//             changePasswordMessage.style.color = "green";
//             changePasswordMessage.innerHTML = "Password successfully updated.";
//         } catch (error) {
//             console.log('Error during password change:', error.message);
//             changePasswordMessage.innerHTML = error.message;
//         }
//     } else {
//         changePasswordMessage.innerHTML = "No user is currently signed in.";
//     }
// }

// // handles forgottne password and emails you
// async function handleForgotPassword(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const email = document.getElementById('forgot-password-email').value;
//     const forgotPasswordMessage = document.getElementById('forgot-password-message');

//     try {
//         await sendPasswordResetEmail(auth, email);
//         forgotPasswordMessage.style.color = "green";
//         forgotPasswordMessage.innerHTML = "Password reset email sent successfully. Please check your inbox.";
//     } catch (error) {
//         console.log('Error during password reset:', error.message);
//         forgotPasswordMessage.style.color = "red";
//         forgotPasswordMessage.innerHTML = error.message;
//     }
// }

// // gets all active users
// async function displayAllUsers() {
//     try {
//         const usersDisplayed = document.getElementById('users-displayed');
//         if (!usersDisplayed) {
//             console.error('Element with id "users-displayed" not found.');
//             return;
//         }
//         usersDisplayed.innerHTML = ''; // Clear existing content

//         const querySnapshot = await getDocs(collection(db, "users"));
//         querySnapshot.forEach((doc) => {
//             const userData = doc.data();
//             const userItem = document.createElement('div');
//             userItem.className = 'user-item';
//             userItem.innerText = userData.name;

//             const removeButton = document.createElement('button');
//             removeButton.innerText = 'REMOVE';
//             removeButton.onclick = (e) => handleDeleteUser(e, userData.uid);

//             userItem.appendChild(removeButton);
//             usersDisplayed.appendChild(userItem);
//         });
//     } catch (error) {
//         console.error('Error fetching users:', error);
//     }
// }

// //update file count
// async function updateFileCount(folderPath, dbx) {
//     try {
//         const response = await dbx.filesListFolder({ path: folderPath });
//         const files = response.result.entries;
//         const fileCountElement = document.getElementById('file-count');
//         if (fileCountElement) {
//             fileCountElement.innerText = files.length;
//         } else {
//             console.error('Element with id "file-count" not found.');
//         }
//     } catch (error) {
//         console.error('Error fetching file count:', error);
//         const fileCountElement = document.getElementById('file-count');
//         if (fileCountElement) {
//             fileCountElement.innerText = 'Error fetching file count';
//         }
//     }
// }


// // listeners
// document.addEventListener('DOMContentLoaded', async function () {

//     // remove admin button listener
//     const removeAdminButton = document.getElementById('remove-admin-button');
//     if (removeAdminButton) {
//         removeAdminButton.addEventListener('click', handleRemoveAdmin);
//     }

//     //change password listener
//     const changePasswordForm = document.getElementsByClassName('change-password-form');
//     if (changePasswordForm.length > 0) {
//         for (let i = 0; i < changePasswordForm.length; i++) {
//             changePasswordForm[i].addEventListener('submit', handleChangePassword, true);
//         }
//     }
    
//     // forgot password form listsneer
//     const forgotPasswordForm = document.getElementById('forgot-password-form');
//     if (forgotPasswordForm) {
//         forgotPasswordForm.addEventListener('submit', handleForgotPassword, true);
//     }

//     // upload button listener
//     const uploadButton = document.getElementById('uploadButton');
//     if (uploadButton) {
//         uploadButton.addEventListener('click', uploadImage);
//     }

//     // assign admin button listener
//     const assignAdminButton = document.getElementById('assign-admin-button');
//     if (assignAdminButton) {
//         assignAdminButton.addEventListener('click', handleAssignAdmin);
//     }

//     // change email listener
//     const changeEmailForm = document.getElementById('update-email-button');
//     if (changeEmailForm) {
//         changeEmailForm.addEventListener('submit', handleChangeEmail, true);
//     }

// })