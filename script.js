document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const btnGo = document.getElementById('btn-go');
    const placeholder = document.getElementById('placeholder');
    const iframe = document.getElementById('browser-frame');
    
    // Toolbar buttons
    const btnHome = document.getElementById('btn-home');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnBack = document.getElementById('btn-back');
    const btnForward = document.getElementById('btn-forward');
    const btnDarkMode = document.getElementById('btn-darkmode');

    // Maintain a simple history array since cross-origin iframes block window.history access
    let history = [];
    let historyIndex = -1;

    // Function to process and load the URL/Search
    function navigate(query, isHistoryNavigation = false) {
        if (!query.trim()) return;

        let finalUrl = '';
        // Check if the user typed a URL or a search term
        const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query);

        if (isUrl) {
            // User typed a URL - ensure it has https://
            finalUrl = query.startsWith('http') ? query : `https://${query}`;
            // If the user tries to load Google directly, apply the iframe workaround
            if (finalUrl.includes('google.com')) {
                finalUrl = 'https://www.google.com/search?q=&igu=1';
            }
        } else {
            // User typed a search term - use Google Search with the iframe bypass (igu=1)
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
            // Show info about the search being used
            showInfo(`Searching Google: "${query}"`);
        }

        // Update UI elements
        urlInput.value = finalUrl;
        placeholder.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = finalUrl;

        // Manage History array
        if (!isHistoryNavigation) {
            // Remove forward history when navigating to new page
            history = history.slice(0, historyIndex + 1);
            history.push(finalUrl);
            historyIndex++;
        }
    }

    // Go Button & Enter Key event listeners
    btnGo.addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigate(urlInput.value);
        }
    });

    // Shortcut Buttons - navigate directly to the URL specified in data-url attribute
    const shortcuts = document.querySelectorAll('.shortcut-btn');
    shortcuts.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            // For shortcuts, navigate directly without the search conversion
            let urlToNavigate = url;
            if (!url.startsWith('http')) {
                urlToNavigate = `https://${url}`;
            }
            // Special handling for YouTube embed URL
            if (urlToNavigate.includes('youtube.com/embed')) {
                // YouTube embed works directly in iframe
                urlToNavigate = urlToNavigate;
            }
            navigate(urlToNavigate);
        });
    });

    // Home Button - resets to Google Search
    btnHome.addEventListener('click', () => {
        iframe.style.display = 'none';
        iframe.src = '';
        placeholder.style.display = 'flex';
        urlInput.value = '';
    });

    // Refresh Button - reloads current page
    btnRefresh.addEventListener('click', () => {
        if (iframe.src) {
            iframe.src = iframe.src;
        }
    });

    // Back Button - custom implementation due to cross-origin iframe policies
    btnBack.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            navigate(history[historyIndex], true);
        } else {
            showError("No more history to go back to.");
        }
    });

    // Forward Button
    btnForward.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            navigate(history[historyIndex], true);
        }
    });

    // Dark Mode Toggle
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("browserDarkMode", isDark);
        // Update the button icon
        btnDarkMode.textContent = isDark ? "☀️" : "🌙";
    });

    // Load saved dark mode preference from localStorage
    if (localStorage.getItem("browserDarkMode") === "true") {
        document.body.classList.add("dark");
        btnDarkMode.textContent = "☀️";
    }
});

// Show Error Message function
function showError(message) {
    if (document.querySelector('.error-overlay')) return;
    const overlay = document.createElement("div");
    overlay.className = "error-overlay";
    overlay.style = "position: absolute; top: 1rem; right: 1rem; background: #e74c3c; color: white; padding: 1rem; border-radius: 8px; z-index: 1000;";
    overlay.textContent = message;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
}

// Show Info Message function
function showInfo(message) {
    if (document.querySelector('.info-overlay')) document.querySelector('.info-overlay').remove();
    const overlay = document.createElement("div");
    overlay.className = "info-overlay";
    overlay.style = "position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: #2ecc71; color: white; padding: 0.5rem 1rem; border-radius: 20px; z-index: 1000;";
    overlay.textContent = message;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2500);
}