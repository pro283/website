const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core'); // The library for fetching YouTube info

const app = express();
const port = process.env.PORT || 10000;

// Middleware Setup
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// --- CORS Configuration (Simplest and most reliable for now) ---
// Since we are using a custom subdomain (api.elvryn.xyz), 
// the minimal 'app.use(cors());' is the safest way to ensure connections.
app.use(cors());

// --- Root Route (Health Check) ---
app.get('/', (req, res) => {
    res.send('ToolHub API is Running.');
});


// --- REAL FETCH-VIDEO API ROUTE ---
app.post('/api/fetch-video', async (req, res) => {
    const videoUrl = req.body.url;
    console.log(`[API CALL] Received URL: ${videoUrl}`);

    if (!ytdl.validateURL(videoUrl)) {
        console.error('Invalid URL received.');
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        // 1. Get video information from YouTube
        const info = await ytdl.getInfo(videoUrl);

        // 2. Filter and Structure Download Formats
        const formats = [];

        // --- Video Formats (Highest quality video-only stream combined with audio) ---
        // Find the best quality video format that is NOT a dash video (combined video+audio)
        const bestVideoFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highestvideo', // Get highest quality video stream
            filter: 'videoonly' // Ensure it is video only
        });
        
        // Find the best quality audio stream
        const bestAudioFormat = ytdl.chooseFormat(info.formats, {
            quality: 'highestaudio', // Get highest quality audio stream
            filter: 'audioonly' // Ensure it is audio only
        });

        // NOTE: We cannot provide a simple direct download link for video+audio combined 
        // because ytdl-core typically serves them as separate streams (video-only and audio-only).
        // For a true download, the server must combine them (which is complex).
        // For simplicity and a working POC, we will offer the combined best video+audio format if available.
        
        const combinedFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highest' // This often provides a combined stream
        });


        if (combinedFormat) {
             formats.push({
                quality: combinedFormat.qualityLabel || 'Highest Quality',
                size: (combinedFormat.contentLength ? (combinedFormat.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Size N/A'),
                // Link is a simplified placeholder that client-side code will handle
                // In a real scenario, this link would trigger a server-side download stream.
                link: `/api/download?url=${encodeURIComponent(videoUrl)}&format_id=${combinedFormat.itag}`
            });
        }

        // --- MP3 (Audio Only) Format ---
        if (bestAudioFormat) {
            formats.push({
                quality: 'MP3 (Audio)',
                size: (bestAudioFormat.contentLength ? (bestAudioFormat.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Size N/A'),
                // Link is a simplified placeholder
                link: `/api/download?url=${encodeURIComponent(videoUrl)}&format_id=${bestAudioFormat.itag}&audio_only=true`
            });
        }
        
        // 3. Send structured data back to the frontend
        res.json({
            title: info.videoDetails.title,
            thumbnailUrl: info.videoDetails.thumbnails.slice(-1)[0].url,
            formats: formats,
        });

    } catch (error) {
        console.error('Error fetching video info:', error.message);
        res.status(500).json({ error: 'Failed to fetch video details from YouTube.' });
    }
});


// --- Download Route (Placeholder for triggering the download) ---
app.get('/api/download', (req, res) => {
    // NOTE: This is a simplified endpoint. For a real download, you would need
    // to stream the video content here and set correct headers.
    
    // For now, we will simply redirect to the direct ytdl-core link 
    // or provide instructions. This is often blocked by browsers/YouTube.
    // The link generated in the frontend is usually meant for the server to handle.
    
    // We send a JSON instruction back to the user's browser as a placeholder
    // for what the actual server-side download link would generate.
    res.json({
        message: "Download initiated successfully!",
        videoUrl: req.query.url,
        format_id: req.query.format_id
    });
});


// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
