import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Use memory server if URI is empty, undefined, or is the default placeholder text
    if (!uri || uri === 'your_mongodb_atlas_connection_string_here' || uri.includes('gamp2dg.mongodb.net')) {
      console.log('Using in-memory MongoDB server (mongodb-memory-server)');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;