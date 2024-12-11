import React, { useState, useEffect } from "react";
import { formatTimeStamp } from "../formatTimeStamp";
import "../../stylesheets/SearchResults.css";

const SearchResults = ({
    posts,
    communities,
    linkFlairs,
    onSelectPost,
    searchTerms,
    comments,
    user,
}) => {
    const [userPosts, setUserPosts] = useState([]);
    const [otherPosts, setOtherPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState("Newest");

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

    const sortPosts = (posts, sortOrder) => {
        if (sortOrder === "Newest") {
            return [...posts].sort(
                (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
            );
        }
        if (sortOrder === "Oldest") {
            return [...posts].sort(
                (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
            );
        }
        if (sortOrder === "Active") {
            return [...posts]
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
        return posts;
    };

    useEffect(() => {
        if (user) {
            // Separate posts into user's communities and other communities
            const userCommunityNames = communities
                .filter((community) =>
                    community.members.includes(user.displayName)
                )
                .map((community) => community.name);

            const userCommunityPosts = posts.filter((post) =>
                userCommunityNames.includes(
                    communities.find((community) =>
                        community.postIDs.includes(post._id)
                    )?.name
                )
            );

            const otherCommunityPosts = posts.filter(
                (post) =>
                    !userCommunityNames.includes(
                        communities.find((community) =>
                            community.postIDs.includes(post._id)
                        )?.name
                    )
            );

            setUserPosts(sortPosts(userCommunityPosts, sortOrder));
            setOtherPosts(sortPosts(otherCommunityPosts, sortOrder));
            console.log(userPosts);
            console.log(otherPosts);
        }
    }, [posts, communities, sortOrder, user]);
    return (
        <div className="search-results main-content">
            <div className="header">
                <h1 className="all-post-header">
                    {posts.length > 0
                        ? `Results for: ${searchTerms}`
                        : `No results found for: ${searchTerms}`}
                </h1>
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

            <h3 className="post-count-header">
                {userPosts.length + otherPosts.length} posts
            </h3>

            <div className="post-list">
                {/* User's Community Posts */}
                {userPosts.length > 0 && (
                    <>
                        <h3 className="sublist-header">
                            Posts from Your Communities
                        </h3>
                        {userPosts.map((post) => (
                            <PostItem
                                key={post._id}
                                post={post}
                                communities={communities}
                                linkFlairs={linkFlairs}
                                onSelectPost={onSelectPost}
                                comments={comments}
                            />
                        ))}
                    </>
                )}

                {/* Other Community Posts */}
                {otherPosts.length > 0 && (
                    <>
                        <h3 className="sublist-header">
                            Posts from Other Communities
                        </h3>
                        {otherPosts.map((post) => (
                            <PostItem
                                key={post._id}
                                post={post}
                                communities={communities}
                                linkFlairs={linkFlairs}
                                onSelectPost={onSelectPost}
                                comments={comments}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

const PostItem = ({
    post,
    communities,
    linkFlairs,
    onSelectPost,
    comments,
}) => {
    const community = communities.find((c) => c.postIDs.includes(post._id));
    const linkFlair = linkFlairs.find((lf) => lf._id === post.linkFlairID);

    return (
        <div className="post" onClick={() => onSelectPost(post)}>
            <div className="post-header">
                <span>{community.name}</span> | <span>{post.postedBy}</span> |{" "}
                <span>{formatTimeStamp(new Date(post.postedDate))}</span>
            </div>
            <h3>{post.title}</h3>
            {post.linkFlairID && (
                <span className="link-flair">{linkFlair?.content}</span>
            )}
            <p className="post-snippet">{post.content.slice(0, 80)}...</p>
            <div className="post-stats">
                <span> ↑ {post.voteCount} ↓ </span> |{" "}
                <span>{post.views} views</span> |{" "}
                <span>{post.commentIDs.length} comments</span>
            </div>
        </div>
    );
};

export default SearchResults;
