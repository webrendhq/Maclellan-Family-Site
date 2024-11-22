// Import the functions you need from the SDKs you need
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail 
  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
  
  import { 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    collection 
  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
  
  import { dbx } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
  import { auth, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
  
  let cursor = null;
  
  // Function to get user count from Firestore
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
          window.location.href = '/picture-of-the-day.html';
  
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
              window.location.href = '/picture-of-the-day.html';
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
  
  // Handle password reset
  async function handlePasswordReset(e) {
      e.preventDefault();
      e.stopPropagation();
  
      const email = document.getElementById('forgot-email').value;
      const errorText = document.getElementById('forgot-password-error');
      const successText = document.getElementById('forgot-password-success');
  
      // Clear previous messages
      errorText.innerHTML = '';
      successText.innerHTML = '';
  
      try {
          await sendPasswordResetEmail(auth, email);
          console.log('Password reset email sent to:', email);
          successText.innerHTML = "Password reset email sent successfully. Please check your inbox.";
      } catch (error) {
          const errorMessage = error.message;
          console.log('Error sending password reset email:', errorMessage);
          errorText.innerHTML = errorMessage;
      }
  }
  
  // Modal functionality
  function setupModal() {
      const modal = document.getElementById('forgotPasswordModal');
      const openModalBtn = document.getElementById('openForgotPasswordModal');
      const closeModalBtn = document.querySelector('.close-button');
  
      // Open the modal when the "Forgot Password?" link is clicked
      openModalBtn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.style.display = 'block';
      });
  
      // Close the modal when the 'x' button is clicked
      closeModalBtn.addEventListener('click', () => {
          modal.style.display = 'none';
          clearForgotPasswordForm();
      });
  
      // Close the modal when clicking outside the modal content
      window.addEventListener('click', (event) => {
          if (event.target == modal) {
              modal.style.display = 'none';
              clearForgotPasswordForm();
          }
      });
  }
  
  // Function to clear the forgot password form and messages
  function clearForgotPasswordForm() {
      document.getElementById('forgot-password-form').reset();
      document.getElementById('forgot-password-error').innerHTML = '';
      document.getElementById('forgot-password-success').innerHTML = '';
  }
  
  // Attach event listeners to the form elements
  document.getElementById('signup-form').addEventListener('submit', handleSignUp);
  document.getElementById('signin-form').addEventListener('submit', handleSignIn);
  
  // Attach event listener to the forgot password form
  document.getElementById('forgot-password-form').addEventListener('submit', handlePasswordReset);
  
  // Initialize modal functionality
  setupModal();
  