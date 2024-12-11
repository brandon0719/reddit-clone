// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import Banner from "./components/Banner.jsx";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./components/views/HomePage.jsx";
import CommunityPage from "./components/views/CommunityPage.jsx";
import PostPage from "./components/views/PostPage.jsx";
import NewCommentPage from "./components/views/NewCommentPage.jsx";
import SearchResults from "./components/views/SearchResults.jsx";
import CreateCommunity from "./components/views/CreateCommunity.jsx";
import CreatePost from "./components/views/CreatePost.jsx";
import LoginPage from "./components/views/LoginPage.jsx";
import RegisterPage from "./components/views/RegisterPage.jsx";
import ProfilePage from "./components/views/ProfilePage.jsx";
import AdminPage from "./components/views/AdminPage.jsx";

import { useState, useEffect } from "react";
import { getSessionUser, logout } from "./services/sessionService.js";
import Cookies from "js-cookie";
import ApiService from "./services/ApiService.jsx";

function App() {
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchTerms, setSearchTerm] = useState("");
    const [posts, setPosts] = useState([]);
    const [creatingCommunity, setCreatingCommunity] = useState(false);
    const [viewProfile, setViewProfile] = useState(false);
    const [viewAdminPage, setViewAdminPage] = useState(false);
    const [viewingOtherUser, setViewingOtherUser] = useState(null); // Stores selected user data

    const [showNewCommentPage, setShowNewCommentPage] = useState(false);
    const [parentComment, setParentComment] = useState(null);
    const [comments, setComments] = useState([]);

    const [showNewPostPage, setShowNewPostPage] = useState(false);
    const [creatingNewPost, setCreatingNewPost] = useState(false);

    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);

    // Fetch initial data
    useEffect(() => {
        const sessionUser = getSessionUser();
        if (sessionUser) {
            setUser(sessionUser); // Restore user state
            ApiService.setAuthToken(sessionUser.token); // Attach token to Axios
            console.log("Session restored:", sessionUser);
        } else {
            console.log("No session found, starting with default state.");
        }

        console.log("Fetching initial data...");

        // Fetch all communities
        ApiService.getAllCommunities()
            .then((data) => {
                // console.log("Communities:", data);
                setCommunities(data);
            })
            .catch((error) =>
                console.error("Error fetching communities:", error)
            );

        // Fetch all posts
        ApiService.getAllPosts()
            .then((data) => {
                // console.log("Posts:", data);
                setPosts(data);
            })
            .catch((error) => console.error("Error fetching posts:", error));

        // Fetch all comments
        ApiService.getAllComments()
            .then((data) => {
                // console.log("Comments:", data);
                setComments(data);
            })
            .catch((error) => console.error("Error fetching comments:", error));

        // Fetch all link flairs
        ApiService.getAllLinkFlairs()
            .then((data) => {
                // console.log("Link Flairs:", data);
                setLinkFlairs(data);
            })
            .catch((error) =>
                console.error("Error fetching link flairs:", error)
            );
    }, []);

    // Function to update the view count for a post
    const updatePostViews = async (postID) => {
        try {
            // call the api to increment the view count to the database
            await ApiService.updatePostViews(postID);

            // get the updated view count post
            const updatedPost = await ApiService.getOnePost(postID);

            // update state with new view count
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postID ? updatedPost : post
                )
            );
        } catch (error) {
            console.error("Error updating post views:", error);
        }
    };

    // handle create community
    const handleCreateCommunity = async (newCommunity) => {
        // no need to make a unique id as mongodb will do it
        try {
            // call the api to add new community to the database
            const createdCommunity = await ApiService.addOneCommunity(
                newCommunity
            );

            // update state with new community
            setCommunities([...communities, createdCommunity]);

            // set the newly created community as the selected community
            setCreatingCommunity(false);
            setSelectedCommunity(createdCommunity);
        } catch (error) {
            console.error("Error creating community:", error);
        }
    };

    // Handle submitting a new comment
    const handleSubmitComment = async ({
        content,
        parentCommentID,
        postID,
        userName,
    }) => {
        const newComment = {
            content,
            commentedBy: userName,
            commentedDate: new Date(),
            commentIDs: [],
        };

        try {
            // 1. Add the comment to the database and get the created comment with its `_id`
            const createdComment = await ApiService.addOneComment(newComment);

            // 2. Update the comments state to include the new comment immediately
            setComments((prevComments) => [...prevComments, createdComment]);

            if (parentCommentID) {
                // If this is a reply, update the parent comment
                // 3. Update the parent comment in the database to add the new comment ID
                await ApiService.updateComment(parentCommentID, {
                    $push: { commentIDs: createdComment._id },
                });

                // 4. Update the parent comment in the local comments state to include the new comment ID
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === parentCommentID
                            ? {
                                  ...comment,
                                  commentIDs: [
                                      ...comment.commentIDs,
                                      createdComment._id,
                                  ],
                              }
                            : comment
                    )
                );
            } else {
                // If this is a top-level comment, add it to the post's commentIDs
                await ApiService.updatePost(postID, {
                    $push: { commentIDs: createdComment._id },
                });

                // Update the post in the local posts state to include the new comment ID
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postID
                            ? {
                                  ...post,
                                  commentIDs: [
                                      ...post.commentIDs,
                                      createdComment._id,
                                  ],
                              }
                            : post
                    )
                );

                // If `selectedPost` is used separately, update it directly
                if (selectedPost && selectedPost._id === postID) {
                    setSelectedPost({
                        ...selectedPost,
                        commentIDs: [
                            ...selectedPost.commentIDs,
                            createdComment._id,
                        ],
                    });
                }
            }

            // 5. Hide the new comment page after adding
            setShowNewCommentPage(false);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    function countAllComments(commentIDs) {
        let count = commentIDs.length; // Start by counting the top-level comments

        // Loop through the comments and count replies recursively
        commentIDs.forEach((commentID) => {
            const comment = comments.find((c) => c._id === commentID); // Use the comments state

            if (comment && comment.commentIDs.length > 0) {
                // Recursively count replies (nested comments)
                count += countAllComments(comment.commentIDs);
            }
        });

        return count;
    }

    // function for search results
    const searchPosts = (searchTerms) => {
        // Trim and validate search terms
        const trimmedTerm = searchTerms.trim();
        if (!trimmedTerm) {
            setSearchResults(null);
            setSearchTerm("");
            return;
        }

        const terms = trimmedTerm.toLowerCase().split(" "); // Split terms by space for multi-term search

        // Filter posts based on terms
        const filteredPosts = posts.filter((post) => {
            // Search in title
            const matchTitle = terms.some((term) =>
                post.title?.toLowerCase().includes(term)
            );

            // Search in content
            const matchContent = terms.some((term) =>
                post.content?.toLowerCase().includes(term)
            );

            // Search in comments
            const matchComments = post.commentIDs?.some((commentID) => {
                const comment = comments.find((c) => c._id === commentID);
                return (
                    comment && // Ensure the comment exists
                    terms.some((term) =>
                        comment.content?.toLowerCase().includes(term)
                    )
                );
            });

            return matchTitle || matchContent || matchComments; // Return true if any match
        });


        // Update search state
        setSearchResults(filteredPosts);
        setSearchTerm(searchTerms);

        // Reset other states
        setSelectedCommunity(null);
        setSelectedPost(null);
        setCreatingCommunity(false);
        setShowNewPostPage(false);
        setShowNewCommentPage(false);
        setParentComment(null);
        setViewProfile(false);
    };

    // Handle submitting a new post
    const handleSubmitPost = async ({
        community,
        title,
        linkFlair,
        content,
        username,
    }) => {
        try {
            // Check if a custom flair is provided
            let linkFlairID = null;

            // If there's a custom flair (one not found in the current linkFlairs list)
            if (linkFlair && !linkFlairs.find((f) => f.content === linkFlair)) {
                // Add the custom flair to the database
                const newFlair = { content: linkFlair };
                const createdFlair = await ApiService.addOneLinkFlair(newFlair);

                // Update the state to include the new flair
                setLinkFlairs((prevFlairs) => [...prevFlairs, createdFlair]);

                // Use the new flair's ID for the post
                linkFlairID = createdFlair._id;
            } else {
                // If it's an existing flair, find its ID
                linkFlairID =
                    linkFlairs.find((f) => f.content === linkFlair)?._id ||
                    null;
            }

            const newPost = {
                title,
                content,
                linkFlairID,
                postedBy: username,
                postedDate: new Date(),
                commentIDs: [],
                views: 0,
            };

            // Add the new post to the database and get the created post with its `_id`
            const createdPost = await ApiService.addOnePost(newPost);

            // Update posts state immediately after adding the new post
            setPosts((prevPosts) => [createdPost, ...prevPosts]);

            // Update the community’s postIDs in the database
            const updatedCommunity = communities.find(
                (c) => c.name === community
            );
            if (updatedCommunity) {
                const updatedPostIDs = [
                    ...updatedCommunity.postIDs,
                    createdPost._id,
                ];
                await ApiService.updateCommunity(updatedCommunity._id, {
                    postIDs: updatedPostIDs,
                });

                // Fetch the updated community from the database
                const refreshedCommunity = await ApiService.getOneCommunity(
                    updatedCommunity._id
                );
                setCommunities((prevCommunities) =>
                    prevCommunities.map((c) =>
                        c._id === refreshedCommunity._id
                            ? refreshedCommunity
                            : c
                    )
                );
                setSelectedCommunity(refreshedCommunity);
            }

            // Close the create post form and go back to Community page
            setShowNewPostPage(false);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    // JWT authentication
    const [user, setUser] = useState(null);
    const [showLoginPage, setShowLoginPage] = useState(false); // Track whether login page is visible

    const handleLogin = async (email, password) => {
        try {
            console.log("Login initiated with:", { email, password });

            // Call the API to log in
            const { user, token } = await ApiService.login({ email, password });
            console.log("Login API returned:", { user, token });

            if (!user || !token) throw new Error("Invalid login response");

            // Save user and token to cookies
            Cookies.set("user", JSON.stringify(user), { expires: 0.5 }); // 30 minutes
            Cookies.set("token", token, { expires: 0.5 });
            console.log("User saved to cookie:", user);

            // Update state
            setUser(user);
            ApiService.setAuthToken(token);
            console.log("User state updated and token set:", user);

            // Hide the login page
            setShowLoginPage(false);
        } catch (err) {
            console.error("Login failed:", err.message);
            alert("Login failed. Please try again.");
        }
    };

    // Handle Logout
    const handleLogout = () => {
        logout();
        setUser(null);
        ApiService.setAuthToken(null);
        window.location.reload();
    };

    // Register View
    const [showRegisterPage, setShowRegisterPage] = useState(false);

    const handleRegister = async ({
        firstName,
        lastName,
        email,
        displayName,
        password,
    }) => {
        try {
            const newUser = await ApiService.register({
                firstName,
                lastName,
                email,
                displayName,
                password,
            });
            console.log("User registered successfully:", newUser);
        } catch (err) {
            throw err;
        }
    };

    const registerView = () => {
        setShowRegisterPage(true); // Show Register page
        setShowLoginPage(false); // Hide Login page
    };

    const handleGuestAccess = () => {
        setUser({ displayName: "Guest", isGuest: true }); // Set a default Guest user
        console.log("Logged in as Guest");
    };

    // Join Community
    const onJoinCommunity = async (communityId) => {
        try {
            const updatedCommunity = await ApiService.joinCommunity(
                communityId
            );
            // Update community state
            setCommunities((prev) =>
                prev.map((c) => (c._id === communityId ? updatedCommunity : c))
            );
            console.log("Community joined:", updatedCommunity);
            // Update the selected community in the state
            setSelectedCommunity((prevCommunity) =>
                prevCommunity && prevCommunity._id === updatedCommunity._id
                    ? updatedCommunity
                    : prevCommunity
            );
        } catch (err) {
            console.error("Error joining community:", err);
        }
    };

    const onLeaveCommunity = async (communityId) => {
        try {
            const updatedCommunity = await ApiService.leaveCommunity(
                communityId
            );
            console.log("Community left:", updatedCommunity);
            // Update community state
            setCommunities((prev) =>
                prev.map((c) => (c._id === communityId ? updatedCommunity : c))
            );
            // Update the selected community in the state
            setSelectedCommunity((prevCommunity) =>
                prevCommunity && prevCommunity._id === updatedCommunity._id
                    ? updatedCommunity
                    : prevCommunity
            );
        } catch (err) {
            console.error("Error leaving community:", err);
        }
    };

    // handle upvote/downvote
    const handleVote = async (id, type, isComment = false) => {
        if (!user || user.isGuest || user.reputation < 50) {
            alert("You need at least 50 reputation to vote.");
            return;
        }

        try {
            // Fetch the target item to determine current vote state
            const targetItem = isComment
                ? comments.find((comment) => comment._id === id)
                : posts.find((post) => post._id === id);

            const existingVote = targetItem.voters.find(
                (voter) => voter.userName === user.displayName
            );

            // Determine if this is an unvote
            const voteType = existingVote?.voteType === type ? "unvote" : type;

            // Send the vote request
            const updatedItem = isComment
                ? await ApiService.voteOnComment(id, voteType)
                : await ApiService.voteOnPost(id, voteType);

            console.log("Vote successful:", updatedItem);

            // Update the local state
            if (isComment) {
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === id
                            ? { ...comment, ...updatedItem }
                            : comment
                    )
                );
            } else {
                setSelectedPost((prevPost) => ({
                    ...prevPost,
                    ...updatedItem, // Merge updated post data
                }));
            }
        } catch (error) {
            console.error(
                "Error processing vote:",
                error.response?.data || error.message
            );
            alert("Error processing vote. Please try again.");
        }
    };

    return (
        <section className="phreddit">
            {/* Conditional rendering for Login and Register Pages */}
            {showLoginPage && (
                <LoginPage
                    onLogin={(email, password) =>
                        handleLogin(email, password, setUser, setShowLoginPage)
                    }
                    onCancel={() => setShowLoginPage(false)} // Close the LoginPage
                    onRegister={() => {
                        setShowLoginPage(false); // Hide login page
                        setShowRegisterPage(true); // Show register page
                    }}
                    setUser={setUser}
                />
            )}
            {showRegisterPage && (
                <RegisterPage
                    onCancel={() => {
                        setShowRegisterPage(false); // Hide register page
                    }}
                    onRegister={async (userData) => {
                        await handleRegister(userData); // Handle registration logic
                        setShowRegisterPage(false); // Close register page
                        setShowLoginPage(true); // Show login page after registration
                    }}
                />
            )}

            {/* Main Application Interface */}
            {!showLoginPage && !showRegisterPage && (
                <>
                    <Banner
                        searchFor={searchPosts}
                        onCreatePost={() => {
                            if (!user) {
                                setShowLoginPage(true); // Redirect to login if user is not authenticated
                                return;
                            }
                            setShowNewPostPage(true);
                            setCreatingNewPost(true);
                        }}
                        setCreatingCommunity={setCreatingCommunity}
                        setCreatingNewPost={setCreatingNewPost}
                        CreatingNewPost={creatingNewPost}
                        setSelectedCommunity={setSelectedCommunity}
                        onSelectHome={() => {
                            setSelectedCommunity(null);
                            setSelectedPost(null);
                            setSearchResults(null);
                            setViewProfile(false);
                            setSearchTerm("");
                        }}
                        setSelectedPost={setSelectedPost}
                        setShowNewPostPage={setShowNewPostPage}
                        showNewCommentPage={setShowNewCommentPage}
                        user={user} // Pass logged-in user state
                        onLogin={() => setShowLoginPage(true)} // Redirect to login page
                        onLogout={handleLogout} // Logout function
                        onRegister={registerView} // Redirect to register page
                        onGuestAccess={handleGuestAccess} // Log in as Guest
                        setViewProfile={setViewProfile}
                        onAdminPage={() => setViewAdminPage(true)}
                    />
                    <div style={{ display: "flex" }}>
                        <NavBar
                            communities={communities}
                            onSelectCommunity={(communityName) => {
                                const community = communities.find(
                                    (c) => c.name === communityName
                                );
                                setSelectedCommunity(community);
                                setSearchResults(null);
                                setCreatingNewPost(false);
                                setViewProfile(false);
                            }}
                            onSelectHome={() => {
                                setSelectedCommunity(null);
                                setSelectedPost(null);
                                setViewProfile(false);
                                setSearchResults(null);
                                setSearchTerm("");
                                setViewAdminPage(false);
                                setViewingOtherUser(null);
                            }}
                            isHomePage={
                                selectedCommunity === null ||
                                selectedCommunity === undefined
                            }
                            setCreatingCommunity={setCreatingCommunity}
                            setSelectedCommunity={setSelectedCommunity}
                            selectedCommunity={selectedCommunity}
                            creatingCommunity={creatingCommunity}
                            setSelectedPost={setSelectedPost}
                            showNewCommentPage={setShowNewCommentPage}
                            setShowNewPostPage={setShowNewPostPage}
                            setCreatingNewPost={setCreatingNewPost}
                            user={user}
                        />
                        <div style={{ flex: 1 }}>
                            {/* Conditional rendering of main views */}
                            {creatingCommunity ? (
                                <CreateCommunity
                                    communities={communities}
                                    handleCreateCommunity={
                                        handleCreateCommunity
                                    }
                                    onCancel={() => {
                                        setCreatingCommunity(false);
                                        setSelectedCommunity(null);
                                    }}
                                    user={user}
                                />
                            ) : showNewPostPage ? (
                                <CreatePost
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    onSubmitPost={handleSubmitPost}
                                    user={user}
                                />
                            ) : showNewCommentPage ? (
                                <NewCommentPage
                                    post={selectedPost}
                                    parentComment={parentComment}
                                    onSubmitComment={handleSubmitComment}
                                    user={user}
                                />
                            ) : selectedPost ? (
                                <PostPage
                                    post={selectedPost}
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    comments={comments}
                                    updatePostViews={updatePostViews}
                                    onReply={(comment) => {
                                        setParentComment(comment);
                                        setShowNewCommentPage(true);
                                    }}
                                    onAddComment={() => {
                                        setShowNewCommentPage(true);
                                        setParentComment(null);
                                    }}
                                    countAllComments={countAllComments}
                                    user={user}
                                    handleVote={handleVote}
                                />
                            ) : selectedCommunity ? (
                                <CommunityPage
                                    community={selectedCommunity}
                                    posts={posts}
                                    comments={comments}
                                    linkFlairs={linkFlairs}
                                    onSelectPost={setSelectedPost}
                                    countAllComments={countAllComments}
                                    user={user}
                                    onJoinCommunity={onJoinCommunity}
                                    onLeaveCommunity={onLeaveCommunity}
                                />
                            ) : searchResults ? (
                                <SearchResults
                                    posts={searchResults}
                                    searchTerms={searchTerms}
                                    communities={communities}
                                    comments={comments}
                                    linkFlairs={linkFlairs}
                                    onSelectPost={setSelectedPost}
                                    user={user}
                                />
                            ) : viewingOtherUser ? (
                                <ProfilePage
                                    posts={posts}
                                    comments={comments}
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    user={viewingOtherUser} // Pass the selected user to ProfilePage
                                    setCommunities={setCommunities}
                                    setPosts={setPosts}
                                    setComments={setComments}
                                    onNavigateBack={() => setViewingOtherUser(null)} // Navigate back to admin view
                                    viewingAsAdmin={true}
                                />
                            ) : viewAdminPage ? (
                                <AdminPage
                                    posts={posts}
                                    comments={comments}
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    user={user}
                                    setCommunities={setCommunities}
                                    setPosts={setPosts}
                                    setComments={setComments}
                                    onViewUser={setViewingOtherUser} // Pass the function to handle viewing
                                />
                            ) : viewProfile ? (
                                <ProfilePage
                                    posts={posts}
                                    comments={comments}
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    user={user}
                                    setCommunities={setCommunities}
                                    setPosts={setPosts}
                                    setComments={setComments}
                                    viewingAsAdmin={false}
                                />
                            ) : (
                                <HomePage
                                    posts={posts}
                                    comments={comments}
                                    communities={communities}
                                    linkFlairs={linkFlairs}
                                    onSelectPost={setSelectedPost}
                                    countAllComments={countAllComments}
                                    user={user}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}

export default App;
