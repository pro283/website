// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggleBtn.querySelector('.icon');

    // Check if user has a saved preference in local storage
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(currentTheme);
        updateIcon(currentTheme);
    }

    // Toggle event listener
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme'); // Save preference
            updateIcon('dark-theme');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme'); // Save preference
            updateIcon('light-theme');
        }
    });

    // Function to update the emoji icon
    function updateIcon(theme) {
        if (theme === 'dark-theme') {
            icon.textContent = '☀️'; // Sun icon for dark mode (to switch back)
        } else {
            icon.textContent = '🌙'; // Moon icon for light mode
        }
    }
});
