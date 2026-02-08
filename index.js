import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv, { config } from "dotenv";
import { v2 as cloudinary, v2 } from 'cloudinary';
import multer from "multer";
import Video from "./models/Video.js"
import { connectDB } from "./lib/db.js";

config();

const app = express();
app.use(cors());
app.use(express.json())
connectDB()

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true
// });

const storage = multer.diskStorage({})
const upload = multer({ storage })


app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'reels',
            eager: [
                { streaming_profile: "hd", format: "m3u8" },
                { width: 300, height: 500, crop: "pad", format: "jpg" }
            ],
            eager_async: true
        })

        const newVideo = new Video({
            caption: req.body.caption,
            videoUrl: result.secure_url,
            thumbnailUrl: result.eager[1].secure_url,
            cloudinaryId: result.public_id
        });

        await newVideo.save();
        res.status(201).json({ message: "Upload successful", video: newVideo });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.get("/api/videos", async (req, res) => {
    try {
        const { limit = 10, skip = 0 } = req.query;
        const videos = await Video.find().sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
        res.json(videos);

    } catch (error) {
        res.status(500).json({ error: "Could not fetch feed" });
    }
})


app.listen(8000, () => {
    console.log("Server is running on port 8000");
})