import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
    caption: String,
    videoUrl: String,
    thumbnailUrl: String,
    cloudinaryId: String,
    likes: {
        type: Date, default: Date.now
    },
    createdAt: {
        type: Date, default: Date.now
    }
});

const Video = mongoose.model("Video", VideoSchema);
export default Video;