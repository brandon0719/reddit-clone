import Community from "./models/communities.js";
import Post from "./models/posts.js";
import Comment from "./models/comments.js";
import LinkFlair from "./models/linkflairs.js";
import User from "./models/users.js";

// Communities
async function getAllCommunities(req, res) {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function getOneCommunity(req, res) {
    try {
        const community = await Community.findById(req.params.id);
        res.json(community);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function addOneCommunity(req, res) {
    try {
        const newCommunity = await Community.create(req.body);
        res.json(newCommunity);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function updateCommunity(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find the community by ID and update it
        const updatedCommunity = await Community.findByIdAndUpdate(
            id,
            updates,
            {
                new: true, // Return the updated document
                runValidators: true, // Ensure validators are run
            }
        );

        if (!updatedCommunity) {
            return res.status(404).json({ message: "Community not found." });
        }

        res.json(updatedCommunity);
    } catch (error) {
        console.error("Error updating community:", error);
        res.status(500).json({ message: "Failed to update community.", error });
    }
}

async function joinCommunity(req, res) {
    try {
        const { id } = req.params; // Community ID
        const userDisplayName = req.user.displayName; // Extracted from the JWT

        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        if (community.members.includes(userDisplayName)) {
            return res.status(400).json({ message: "Already a member" });
        }

        community.members.push(userDisplayName); // Add displayName
        await community.save();

        res.status(200).json(community);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

async function leaveCommunity(req, res) {
    try {
        const { id } = req.params; // Community ID
        const userDisplayName = req.user.displayName; // Extracted from the JWT

        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        if (!community.members.includes(userDisplayName)) {
            return res.status(400).json({ message: "Not a member" });
        }

        community.members = community.members.filter(
            (member) => member !== userDisplayName
        ); // Remove displayName
        await community.save();

        res.status(200).json(community);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteCommunity(req, res) {
    const { id } = req.params; // Extract the community ID from the request parameters

    try {
        // Find the community
        const community = await Community.findById(id).populate("postIDs");

        if (!community) {
            return res.status(404).json({ error: "Community not found." });
        }

        // Delete related comments for each post
        const postIDs = community.postIDs.map((post) => post._id);
        await Comment.deleteMany({
            _id: { $in: postIDs.flatMap((postID) => postID.commentIDs) },
        });

        // Delete related posts
        await Post.deleteMany({ _id: { $in: postIDs } });

        // Delete the community
        await Community.findByIdAndDelete(id);

        res.status(200).json({
            message: "Community, posts, and comments deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting community:", error);
        res.status(500).json({ error: "Failed to delete community." });
    }
}


// Posts
async function getAllPosts(req, res) {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function getOnePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        res.json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function addOnePost(req, res) {
    try {
        const newPost = await Post.create(req.body);
        res.json(newPost);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function updatePost(req, res) {
    try {
        // `req.body` contains the update data, such as { $push: { commentIDs: newCommentID } }
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id, // ID of the post to update
            req.body, // Update data
            { new: true, runValidators: true } // Options to return the updated document and run validators
        );

        res.json(updatedPost);
    } catch (error) {
        console.log("Error updating post:", error);
        res.status(400).json({ message: "Failed to update post", error });
    }
}

async function deletePost(req, res) {
    try {
        const { id } = req.params;
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully." });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function incrementPostViews(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.views += 1;
            await post.save();
            res.json(post);
        } else {
            res.status(404).json({ message: "Post not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

async function voteOnPost(req, res) {
    const { id } = req.params; // Post ID
    const { voteType } = req.body; // "upvote", "downvote", or "unvote"
    const user = req.user;

    if (!user || user.reputation < 50) {
        return res
            .status(403)
            .json({ message: "Insufficient reputation to vote." });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Prevent voting on own post
        if (post.postedBy === user.displayName) {
            return res
                .status(403)
                .json({ message: "You cannot vote on your own post." });
        }

        const creator = await User.findOne({ displayName: post.postedBy });
        if (!creator) {
            return res.status(404).json({ message: "Post creator not found." });
        }

        // Find user's existing vote
        const existingVote = post.voters.find(
            (voter) => voter.userName === user.displayName
        );

        let voteChange = 0;

        if (existingVote) {
            // User has already voted
            if (voteType === "unvote") {
                // Remove vote
                voteChange = existingVote.voteType === "upvote" ? -1 : 1;
                post.voters = post.voters.filter(
                    (voter) => voter.userName !== user.displayName
                );
            } else if (voteType !== existingVote.voteType) {
                // Change vote
                voteChange = voteType === "upvote" ? 2 : -2; // +2 for switching to upvote, -2 for switching to downvote
                existingVote.voteType = voteType;
            } else {
                // No change needed
                return res.status(200).json(post);
            }
        } else if (voteType !== "unvote") {
            // New vote
            voteChange = voteType === "upvote" ? 1 : -1;
            post.voters.push({ userName: user.displayName, voteType });
        }

        // Update vote count
        post.voteCount += voteChange;

        // Update creator reputation
        if (voteChange !== 0) {
            creator.reputation += voteChange > 0 ? 5 : voteChange < 0 ? -10 : 0;
        }

        await Promise.all([post.save(), creator.save()]);

        res.json(post);
    } catch (err) {
        console.error("Error processing vote:", err);
        res.status(500).json({ message: "Server error." });
    }
}


// Comments
async function getAllComments(req, res) {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function getOneComment(req, res) {
    try {
        const comment = await Comment.findById(req.params.id);
        res.json(comment);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function addOneComment(req, res) {
    try {
        const newComment = await Comment.create(req.body);
        res.json(newComment);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function updateComment(req, res) {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id, // ID of the comment to update
            req.body, // Update data
            { new: true, runValidators: true } // Options to return the updated document and run validators
        );

        res.json(updatedComment);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function deleteComment(req, res) {
    try {
        const { id } = req.params;
        await Comment.findByIdAndDelete(id);
        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function voteOnComment(req, res) {
    const { id } = req.params; // Comment ID
    const { voteType } = req.body; // "upvote", "downvote", or "unvote"
    const user = req.user;

    if (!user || user.reputation < 50) {
        return res
            .status(403)
            .json({ message: "Insufficient reputation to vote." });
    }

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        const creator = await User.findOne({
            displayName: comment.commentedBy,
        });
        if (!creator) {
            return res
                .status(404)
                .json({ message: "Comment creator not found." });
        }

        // Find existing vote by the user
        const existingVoteIndex = comment.voters.findIndex(
            (voter) => voter.userName === user.displayName
        );

        let voteChange = 0;

        if (existingVoteIndex !== -1) {
            // User has already voted
            const existingVote = comment.voters[existingVoteIndex];

            if (voteType === "unvote") {
                // Remove vote
                voteChange = existingVote.voteType === "upvote" ? -1 : 1;
                comment.voters.splice(existingVoteIndex, 1);
            } else if (voteType === existingVote.voteType) {
                // No action needed if the vote is the same
                return res.status(200).json(comment);
            } else {
                // Change vote
                voteChange = voteType === "upvote" ? 2 : -2;
                existingVote.voteType = voteType;
            }
        } else if (voteType !== "unvote") {
            // Add a new vote
            voteChange = voteType === "upvote" ? 1 : -1;
            comment.voters.push({ userName: user.displayName, voteType });
        }

        // Update vote count and creator reputation
        comment.voteCount += voteChange;
        creator.reputation +=
            voteType === "upvote" ? 5 : voteType === "downvote" ? -10 : 0;

        await comment.save();
        await creator.save();

        res.json(comment);
    } catch (err) {
        console.error("Error processing vote:", err);
        res.status(500).json({ message: "Server error." });
    }
}


// LinkFlairs
async function getAllLinkFlairs(req, res) {
    try {
        const linkFlairs = await LinkFlair.find();
        res.json(linkFlairs);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function getOneLinkFlair(req, res) {
    try {
        const linkFlair = await LinkFlair.findById(req.params.id);
        res.json(linkFlair);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

async function addOneLinkFlair(req, res) {
    try {
        const newLinkFlair = await LinkFlair.create(req.body);
        res.json(newLinkFlair);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}

// Users

async function getAllUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

async function getCommunitiesByUser(req, res) {
    const { displayName } = req.query;
    try {
        const communities = await Community.find({ createdBy: displayName });
        res.status(200).json(communities);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

async function getPostsByUser(req, res) {
    const { displayName } = req.query;
    try {
        const posts = await Post.find({ postedBy: displayName });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

async function getCommentsByUser(req, res) {
    const { displayName } = req.query;
    try {
        const comments = await Comment.find({ commentedBy: displayName });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteUser(req, res) {
    const { id, displayName } = req.params; // Extract parameters
    try {
        if (!id || !displayName) {
            return res
                .status(400)
                .json({ message: "Missing user ID or displayName" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete all related data
        const [deletedCommunities, deletedPosts, deletedComments] =
            await Promise.all([
                Community.deleteMany({ createdBy: displayName }),
                Post.deleteMany({ postedBy: displayName }),
                Comment.deleteMany({ commentedBy: displayName }),
            ]);

        res.status(200).json({
            message: "User deleted successfully",
            details: {
                communitiesDeleted: deletedCommunities.deletedCount,
                postsDeleted: deletedPosts.deletedCount,
                commentsDeleted: deletedComments.deletedCount,
            },
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// Export all controller functions
const MainController = {
    getAllCommunities,
    getOneCommunity,
    addOneCommunity,
    getAllPosts,
    getOnePost,
    addOnePost,
    incrementPostViews,
    getAllComments,
    getOneComment,
    addOneComment,
    getAllLinkFlairs,
    getOneLinkFlair,
    addOneLinkFlair,
    updatePost,
    updateComment,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    voteOnPost,
    voteOnComment,
    deleteCommunity,
    deleteComment,
    deletePost,
    getAllUsers,
    getCommunitiesByUser,
    getPostsByUser,
    getCommentsByUser,
    deleteUser,
};

export default MainController;
