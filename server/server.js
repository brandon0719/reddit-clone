// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mainRoutes from "./routes.js"  // Import the main routes
import dotenv from "dotenv";
dotenv.config();

// initalize express app
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json()); // used to parse JSON request bodies

// connect to mongodb (can be moved to a separate file)
const dbURI = process.env.MONGODB_URI;
mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log("Error connecting to MongoDB:", err.message));

// Register routes with a base URL of /api
app.use("/api", mainRoutes);


// Start server
app.listen(PORT || 8000, () => {
    console.log(`Server listening on port ${PORT}...`);
});
// Handle server shutdown
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("Server closed. Database instance disconnected.");
    process.exit(0);
});
