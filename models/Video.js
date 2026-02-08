
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Video', videoSchema);