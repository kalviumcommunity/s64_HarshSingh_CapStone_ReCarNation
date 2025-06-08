require('dotenv').config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
console.log('First 100 characters of FIREBASE_SERVICE_ACCOUNT:');
console.log(serviceAccount?.substring(0, 100));

try {
  const parsed = JSON.parse(serviceAccount);
  console.log('\nParsed successfully. Keys present:', Object.keys(parsed));
  console.log('\nPrivate key starts with:', parsed.private_key.substring(0, 50));
} catch (error) {
  console.error('Error parsing:', error);
}
