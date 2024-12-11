import React, { useState } from "react";

const Banner = ({
    searchFor,
    onCreatePost,
    setCreatingCommunity,
    setCreatingNewPost,
    CreatingNewPost,
    setSelectedCommunity,
    onSelectHome,
    setSelectedPost,
    setShowNewPostPage,
    showNewCommentPage,
    user,
    onLogin,
    onLogout,
    onRegister,
    onGuestAccess,
    setViewProfile,
    onAdminPage,
}) => {
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = (e) => {
        if (e.key === "Enter") {
            searchFor(searchInput);
            setSearchInput("");
        }
    };

    return (
        <div className="banner">
            {/* App Name/Logo */}
            <a
                href="/"
                className="app-name"
                onClick={(e) => {
                    // e.preventDefault();
                    // onSelectHome();
                    // setSelectedCommunity(null);
                    // setSelectedPost(null);
                    // setCreatingCommunity(false);
                    // setShowNewPostPage(false);
                    // setCreatingNewPost(false);
                    // showNewCommentPage(false);
                    // setViewProfile(false);
                    window.location.reload();
                }}>
                phreddit
            </a>

            {/* Centered Search Bar */}
            <input
                type="text"
                className="search-box"
                placeholder="Search Phreddit..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearch}
                disabled={!user}
            />

            {/* Buttons Section */}
            <div className="user-actions">
                {user ? (
                    <>
                        <button
                            className={`create-post-btn ${
                                user.isGuest ? "disabled-btn" : ""
                            } ${
                                CreatingNewPost && !user.isGuest
                                    ? "create-post-active"
                                    : ""
                            }`}
                            onClick={(e) => {
                                if (user.isGuest) return; // Disable functionality for guest users
                                e.preventDefault();
                                onCreatePost();
                                setCreatingCommunity(false);
                                setCreatingNewPost(true);
                                setSelectedCommunity("create-post-btn");
                            }}
                            disabled={user.isGuest} // Disable button for guest users
                        >
                            Create Post
                        </button>
                        <button
                            className="user-profile-btn"
                            onClick={(e) => {
                                if (!user.isGuest) {
                                    e.preventDefault();
                                    setSelectedCommunity(null);
                                    setSelectedPost(null);
                                    setCreatingCommunity(false);
                                    setShowNewPostPage(false);
                                    setCreatingNewPost(false);
                                    showNewCommentPage(false);
                                    onSelectHome();
                                    if (user?.isAdmin) {
                                        onAdminPage(); // Navigate to AdminPage if the user is an admin
                                        setViewProfile(false); 
                                    } else {
                                        setViewProfile(true); // Navigate to the regular ProfilePage otherwise
                                    }                                } 
                            }}
                            disabled={user.isGuest}
                        >
                            {user.displayName}
                        </button>
                        <button className="logout-btn" onClick={onLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button className="login-btn" onClick={onLogin}>
                            Login
                        </button>
                        <button className="login-btn" onClick={onRegister}>
                            Register
                        </button>
                        <button className="login-btn" onClick={onGuestAccess}>
                            Guest User
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Banner;
