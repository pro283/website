// server.js (Minimal Node.js/Express API Server)
const express = require('express');
const cors = require('cors'); // Used for handling cross-origin requests
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON data from the frontend
app.use(express.json()); 

// --- 🛑 IMPORTANT: CONFIGURE CORS ---
// You must replace 'YOUR_GITHUB_PAGES_URL' with your actual live GitHub Pages URL 
// (e.g., https://pro283.github.io/website)
const FRONTEND_URL = 'https://elvryn.xyz'; 
app.use(cors({
    origin: FRONTEND_URL, 
    methods: 'GET,POST',
    credentials: true
}));

// ------------------------------------

// Health Check Endpoint (Render checks this to see if the server is running)
app.get('/', (req, res) => {
    res.send('ToolHub API is Running.');
});


// The Main API Endpoint for Video Info (your frontend will POST data here)
app.post('/api/fetch-video', (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        // Send an error if the URL is missing
        return res.status(400).json({ error: 'Missing video URL in request body.' });
    }

    console.log(`[API CALL] Received URL: ${videoUrl}`);

    // ----------------------------------------------------------------------
    // 🛑 FUTURE DEVELOPMENT SPOT: 
    // This is where you would install and use a library (like 'ytdl-core') 
    // to process the videoUrl and get real download links and titles.
    // ----------------------------------------------------------------------

    // --- Sending Simulated Data for Successful Connection Test ---
    const simulatedData = {
        title: "SUCCESS! Render Backend Connected to Frontend.",
        thumbnailUrl: "https://via.placeholder.com/480x270/6366f1/FFFFFF?text=API+Success", // Placeholder image
        formats: [
            { quality: '1080p', size: '150 MB', link: '#' },
            { quality: '720p', size: '90 MB', link: '#' },
            { quality: 'MP3', size: '5 MB', link: '#' }
        ]
    };

    // Send the fake video data back to your frontend JavaScript
    res.json(simulatedData);
});


// Start the server, listening on the port provided by Render
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
