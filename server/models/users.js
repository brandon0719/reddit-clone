import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid Email Format",
    },
    displayName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reputation: { type: Number, default: 100 }, // Admin starts with 1000 in init script
    dateJoined: { type: Date, default: Date.now }, // Store the registration date
    isAdmin: { type: Boolean, default: false },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
