import User from "./models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

async function register(req, res) {
    const { firstName, lastName, email, displayName, password } = req.body;
    try {
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { displayName: displayName.toLowerCase() }],
        });
        if (existingUser) {
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }

            if (existingUser.displayName.toLowerCase() === displayName.toLowerCase()) {
                return res.status(400).json({
                    message: "Display name already exists",
                });
            }
        }
        // Validate password (it should not contain firstName, lastName, displayName, or email)
        const invalidPassword = [email, displayName, firstName, lastName]
            .filter(Boolean)
            .some((val) => password.toLowerCase().includes(val.toLowerCase()));

        if (invalidPassword) {
            return res.status(400).json({
                message:
                    "Password cannot contain your email, display name, first name, or last name.",
            });
        }
        // create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            displayName,
            password,
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed" });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, displayName: user.displayName, reputation: user.reputation }, secret, {
            expiresIn: "1h",
        });
        res.status(200).json({ token, user }); // Ensure this structure
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}


export default { register, login };
