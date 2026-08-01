const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Connect to MongoDB database.
 * If local/remote MongoDB service is available, connects to MONGODB_URI.
 * Otherwise, automatically spins up an in-memory MongoDB instance for zero-friction local execution.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_receipt_warranty_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    // Set a fast 3-second selection timeout to quickly fallback to memory server if local MongoDB daemon is stopped
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully via URI connection.');
  } catch (err) {
    console.warn('Standard MongoDB connection failed or service not running. Initializing In-Memory MongoDB Server...');
    try {
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Server initialized and connected at: ${memoryUri}`);
    } catch (memErr) {
      console.error('Failed to initialize In-Memory MongoDB Server:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
