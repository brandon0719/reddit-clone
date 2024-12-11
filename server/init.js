import mongoose from "mongoose";
import User from "./models/users.js";

const uri = "mongodb://localhost:27017/phreddit"; // Replace with your database URI

mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
        initializeAdmin();
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

async function initializeAdmin() {
    const email = process.argv[2];
    const displayName = process.argv[3];
    const password = process.argv[4];

    try {
        const adminExists = await User.findOne({ email });
        if (!adminExists) {
            const admin = new User({
                firstName: "Admin",
                lastName: "User",
                email,
                displayName,
                password,
                reputation: 1000,
                dateJoined: Date.now(), 
                isAdmin: true,
            });
            await admin.save();
            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }
    } catch (err) {
        console.error("Error initializing admin user", err);
    } finally {
        mongoose.disconnect();
    }
}
