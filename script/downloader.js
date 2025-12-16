document.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 IMPORTANT: Update the API URL to your live Render service 
    const RENDER_API_URL = 'https://api.elvryn.xyz';

    // Select all necessary elements
    const videoUrlInput = document.getElementById('video-url');
    const fetchBtn = document.getElementById('fetch-btn');
    const videoInfoCard = document.getElementById('video-info-card');
    const videoTitle = document.getElementById('video-title');
    const videoThumbnail = document.getElementById('video-thumbnail');
    const formatsListContainer = document.querySelector('.formats-list');
    const statusMessage = document.getElementById('status-message');
    
    // --- UTILITY FUNCTIONS ---

    // Function to display status messages
    function displayStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden', 'success', 'error');
        statusMessage.classList.add(type);
    }
    
    // Function to populate the card with data received from the backend
    function loadVideoInfo(data) {
        // Clear previous formats
        const oldFormats = formatsListContainer.querySelectorAll('.format-option');
        oldFormats.forEach(f => f.remove());

        // Add the heading back if it was removed
        let heading = formatsListContainer.querySelector('h3');
        if (!heading) {
            heading = document.createElement('h3');
            heading.textContent = "Available Downloads:";
            formatsListContainer.prepend(heading);
        }

        // Use data returned from the server
        videoTitle.textContent = data.title;
        // Note: The backend is currently sending a placeholder thumbnail URL.
        videoThumbnail.src = data.thumbnailUrl || "https://via.placeholder.com/480x270/AAAAAA/FFFFFF?text=No+Image"; 
        
        // Loop through the formats array sent by the server
        data.formats.forEach(format => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('format-option');
            optionDiv.setAttribute('data-quality', format.quality.toLowerCase());
            
            optionDiv.innerHTML = `
                <span class="format-label">${format.quality}</span>
                <span class="format-size">${format.size || 'Size N/A'}</span>
                <button class="btn download-btn" data-link="${format.link || '#'}">Download</button>
            `;
            formatsListContainer.appendChild(optionDiv);
        });
        
        // This makes the card visible
        videoInfoCard.classList.remove('hidden');
    }

    // --- MAIN EVENT LISTENER: Fetch Button ---

    fetchBtn.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();

        if (!url) {
            displayStatus('Please enter a valid video link.', 'error');
            return;
        }

        // 1. Start Loading State
        fetchBtn.classList.add('loading');
        videoInfoCard.classList.add('hidden');
        statusMessage.classList.add('hidden');
        
        // 2. Real API Call to your Render Backend
        fetch(`${RENDER_API_URL}/api/fetch-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        })
        .then(response => {
            if (!response.ok) {
                // Handle HTTP error statuses (4xx, 5xx)
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            fetchBtn.classList.remove('loading');

            if (data.error) {
                displayStatus(`Error from server: ${data.error}`, 'error');
                return;
            }
            
            loadVideoInfo(data);
            displayStatus('Video information fetched successfully!', 'success');
        })
        .catch(error => {
            fetchBtn.classList.remove('loading');
            console.error('Fetch error:', error);
            displayStatus(`Connection Error: ${error.message}. Check the Render logs.`, 'error');
        });
    });

    // --- EVENT LISTENER for Dynamic Download Buttons ---
    // Use event delegation since download buttons are created dynamically
    document.querySelector('.downloader-container').addEventListener('click', (event) => {
        if (event.target.classList.contains('download-btn')) {
            const downloadLink = event.target.getAttribute('data-link');
            const quality = event.target.closest('.format-option').getAttribute('data-quality');
            
            if (downloadLink && downloadLink !== '#') {
                // In a real application, this would redirect the user to the generated file link
                // window.location.href = downloadLink; 
                displayStatus(`Simulating download for ${quality}. Check console for link.`, 'success');
                console.log(`Simulated download requested for: ${downloadLink}`);
            } else {
                 // The simulated data currently has '#' links.
                 alert(`Simulating download for: ${quality} format. A real download would start now!`);
            }
        }
    });

});
