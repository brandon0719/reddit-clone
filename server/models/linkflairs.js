import mongoose from "mongoose";

const LinkFlairSchema = new mongoose.Schema({
    content: { type: String, required: true },
});

const LinkFlairModel = mongoose.model("LinkFlair", LinkFlairSchema);
export default LinkFlairModel;
