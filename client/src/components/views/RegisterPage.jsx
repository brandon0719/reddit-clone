import React, { useState } from "react";
import "../../stylesheets/LoginPage.css";

const RegisterPage = ({ onCancel, onRegister }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [errors, setErrors] = useState({}); // Object to track validation errors

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateForm = () => {
        const newErrors = {};

        // Validate first name
        if (!firstName) {
            newErrors.firstName = "First name is required.";
        }

        // Validate last name
        if (!lastName) {
            newErrors.lastName = "Last name is required.";
        }

        // Validate email
        if (!email) {
            newErrors.email = "Email is required.";
        } else if (!validateEmail(email)) {
            newErrors.email = "Invalid email format.";
        }

        // Validate display name
        if (!displayName) {
            newErrors.displayName = "Display name is required.";
        }

        // Validate password
        const forbiddenWords = [email, firstName, lastName, displayName].filter(Boolean);
        const containsForbiddenWords = forbiddenWords.some((word) =>
            password.toLowerCase().includes(word.toLowerCase())
        );

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (containsForbiddenWords) {
            newErrors.password =
                "Password cannot contain your email, first name, last name, or display name.";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterClick = async () => {
        if (validateForm()) {
            try {
                await onRegister({
                    firstName,
                    lastName,
                    email,
                    displayName,
                    password,
                }); // Attempt to register
            } catch (err) {
                console.log(err);
                setErrors({ server: err.response.data.message || "Registration Failed"});
            }
        }
    };

    return (
        <div className="login-page">
            <h2>Register</h2>
            {errors.server && (
                <p className="error-message">{errors.server}</p>
            )}{" "}
            {/* Server error */}
            <input
                type="text"
                placeholder="First Name"
                value={firstName}  
                onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && (
                <p className="error-message">{errors.firstName}</p>
            )}
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && (
                <p className="error-message">{errors.lastName}</p>
            )}
            <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />
            {errors.displayName && (
                <p className="error-message">{errors.displayName}</p>
            )}
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
                <p className="error-message">{errors.password}</p>
            )}
            <div className="login-actions">
                <button onClick={handleRegisterClick}>Sign Up</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default RegisterPage;
