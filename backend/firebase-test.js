require('dotenv').config();
const admin = require('firebase-admin');

async function testFirebase() {
  try {
    const serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Format private key properly
    const serviceAccount = {
      ...serviceAccountJson,
      private_key: serviceAccountJson.private_key.replace(/\\n/g, '\n')
    };

    // Initialize Firebase
    if (!admin.apps.length) {
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      // Try to use the auth service
      const auth = app.auth();
      console.log('Firebase initialized successfully, auth service available');
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testFirebase().then(() => {
  console.log('Test completed successfully');
  process.exit(0);
});
