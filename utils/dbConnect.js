import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/task-manager";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}


const connection = {};
async function dbConnect() {
  if (connection.isConnected) {
    // Use the cached connection if available
    console.log("Connection Build Successfully");
    return connection;
  }

  const db = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

}

export default dbConnect;