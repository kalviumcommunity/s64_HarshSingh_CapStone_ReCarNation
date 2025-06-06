const admin = require('firebase-admin');
require('dotenv').config();

// Load the service account key JSON file
const serviceAccount = require('../firebase-service-account-key.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
