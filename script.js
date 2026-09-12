//! Simple Browser - JavaScript Functionality
//! A minimal, functional browser using direct navigation

//! On DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const btnGo = document.getElementById('btn-go');
    const placeholder = document.querySelector('.placeholder');

    // Function to process and navigate to URL or search
    function navigate(query) {
        if (!query.trim()) return;

        let finalUrl = '';

        // Check if the user typed a URL or a search term
        // Simple URL detection - if it has a domain format
        const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query);

        if (isUrl) {
            // User typed a URL - ensure it has https://
            finalUrl = query.startsWith('http') ? query : `https://${query}`;
        } else {
            // User typed a search term - redirect to DuckDuckGo (works in all browsers)
            finalUrl = `https://duckduckgo.com/search?q=${encodeURIComponent(query)}`;
            // Show info about the search
            showInfo(`Searching DuckDuckGo: "${query}"`);
        }

        // Hide placeholder, show we're navigating
        placeholder.style.display = 'none';

        // Navigate using window.location - most reliable method
        // This bypasses all iframe security restrictions (X-Frame-Options, etc.)
        try {
            window.location = finalUrl;
            
            // Brief delay then hide placeholder
            setTimeout(() => {
                placeholder.style.display = 'block';
            }, 1000);
        } catch (e) {
            console.error("Navigation error:", e);
            showError("Navigation error. Please check the URL.");
        }
    }

    // Event Listener for the "Go" button
    btnGo.addEventListener('click', () => {
        navigate(urlInput.value);
    });

    // Event Listener for pressing "Enter" in the address bar
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigate(urlInput.value);
        }
    });

    // ===== SHORTCUT BUTTONS =====
    // Note: Shortcuts set the URL directly, navigate function not called for them
    // to allow immediate navigation without search conversion
    const shortcuts = document.querySelectorAll('.shortcut-btn');
    shortcuts.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            // For shortcuts, navigate directly
            if (!url.startsWith('http')) {
                url = `https://${url}`;
            }
            window.location = url;
            placeholder.style.display = 'none';
        });
    });
});

//! Toggle Dark Mode
function toggleDarkMode() {
    // Toggle dark mode class on body
    document.body.classList.toggle("dark", !document.body.classList.contains("dark"));
    // Store preference
    localStorage.setItem("browserDarkMode", document.body.classList.contains("dark"));
}

//! Show Error Message
function showError(message) {
    // Check if error already exists
    if (document.querySelector('.error-overlay')) return;
    
    // Create error overlay
    const overlay = document.createElement("div");
    overlay.className = "error-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(231, 75, 61, 0.1)";
    overlay.style.color = "#e74c3c";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.pointerEvents = "none";
    overlay.innerHTML = `<p style="background: white; padding: 1rem 2rem; border-radius: 8px; max-width: 300px;">${message}</p>`;

    // Remove after 5 seconds
    setTimeout(() => overlay.remove(), 5000);

    // Insert into body
    document.body.insertBefore(overlay, document.body.firstChild);
}

//! Show Info Message (temporary notification)
function showInfo(message) {
    // Check if info already exists
    if (document.querySelector('.info-overlay')) document.querySelector('.info-overlay').remove();
    
    // Create info overlay
    const overlay = document.createElement("div");
    overlay.className = "info-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "auto";
    overlay.style.background = "rgba(46, 204, 113, 0.1)";
    overlay.style.color = "#2ecc71";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "1rem 2rem";
    overlay.style.pointerEvents = "none";
    overlay.innerHTML = `<p style="background: white; padding: 0.5rem 1rem; border-radius: 8px; max-width: 300px;">${message}</p>`;

    // Remove after 3 seconds
    setTimeout(() => overlay.remove(), 3000);

    // Insert into body
    document.body.insertBefore(overlay, document.body.firstChild);
}