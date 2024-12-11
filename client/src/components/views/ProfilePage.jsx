import React, { useState, useEffect } from "react";
import "../../stylesheets/ProfilePage.css";
import EditCommunity from "./EditCommunity.jsx";
import EditComment from "./EditComment.jsx";
import EditPost from "./EditPost.jsx";
import ApiService from "../../services/ApiService.jsx";

const ProfilePage = ({
    posts,
    comments,
    communities,
    linkFlairs,
    user,
    setCommunities,
    setPosts,
    setComments,
    onNavigateBack,
    viewingAsAdmin,
}) => {
    const [activeSection, setActiveSection] = useState("communities");
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [userCommunities, setUserCommunities] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);

    const userComments = comments.filter(
        (comment) => comment.commentedBy === user.displayName
    );

    // Calculate user's communities whenever `communities` or `user` changes
    useEffect(() => {
        const updatedUserCommunities = communities.filter(
            (community) => community.members[0] === user.displayName
        );
        setUserCommunities(updatedUserCommunities);
    }, [communities, user, posts]);

    // Community CRUD operations
    const handleEditCommunity = (community) => {
        setSelectedCommunity(community);
    };

    const handleSaveCommunity = async (updatedCommunity) => {
        try {
            const response = await ApiService.updateCommunity(
                updatedCommunity._id,
                updatedCommunity
            );
            setCommunities((prevCommunities) =>
                prevCommunities.map((community) =>
                    community._id === updatedCommunity._id
                        ? response
                        : community
                )
            );
            setSelectedCommunity(null);
        } catch (error) {
            console.error("Error saving community:", error);
        }
    };

    const handleDeleteCommunity = async (communityId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this community with all of its posts and comments?"
        );

        if (!confirmDelete) return;

        try {
            // Fetch the community details to get the postIDs
            const community = communities.find(
                (comm) => comm._id === communityId
            );

            if (!community) {
                alert("Community not found in state.");
                return;
            }
            const commentIds = community.postIDs.reduce((acc, postId) => {
                const post = posts.find((post) => post._id === postId);
                return acc.concat(post.commentIDs);
            }, []);

            // Call the API to delete the community
            await ApiService.deleteCommunity(communityId);

            // Delete all comments associated with the community
            for (const commentId of commentIds) {
                handleDeleteComment(commentId);
            }

            // Update the posts state by removing posts associated with the deleted community
            setPosts((prevPosts) =>
                prevPosts.filter(
                    (post) => !community.postIDs.includes(post._id)
                )
            );

            // Update the communities state
            setCommunities((prevCommunities) =>
                prevCommunities.filter((comm) => comm._id !== communityId)
            );

            console.log(`Community with ID ${communityId} deleted.`);
        } catch (error) {
            console.error("Error deleting community:", error);
            alert("Failed to delete the community. Please try again.");
        }
    };

    // Comment CRUD operations
    const handleEditComment = (comment) => {
        setSelectedComment(comment);
    };

    const handleSaveComment = async (updatedComment) => {
        try {
            const response = await ApiService.updateComment(
                updatedComment._id,
                updatedComment
            );
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === updatedComment._id ? response : comment
                )
            );
            setSelectedComment(null);
        } catch (error) {
            console.error("Error saving comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmDelete) return;

        try {
            const parentComment = comments.find(
                (comment) => comment._id === commentId
            );
            const subComments = parentComment.commentIDs;
            // Delete all sub-comments recursively
            for (const subCommentId of subComments) {
                await ApiService.deleteComment(subCommentId);
                // Recursively delete sub-comments of the sub-comment
                const nestedSubComments =
                    comments.find((comment) => comment._id === subCommentId)
                        ?.commentIDs || [];
                for (const nestedSubCommentId of nestedSubComments) {
                    await ApiService.deleteComment(nestedSubCommentId);
                }
            }

            // Delete the parent comment
            await ApiService.deleteComment(commentId);

            // Update state to remove all deleted comments
            setComments((prevComments) =>
                prevComments.filter(
                    (comment) =>
                        comment._id !== commentId &&
                        !subComments.includes(comment._id) &&
                        !subComments.some((id) =>
                            (
                                comments.find((c) => c._id === id)
                                    ?.commentIDs || []
                            ).includes(comment._id)
                        )
                )
            );
            console.log(`Comment with ID ${commentId} deleted.`);
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete the comment. Please try again.");
        }
    };

    // Post CRUD operations
    const handleEditPost = (post) => {
        setSelectedPost(post);
    };

    const handleSavePost = async (updatedPost) => {
        console.log("Updated post:", updatedPost);
        try {
            const response = await ApiService.updatePost(
                updatedPost._id,
                updatedPost
            );
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === updatedPost._id ? response : post
                )
            );
            setSelectedPost(null);
        } catch (error) {
            console.error("Error saving post:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmDelete) return;

        try {
            await ApiService.deletePost(postId);
            setPosts((prevPosts) =>
                prevPosts.filter((post) => post._id !== postId)
            );
            console.log(`Post with ID ${postId} deleted.`);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete the post. Please try again.");
        }
    };

    const handleCancelEdit = () => {
        setSelectedCommunity(null);
        setSelectedComment(null);
        setSelectedPost(null);
    };

    if (selectedCommunity) {
        return (
            <EditCommunity
                community={selectedCommunity}
                onSave={handleSaveCommunity}
                communities={communities}
                onCancel={handleCancelEdit}
            />
        );
    }

    if (selectedComment) {
        return (
            <EditComment
                comment={selectedComment}
                onSave={handleSaveComment}
                onCancel={handleCancelEdit}
            />
        );
    }

    if (selectedPost) {
        return (
            <EditPost
                post={selectedPost}
                onSave={handleSavePost}
                onCancel={handleCancelEdit}
                linkFlairs={linkFlairs}
                communities={communities}
            />
        );
    }

    return (
        <div className="main-content">
            <div className="profile-page">
                {viewingAsAdmin && onNavigateBack && (
                    <button className="back-button" onClick={onNavigateBack}>
                        Back to Admin Panel
                    </button>
                )}
                <div className="profile-header">
                    <h2 id="profile-name">{user.displayName}'s Profile</h2>
                    <p>
                        {user.firstName.charAt(0).toUpperCase() +
                            user.firstName.slice(1)}{" "}
                        {user.lastName.charAt(0).toUpperCase() +
                            user.lastName.slice(1)}
                    </p>
                    <p>Email: {user.email}</p>
                    <p>
                        Member since:{" "}
                        {new Date(user.dateJoined).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <p>Reputation: {user.reputation}</p>
                </div>

                <div className="profile-buttons">
                    <button
                        className={
                            activeSection === "communities" ? "active" : ""
                        }
                        onClick={() => setActiveSection("communities")}>
                        Communities
                    </button>
                    <button
                        className={activeSection === "posts" ? "active" : ""}
                        onClick={() => setActiveSection("posts")}>
                        Posts
                    </button>
                    <button
                        className={activeSection === "comments" ? "active" : ""}
                        onClick={() => setActiveSection("comments")}>
                        Comments
                    </button>
                </div>

                <div className="profile-content">
                    {activeSection === "posts" && (
                        <div className="user-posts">
                            <h3>Your Posts</h3>
                            <hr className="divider" />
                            {posts.filter(
                                (post) => post.postedBy === user.displayName
                            ).length > 0 ? (
                                posts
                                    .filter(
                                        (post) =>
                                            post.postedBy === user.displayName
                                    )
                                    .map((post) => (
                                        <div
                                            key={post._id}
                                            className="post-item">
                                            <button
                                                className="edit-button"
                                                onClick={() =>
                                                    handleEditPost(post)
                                                }>
                                                {post.title}
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    handleDeletePost(post._id)
                                                }>
                                                Delete
                                            </button>
                                        </div>
                                    ))
                            ) : (
                                <p>No posts yet.</p>
                            )}
                        </div>
                    )}
                    {activeSection === "comments" && (
                        <div className="user-comments">
                            <h3>Your Comments</h3>
                            <hr className="divider" />
                            {userComments.length > 0 ? (
                                userComments.map((comment) => {
                                    // Find the post title associated with this comment
                                    const associatedPost = posts.find((post) =>
                                        post.commentIDs.includes(comment._id)
                                    );
                                    const postTitle = associatedPost
                                        ? associatedPost.title
                                        : "Unknown Post";
                                    return (
                                        <div
                                            key={comment._id}
                                            className="comment-item">
                                            <div className="comment-content">
                                                <p className="comment-post-title">
                                                    <strong>{postTitle}</strong>
                                                </p>
                                                <p className="comment-text">
                                                    {comment.content.slice(
                                                        0,
                                                        20
                                                    )}
                                                    ...
                                                </p>
                                            </div>
                                            <div className="comment-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEditComment(
                                                            comment
                                                        )
                                                    }>
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment._id
                                                        )
                                                    }>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No comments yet.</p>
                            )}
                        </div>
                    )}
                    {activeSection === "communities" && (
                        <div className="user-communities">
                            <h3>Your Communities</h3>
                            <hr className="divider" />
                            {userCommunities.length > 0 ? (
                                userCommunities.map((community) => (
                                    <div
                                        key={community._id}
                                        className="community-item">
                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                handleEditCommunity(community)
                                            }>
                                            {community.name}
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                handleDeleteCommunity(
                                                    community._id
                                                )
                                            }>
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No communities yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
