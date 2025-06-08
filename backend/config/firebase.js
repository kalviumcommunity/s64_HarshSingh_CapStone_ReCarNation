const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount; // ⬅️ Declare it outside so it's accessible

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  const serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // Ensure all required fields are present
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
  for (const field of requiredFields) {
    if (!serviceAccountJson[field]) {
      throw new Error(`Missing required field in service account: ${field}`);
    }
  }

  // Format private key correctly
  serviceAccount = {
    ...serviceAccountJson,
    private_key: serviceAccountJson.private_key.replace(/\\n/g, '\n'),
  };

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  throw error;
}

module.exports = admin;
