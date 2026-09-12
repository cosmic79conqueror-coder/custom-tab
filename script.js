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

    function navigate(query, isHistoryNavigation = false) {
        if (!query.trim()) return;

        let finalUrl = '';
        const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query);

        if (isUrl) {
            finalUrl = query.startsWith('http') ? query : `https://${query}`;
        } else {
            // Use Google Search. The igu=1 parameter allows it to render in an iframe!
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
            showInfo(`Searching Google: "${query}"`);
        }

        // Update UI
        urlInput.value = finalUrl;
        placeholder.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = finalUrl;

        // Manage History
        if (!isHistoryNavigation) {
            history = history.slice(0, historyIndex + 1);
            history.push(finalUrl);
            historyIndex++;
        }
    }

    // Go Button & Enter Key
    btnGo.addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navigate(urlInput.value);
    });

    // Shortcuts
    const shortcuts = document.querySelectorAll('.shortcut-btn');
    shortcuts.forEach(btn => {
        btn.addEventListener('click', () => {
            navigate(btn.getAttribute('data-url'));
        });
    });

    // Home Button
    btnHome.addEventListener('click', () => {
        iframe.style.display = 'none';
        iframe.src = '';
        placeholder.style.display = 'flex';
        urlInput.value = '';
    });

    // Refresh Button
    btnRefresh.addEventListener('click', () => {
        if (iframe.src) iframe.src = iframe.src;
    });

    // Back Button (Custom implementation due to cross-origin policies)
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
        btnDarkMode.textContent = isDark ? "☀️" : "🌙";
    });

    // Load saved dark mode preference
    if (localStorage.getItem("browserDarkMode") === "true") {
        document.body.classList.add("dark");
        btnDarkMode.textContent = "☀️";
    }
});

function showError(message) {
    if (document.querySelector('.error-overlay')) return;
    const overlay = document.createElement("div");
    overlay.className = "error-overlay";
    overlay.style = "position: absolute; top: 1rem; right: 1rem; background: #e74c3c; color: white; padding: 1rem; border-radius: 8px; z-index: 1000;";
    overlay.textContent = message;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
}

function showInfo(message) {
    if (document.querySelector('.info-overlay')) document.querySelector('.info-overlay').remove();
    const overlay = document.createElement("div");
    overlay.className = "info-overlay";
    overlay.style = "position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: #2ecc71; color: white; padding: 0.5rem 1rem; border-radius: 20px; z-index: 1000;";
    overlay.textContent = message;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2500);
}