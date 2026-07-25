const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI || process.env.MONGODB_URI;
    
    if (!dbUri) {
      throw new Error('DB_URI or MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
