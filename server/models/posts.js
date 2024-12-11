import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    linkFlairID: { type: Schema.Types.ObjectId, ref: "LinkFlair" },
    postedBy: { type: String, required: true },
    postedDate: { type: Date, default: Date.now },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    views: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    voters: [
        {
            userName: { type: String, required: true },
            voteType: { type: String, enum: ["upvote", "downvote","unvote"] }, 
        },
    ],
});

const PostModel = mongoose.model("Post", PostSchema);
export default PostModel