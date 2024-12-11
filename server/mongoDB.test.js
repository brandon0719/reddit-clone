const mongoose = require("mongoose");
const Post = require("./models/posts.js"); 
const Comment = require("./models/comments.js"); 

describe("MongoDB Post Deletion", () => {
    beforeAll(async () => {
        await mongoose.connect("mongodb://localhost:27017/testdb", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    test("Should delete a post and all its comments", async () => {
        // Create a post
        const post = await Post.create({
            title: "Test Post",
            content: "This is a test post",
            postedBy: "testUser",
        });

        // Create comments
        const comment1 = await Comment.create({
            content: "Test Comment 1",
            commentedBy: "user1",
            postID: post._id,
        });

        const comment2 = await Comment.create({
            content: "Test Comment 2",
            commentedBy: "user2",
            postID: post._id,
            parentID: comment1._id,
        });

        // Delete the post
        await Post.deleteOne({ _id: post._id });
        await Comment.deleteMany({ postID: post._id });

        // Verify the deletion
        const deletedPost = await Post.findById(post._id);
        const deletedComments = await Comment.find({ postID: post._id });

        expect(deletedPost).toBeNull();
        expect(deletedComments.length).toBe(0);
    });
});
