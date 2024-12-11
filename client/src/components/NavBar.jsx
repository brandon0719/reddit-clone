import React from "react";

const NavBar = ({
    communities,
    onSelectCommunity,
    isHomePage,
    setCreatingCommunity,
    setSelectedCommunity,
    selectedCommunity,
    setSelectedPost,
    showNewCommentPage,
    setShowNewPostPage,
    creatingCommunity,
    setCreatingNewPost,
    onSelectHome,
    user, // Add user prop to check authentication and joined communities
}) => {
    // Sort communities based on user membership
    const sortedCommunities = [...communities].sort((a, b) => {
        const userIsMemberA = a.members.includes(user?.displayName); // Check if the user is a member of community A
        const userIsMemberB = b.members.includes(user?.displayName); // Check if the user is a member of community B

        // Sort: communities with user membership first
        if (userIsMemberA && !userIsMemberB) return -1;
        if (!userIsMemberA && userIsMemberB) return 1;

        // If both or neither, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="nav-bar">
            <a
                href="/"
                className={`nav-link home-link ${
                    isHomePage ? "home-active" : ""
                }`}
                onClick={(e) => {
                    e.preventDefault();
                    onSelectHome();
                    setSelectedCommunity(null);
                    setSelectedPost(null);
                    setCreatingCommunity(false);
                    setShowNewPostPage(false);
                    setCreatingNewPost(false);
                    showNewCommentPage(false);
                }}>
                Home
            </a>
            <div className="communities-section">
                <button
                    className={`create-community-btn ${
                        creatingCommunity ? "active" : ""
                    } ${!user || user.isGuest ? "disabled-btn" : ""}`} // Add disabled styling
                    onClick={() => {
                        if (!user || user.isGuest) return; // Prevent action for guests or unauthenticated users
                        setCreatingCommunity(true);
                        setSelectedCommunity("create-community-btn");
                        setCreatingNewPost(false);
                        setSelectedPost(null);
                        showNewCommentPage(false);
                        setShowNewPostPage(false);
                    }}
                    disabled={!user || user.isGuest} // Disable button functionality
                >
                    Create Community
                </button>
                <h3 className="communities-header">Communities</h3>
                {/* List of Communities */}
                <ul className="community-list">

                    {user ? sortedCommunities.map((community, index) => (
                        <li key={index}>
                            <a
                                href={`/community/${community.name}`}
                                className={`community-link ${
                                    selectedCommunity &&
                                    selectedCommunity.name === community.name
                                        ? "community-active"
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelectCommunity(community.name);
                                    setSelectedPost(null);
                                    showNewCommentPage(false);
                                    setCreatingCommunity(false);
                                    setShowNewPostPage(false);
                                    setCreatingNewPost(false);
                                }}>
                                {community.name}
                            </a>
                        </li>
                    )): <p>Login or Continue as Guest</p>}
                </ul>
            </div>
        </div>
    );
};

export default NavBar;
