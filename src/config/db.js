const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      try {
        console.log(`Connecting to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log('MongoDB connected successfully via MONGO_URI');
        return;
      } catch (err) {
        console.warn('Could not connect to MONGO_URI, falling back to MongoMemoryServer:', err.message);
      }
    }

    console.log('Starting MongoDB Memory Server for zero-setup execution...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('MongoDB Memory Server connected at:', mongoUri);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
