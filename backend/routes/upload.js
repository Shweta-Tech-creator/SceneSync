const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use memory storage (no disk writes)
const storage = multer.memoryStorage();

// File filter to only allow audio files
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video', // Cloudinary uses 'video' for audio files
                folder: 'scenesync/audio',
                public_id: `audio_${Date.now()}`,
                format: 'mp3' // Convert to mp3 for compatibility
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
    });
};

// Audio upload endpoint
router.post('/audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No audio file uploaded'
            });
        }

        console.log('Uploading audio to Cloudinary:', req.file.originalname);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        console.log('Cloudinary upload successful:', result.secure_url);

        res.json({
            success: true,
            message: 'Audio uploaded successfully',
            audioUrl: result.secure_url, // Direct Cloudinary URL
            filename: req.file.originalname,
            size: req.file.size,
            cloudinaryId: result.public_id
        });
    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload audio',
            error: error.message
        });
    }
});

module.exports = router;
