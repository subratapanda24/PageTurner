const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let isFirebaseConfigured = false;
let bucket = null;

try {
  const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  let credential = null;

  // 1. Check if user placed serviceAccountKey.json directly in root
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('Loaded Firebase credentials from serviceAccountKey.json');
    } catch (e) {
      console.warn('Error parsing serviceAccountKey.json:', e.message);
    }
  }

  // 2. Otherwise check .env variables
  if (!credential && projectId && clientEmail && privateKey && !privateKey.includes('YOUR_PRIVATE_KEY_HERE')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    credential = admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
    console.log('Loaded Firebase credentials from .env');
  }

  // 3. Initialize Firebase Admin SDK
  if (credential) {
    const initOptions = { credential };
    if (storageBucket && !storageBucket.includes('placeholder')) {
      initOptions.storageBucket = storageBucket;
    }

    admin.initializeApp(initOptions);
    isFirebaseConfigured = true;

    if (initOptions.storageBucket) {
      try {
        bucket = admin.storage().bucket();
        console.log('Firebase Admin SDK and Storage initialized successfully');
      } catch (bucketErr) {
        console.log('Firebase Storage bucket not active, using local storage.');
      }
    } else {
      console.log('Firebase Authentication initialized successfully (Storage running in local fallback mode)');
    }
  } else {
    console.log('Firebase credentials not configured in .env or serviceAccountKey.json - falling back to local storage and standard JWT mode.');
  }
} catch (error) {
  console.warn('Firebase initialization error:', error.message, '- falling back to local mode.');
}

/**
 * Upload file to Firebase Storage (or return local file relative path if Firebase is not active)
 */
const uploadToFirebaseStorage = async (file) => {
  if (!file) return null;

  if (isFirebaseConfigured && bucket) {
    try {
      const destination = `book-covers/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(destination);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true,
      });

      // Public URL format
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      return publicUrl;
    } catch (err) {
      console.error('Failed to upload image to Firebase Storage:', err.message);
      // Fallback to serving locally
    }
  }

  // Local disk fallback
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  if (file.buffer) {
    fs.writeFileSync(filePath, file.buffer);
  }

  return `/uploads/${fileName}`;
};

module.exports = {
  admin,
  isFirebaseConfigured,
  uploadToFirebaseStorage,
};
