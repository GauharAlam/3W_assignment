const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGO_URI.
 * Only two collections are used in this project: `users` and `posts`
 * (see src/models/). Mongoose creates them from the model names.
 */
async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

module.exports = connectDB;
