/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteAccount = functions.https.onCall(async (data, context) => {
  const callerUid = context.auth.uid;
  const callerRef = admin.firestore().collection("users").doc(callerUid);
  const callerSnapshot = await callerRef.get();
  if (!callerSnapshot.exists || callerSnapshot.data().role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can delete accounts.",
    );
  }

  const uid = data.userId;

  try {
    await admin.firestore().collection("users").doc(uid).delete();
    await admin.auth().deleteUser(uid);
    return {message: "Account deleted successfully"};
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new functions.https.HttpsError("internal", "Error deleting account");
  }
});
