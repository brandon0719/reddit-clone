// Community Document Schema
import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    postIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
    startDate: { type: Date, default: Date.now },
    members: [{ type: String }], 
    memberCount: { type: Number, default: 0 },
});

const CommunityModel = mongoose.model("Community", CommunitySchema);
export default CommunityModel;
