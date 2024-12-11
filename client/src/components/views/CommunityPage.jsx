import React, { useState, useEffect } from "react";
import "../../stylesheets/CommunityPage.css";
import { formatTimeStamp } from "../formatTimeStamp";

const CommunityPage = ({
    community,
    posts,
    linkFlairs,
    onSelectPost,
    countAllComments,
    comments,
    user, // Added to check authentication and membership status
    onJoinCommunity, // Function to handle joining a community
    onLeaveCommunity, // Function to handle leaving a community
}) => {
    const [sortedPosts, setSortedPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState("Newest");

    const sortPosts = (postsToSort) => {
        if (sortOrder === "Newest") {
            return [...postsToSort].sort(
                (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
            );
        }
        if (sortOrder === "Oldest") {
            console.log(user);
            return [...postsToSort].sort(
                (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
            );
        }
        if (sortOrder === "Active") {
            return [...postsToSort]
                .map((post) => {
                    const mostRecentCommentDate = getMostRecentCommentDate(
                        post.commentIDs
                    );
                    post.mostRecentActivity =
                        mostRecentCommentDate || new Date(post.postedDate);
                    return post;
                })
                .sort(
                    (a, b) =>
                        b.mostRecentActivity - a.mostRecentActivity ||
                        b.postedDate - a.postedDate
                );
        }
        return postsToSort;
    };

    useEffect(() => {
        // Filter posts that belong to this community
        const communityPosts = posts.filter((post) =>
            community?.postIDs.includes(post._id)
        );

        // Sort the community posts based on the current sort order
        const sorted = sortPosts(communityPosts);
        setSortedPosts(sorted);
    }, [sortOrder, community, posts, comments]);

    const getMostRecentCommentDate = (commentIDs) => {
        if (!commentIDs || commentIDs.length === 0) return null;

        let mostRecentDate = null;

        commentIDs.forEach((commentID) => {
            const comment = comments.find((c) => c._id === commentID);
            if (comment) {
                const commentDate = new Date(comment.commentedDate);
                const nestedMostRecent = getMostRecentCommentDate(
                    comment.commentIDs
                );
                mostRecentDate =
                    !mostRecentDate || commentDate > mostRecentDate
                        ? commentDate
                        : mostRecentDate;
                mostRecentDate =
                    !mostRecentDate ||
                    (nestedMostRecent && nestedMostRecent > mostRecentDate)
                        ? nestedMostRecent
                        : mostRecentDate;
            }
        });

        return mostRecentDate;
    };

    const isMember = community.members.includes(user?.displayName);

    return (
        <div className="community-page main-content">
            <div className="community-header">
                <h2 id="community-title">{community.name}</h2>
                {user && !user.isGuest && (
                    <div className="membership-buttons">
                        {!isMember ? (
                            <button
                                className="join-community-btn"
                                onClick={() => onJoinCommunity(community._id)}>
                                Join Community
                            </button>
                        ) : (
                            <button
                                className="leave-community-btn"
                                onClick={() => onLeaveCommunity(community._id)}>
                                Leave Community
                            </button>
                        )}
                    </div>
                )}
            </div>
            <p id="community-description">{community.description}</p>
            <div className="community-header">
                <div className="information-section">
                    <p>
                        Created by <strong>{community.members[0]}</strong>{" "}
                        {formatTimeStamp(new Date(community.startDate))}
                    </p>
                    <p>{community.members.length} members</p>
                </div>
                <div className="sort-buttons">
                    <button
                        className={sortOrder === "Newest" ? "active" : ""}
                        onClick={() => setSortOrder("Newest")}>
                        Newest
                    </button>
                    <button
                        className={sortOrder === "Oldest" ? "active" : ""}
                        onClick={() => setSortOrder("Oldest")}>
                        Oldest
                    </button>
                    <button
                        className={sortOrder === "Active" ? "active" : ""}
                        onClick={() => setSortOrder("Active")}>
                        Active
                    </button>
                </div>
            </div>

            <h3 className="post-count-header">{sortedPosts.length} posts</h3>

            <div className="post-list">
                {sortedPosts.map((post) => (
                    <div
                        key={post._id}
                        className="post"
                        onClick={() => onSelectPost(post)}>
                        <div className="post-header">
                            <span>{post.postedBy}</span> |{" "}
                            <span>
                                {formatTimeStamp(new Date(post.postedDate))}
                            </span>
                        </div>
                        <h3>{post.title}</h3>
                        {post.linkFlairID && (
                            <span className="link-flair">
                                {
                                    linkFlairs.find(
                                        (lf) => lf._id === post.linkFlairID
                                    )?.content
                                }
                            </span>
                        )}
                        <p className="post-snippet">
                            {post.content.slice(0, 80)}...
                        </p>
                        <div className="post-stats">
                            <span> ↑ {post.voteCount} ↓ </span> |{" "}
                            <span>{post.views} views</span> |{" "}
                            <span>
                                {countAllComments(post.commentIDs)} comments
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityPage;
