import Cookies from "js-cookie";
import ApiService from "./ApiService";


export const login = (user) => {
    Cookies.set("token", user.token, { expires: 7 }); // 30 min
    Cookies.set("user", JSON.stringify(user), { expires: 7 }); // 30 min
    console.log("User cookie set:", JSON.stringify(user));
};

export const logout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
};

export const getSessionUser = () => {
    try {
        const userCookie = Cookies.get("user");
        console.log("Raw user cookie:", userCookie);

        if (!userCookie) {
            console.warn("No user cookie found.");
            return null;
        }

        const user = JSON.parse(userCookie);
        console.log("Parsed session user:", user);
        return user;
    } catch (error) {
        console.error("Failed to parse session user:", error);
        Cookies.remove("user"); // Clear corrupted cookie
        return null;
    }
};

export const getSessionToken = () => {
    return Cookies.get("token");
};

export const handleLogin = async (email, password, setUser) => {
    console.log("handleLogin called with:", { email, password });

    try {
        const response = await ApiService.login({ email, password });
        console.log("Login API response:", response); // Log the full response

        const { token, user } = response;

        if (!token || !user) throw new Error("Invalid login response");

        Cookies.set("user", JSON.stringify(user), { expires: 7 }); // Save user to cookie
        Cookies.set("token", token, { expires: 7 }); // Save token to cookie
        console.log("HANDLING User cookie set:", JSON.stringify(user));

        ApiService.setAuthToken(token); // Attach token to Axios
        setUser(user); // Update user state
    } catch (err) {
        console.error("Error during login:", err.message);
        throw err;
    }
};