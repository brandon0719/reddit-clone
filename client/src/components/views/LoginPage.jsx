import React, { useState } from "react";
import "../../stylesheets/LoginPage.css";
import { login } from "../../services/sessionService";

const LoginPage = ({ 
    onLogin,
    onCancel,
    onRegister, 
    setUser
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Error state

    const handleLoginClick = async () => {
        setError(""); // Clear any existing errors
        try {
            const userData = await onLogin(email, password); // Get the user data and token
            login(userData); // Save session in cookies
            setUser(userData.user);
        } catch (err) {
            setError("Invalid email or password. Please try again."); // Set error message
        }
    };

    return (
        <div className="login-page">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}{" "}
            {/* Error message */}
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="login-actions">
                <button onClick={handleLoginClick}>Login</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
            <div className="register-section">
                <p>Don't have an account?</p>
                <button className="register-btn" onClick={onRegister}>
                    Register
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
