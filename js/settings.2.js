import { auth, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Function to handle email change
async function handleChangeEmail() {
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
      changeEmailMessage.textContent = "Email successfully updated. Please check your inbox to verify your new email.";
    } catch (error) {
      console.log('Error during email change:', error.message);
      changeEmailMessage.textContent = error.message;
    }
  } else {
    changeEmailMessage.textContent = "No user is currently signed in.";
  }
}

// Add event listener to the button
const changeEmailButton = document.getElementById('change-email-button');
if (changeEmailButton) {
  changeEmailButton.addEventListener('click', handleChangeEmail);
}



import { auth, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Function to handle email change
async function handleChangeEmail() {
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
      changeEmailMessage.textContent = "Email successfully updated. Please check your inbox to verify your new email.";
    } catch (error) {
      console.log('Error during email change:', error.message);
      changeEmailMessage.textContent = error.message;
    }
  } else {
    changeEmailMessage.textContent = "No user is currently signed in.";
  }
}

// Add event listener to the button
const changeEmailButton = document.getElementById('change-email-button');
if (changeEmailButton) {
  changeEmailButton.addEventListener('click', handleChangeEmail);
}




import { auth, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Function to handle email change
async function handleChangeEmail() {
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
      changeEmailMessage.textContent = "Email successfully updated. Please check your inbox to verify your new email.";
    } catch (error) {
      console.log('Error during email change:', error.message);
      changeEmailMessage.textContent = error.message;
    }
  } else {
    changeEmailMessage.textContent = "No user is currently signed in.";
  }
}

// Add event listener to the button
const changeEmailButton = document.getElementById('change-email-button');
if (changeEmailButton) {
  changeEmailButton.addEventListener('click', handleChangeEmail);
}






import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

// Function to handle password change
async function handleChangePassword() {
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
      changePasswordMessage.textContent = "Password successfully updated.";
    } catch (error) {
      console.error('Error during password change:', error.message);
      changePasswordMessage.textContent = "Error updating password: " + error.message;
    }
  } else {
    changePasswordMessage.textContent = "No user is currently signed in.";
  }
}

// Add event listener to the button
const changePasswordButton = document.getElementById('change-password-button');
if (changePasswordButton) {
  changePasswordButton.addEventListener('click', handleChangePassword);
}