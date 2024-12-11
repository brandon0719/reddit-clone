// Comment Document Schema
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: { type: String, required: true },
    commentIDs: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentedBy: { type: String, required: true },
    commentedDate: { type: Date, default: Date.now },
    voteCount: { type: Number, default: 0 },
    voters: [
        {
            userName: { type: String, required: true },
            voteType: { type: String, enum: ["upvote", "downvote", "unvote"] }, // Track vote type
        },
    ],
});

const CommentModel = mongoose.model("Comment", CommentSchema);
export default CommentModel;