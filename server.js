const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const port = process.env.PORT || 10000;

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CORS Configuration (Allowing all origins for stability) ---
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
        // This includes the fix for the 410 Status Code error by spoofing the User-Agent
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            }
        });

        // 2. Filter and Structure Download Formats
        const formats = [];

        // Find the best combined format (Video + Audio)
        const combinedFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highest'
        });

        // Find the best audio-only format
        const bestAudioFormat = ytdl.chooseFormat(info.formats, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        // --- Video Format (Combined Highest Quality) ---
        if (combinedFormat) {
             formats.push({
                quality: combinedFormat.qualityLabel || 'Highest Quality',
                size: (combinedFormat.contentLength ? (combinedFormat.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Size N/A'),
                // The link the frontend will use to initiate the download
                link: `/api/download?url=${encodeURIComponent(videoUrl)}&format_id=${combinedFormat.itag}`
            });
        }

        // --- MP3 (Audio Only) Format ---
        if (bestAudioFormat) {
            formats.push({
                quality: 'MP3 (Audio)',
                size: (bestAudioFormat.contentLength ? (bestAudioFormat.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Size N/A'),
                // The link the frontend will use to initiate the download
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
        // If ytdl-core fails, send a clean 500 error to the client
        res.status(500).json({ error: `Failed to fetch video details. YouTube error: ${error.message}` });
    }
});


// --- Download Route (Initiates the actual file stream) ---
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;
    const formatId = req.query.format_id;
    const isAudioOnly = req.query.audio_only === 'true';

    if (!videoUrl || !formatId) {
        return res.status(400).send('Missing video URL or format ID.');
    }

    try {
        // Set the appropriate headers for the browser to download the file
        const fileName = `download-${Date.now()}.${isAudioOnly ? 'mp3' : 'mp4'}`;
        res.header('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Pipe the video stream directly to the client
        ytdl(videoUrl, {
            format: formatId,
            filter: isAudioOnly ? 'audioonly' : 'audioandvideo' // Apply filter if needed
        }).pipe(res);

    } catch (error) {
        console.error('Error initiating download:', error.message);
        res.status(500).send('Failed to initiate download stream.');
    }
});


// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
