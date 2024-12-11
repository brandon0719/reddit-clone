import { formatTimeStamp } from "../formatTimeStamp";
import "../../stylesheets/PostPage.css";
import { useState, useEffect } from "react";
import React from "react";

const PostPage = ({
    post,
    communities,
    linkFlairs,
    comments,
    updatePostViews,
    onReply,
    onAddComment,
    countAllComments,
    user,
    handleVote,
}) => {
    const [viewUpdated, setViewUpdated] = useState(false);

    // Increment post views only once when the component mounts
    useEffect(() => {
        if (!viewUpdated) {
            updatePostViews(post._id);
            setViewUpdated(true);
        }
    }, [post, viewUpdated, updatePostViews]);

    useEffect(() => {
        // This should log whenever comments update
        console.log("Rendering PostPage with updated comments:", comments);
    }, [comments]);

    const handleAddComment = () => {
        onAddComment();
    };

    const handleReply = (comment) => {
        onReply(comment);
    };

    // Recursive function to render threaded comments, sorted by newest date first
    const renderComments = (commentIDs, level = 0) => {
        const sortedCommentIDs = commentIDs
            .map((id) => comments.find((c) => c._id === id))
            .filter(Boolean)
            .sort(
                (a, b) => new Date(b.commentedDate) - new Date(a.commentedDate)
            );

        return sortedCommentIDs.map((comment) => {
            // console.log(user.displayName)
            // console.log(comment.voters)
            return (
                <div
                    key={comment._id}
                    className="comment"
                    style={{ marginLeft: `${level * 20}px` }}>
                    <div className="comment-content">
                        <div className="comment-header">
                            <span>{comment.commentedBy}</span> |{" "}
                            <span>
                                {formatTimeStamp(
                                    new Date(comment.commentedDate)
                                )}
                            </span>
                        </div>
                        <p>{comment.content}</p>
                        <div className="vote-section">
                            <button
                                className={`vote-btn ${
                                    comment.voters.some(
                                        (v) =>
                                            v.userName === user.displayName &&
                                            v.voteType === "upvote"
                                    )
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleVote(comment._id, "upvote", true)
                                }
                                disabled={
                                    !user ||
                                    user.isGuest ||
                                    user.reputation < 50 ||
                                    comment.commentedBy === user.displayName
                                }>
                                ↑
                            </button>
                            <span className="vote-count">
                                {comment.voteCount}
                            </span>
                            <button
                                className={`vote-btn ${
                                    comment.voters.some(
                                        (v) =>
                                            v.userName === user.displayName &&
                                            v.voteType === "downvote"
                                    )
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleVote(comment._id, "downvote", true)
                                }
                                disabled={
                                    !user ||
                                    user.isGuest ||
                                    user.reputation < 50 ||
                                    comment.commentedBy === user.displayName
                                }>
                                ↓
                            </button>
                        </div>
                        {" • "}
                        <button
                            className="comment-btn"
                            onClick={() => (user ? handleReply(comment) : null)}
                            disabled={!user || user.isGuest}>
                            Reply
                        </button>
                    </div>
                    {comment.commentIDs.length > 0 && (
                        <div className="comment-replies">
                            {renderComments(comment.commentIDs, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const community = communities.find((c) => c.postIDs.includes(post._id));
    return (
        <div className="post-page main-content">
            <div className="post-header">
                <h2 className="post-community">
                    {community.name} |{" "}
                    {formatTimeStamp(new Date(post.postedDate))}
                </h2>
                <p>Posted by {post.postedBy}</p>
                <h1 className="post-title">{post.title}</h1>
                {post.linkFlairID && (
                    <p className="link-flair">
                        {
                            linkFlairs.find((f) => f._id === post.linkFlairID)
                                ?.content
                        }
                    </p>
                )}
                <p id="post-content">{post.content}</p>
                <div className="post-stats">
                    <div className="vote-section">
                        <button
                            className={`vote-btn ${
                                post.voters.some(
                                    (v) =>
                                        v.userName === user.displayName &&
                                        v.voteType === "upvote"
                                )
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => handleVote(post._id, "upvote")}
                            disabled={
                                !user ||
                                user.isGuest ||
                                user.reputation < 50 ||
                                post.postedBy === user.displayName
                            }>
                            ↑
                        </button>
                        <span className="vote-count">{post.voteCount}</span>
                        <button
                            className={`vote-btn ${
                                post.voters.some(
                                    (v) =>
                                        v.userName === user.displayName &&
                                        v.voteType === "downvote"
                                )
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => handleVote(post._id, "downvote")}
                            disabled={
                                !user ||
                                user.isGuest ||
                                user.reputation < 50 ||
                                post.postedBy === user.displayName
                            }>
                            ↓
                        </button>
                    </div>
                    {" | "}
                    <span>{post.views + 1} views</span> |{" "}
                    <span>{countAllComments(post.commentIDs)} comments</span>
                </div>
                <button
                    className="comment-btn"
                    onClick={user ? handleAddComment : null}
                    disabled={!user || user.isGuest}>
                    Add a comment
                </button>
            </div>

            <hr />

            <div className="comments-section">
                {renderComments(post.commentIDs)}
            </div>
        </div>
    );
};

export default PostPage;
