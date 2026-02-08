// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv, { config } from "dotenv";
// import { v2 as cloudinary, v2 } from 'cloudinary';
// import multer from "multer";
// import Video from "./models/Video.js"
// import { connectDB } from "./lib/db.js";

// config();

// const app = express();
// app.use(cors());
// app.use(express.json())
// connectDB()

// // cloudinary.config({
// //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //     api_key: process.env.CLOUDINARY_API_KEY,
// //     api_secret: process.env.CLOUDINARY_API_SECRET,
// //     secure: true
// // });

// const storage = multer.diskStorage({})
// const upload = multer({ storage })


// app.post("/api/upload", upload.single("file"), async (req, res) => {
//     try {
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             resource_type: 'video',
//             folder: 'reels',
//             eager: [
//                 { streaming_profile: "hd", format: "m3u8" },
//                 { width: 300, height: 500, crop: "pad", format: "jpg" }
//             ],
//             eager_async: true
//         })

//         const newVideo = new Video({
//             caption: req.body.caption,
//             videoUrl: result.secure_url,
//             thumbnailUrl: result.eager[1].secure_url,
//             cloudinaryId: result.public_id
//         });

//         await newVideo.save();
//         res.status(201).json({ message: "Upload successful", video: newVideo });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Upload failed" });
//     }
// });

// app.get("/api/videos", async (req, res) => {
//     try {
//         const { limit = 10, skip = 0 } = req.query;
//         const videos = await Video.find().sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
//         res.json(videos);

//     } catch (error) {
//         res.status(500).json({ error: "Could not fetch feed" });
//     }
// })


// app.listen(8000, () => {
//     console.log("Server is running on port 8000");
// })

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import Video from "./models/Video.js";
import { connectDB } from "./lib/db.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***configured***' : ' MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***configured***' : ' MISSING'
});

const storage = multer.diskStorage({});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
        console.log('Caption:', req.body.caption);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (!req.body.caption) {
            return res.status(400).json({ error: "Caption is required" });
        }

        console.log('Uploading to Cloudinary...');

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'reels',
            eager: [
                { streaming_profile: "hd", format: "m3u8" },
                { width: 300, height: 500, crop: "pad", format: "jpg" }
            ],
            eager_async: true
        });

        console.log('Cloudinary upload successful:', result.public_id);

        const newVideo = new Video({
            caption: req.body.caption,
            videoUrl: result.secure_url,
            thumbnailUrl: result.eager?.[1]?.secure_url || result.secure_url,
            cloudinaryId: result.public_id
        });

        await newVideo.save();
        console.log('Video saved to database:', newVideo._id);

        res.status(201).json({
            message: "Upload successful",
            video: newVideo
        });

    } catch (error) {
        console.error('Upload Error:', error);
        console.error('Error details:', error.message);

        res.status(500).json({
            error: "Upload failed",
            message: error.message
        });
    }
});

app.get("/api/videos", async (req, res) => {
    try {
        const { limit = 10, skip = 0 } = req.query;
        const videos = await Video.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        console.log(`Fetched ${videos.length} videos`);
        res.json(videos);

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: "Could not fetch feed" });
    }
});


app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        cloudinary: {
            configured: !!(process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET)
        }
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});