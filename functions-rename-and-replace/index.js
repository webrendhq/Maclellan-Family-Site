const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteAccount = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  const callerUid = context.auth.uid;
  const callerSnapshot = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerSnapshot.exists || callerSnapshot.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete accounts.');
  }

  const uid = data.userId;

  try {
    // Delete the user's document from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    // Delete the user's authentication account
    await admin.auth().deleteUser(uid);

    return { message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new functions.https.HttpsError('internal', 'Error deleting account');
  }
});