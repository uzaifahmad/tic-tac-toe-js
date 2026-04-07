const fs = require('fs');
const path = require('path');

// Generate config.js from environment variables
const config = `
window.FIREBASE_CONFIG = {
  apiKey: "${process.env.VITE_FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
  databaseURL: "${process.env.VITE_FIREBASE_DATABASE_URL || ''}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.VITE_FIREBASE_APP_ID || ''}"
};
`;

try {
  fs.writeFileSync(path.join(__dirname, '../config.js'), config);
  console.log('✓ config.js generated from environment variables');
} catch (error) {
  console.error('✗ Failed to generate config.js:', error.message);
  process.exit(1);
}
