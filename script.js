document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const urlInput = document.getElementById('url-input');
    const btnGo = document.getElementById('btn-go');
    const placeholder = document.getElementById('placeholder');
    const iframe = document.getElementById('browser-frame');
    
    const btnHome = document.getElementById('btn-home');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnBack = document.getElementById('btn-back');
    const btnForward = document.getElementById('btn-forward');
    const btnDarkMode = document.getElementById('btn-darkmode');

    const btnProfile = document.getElementById('btn-profile');
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const welcomeText = document.getElementById('welcome-text');
    const closeModal = document.getElementById('close-modal');

    const musicProvider = document.getElementById('music-provider');
    const musicContainer = document.getElementById('music-container');
    const musicToggle = document.getElementById('music-toggle');
    const musicBody = document.getElementById('music-body');
    const musicIcon = document.getElementById('music-icon');

    // --- NAVIGATION & HISTORY LOGIC ---
    let history = [];
    let historyIndex = -1;

    function navigate(query, isHistoryNavigation = false) {
        if (!query || !query.trim()) return;

        let finalUrl = '';
        const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query);

        if (isUrl) {
            finalUrl = query.startsWith('http') ? query : `https://${query}`;
            
            // Bypass common iframe blockers
            if (finalUrl.includes('google.com') && !finalUrl.includes('igu=1')) {
                finalUrl = 'https://www.google.com/search?q=&igu=1';
            } else if (finalUrl.includes('youtube.com/watch?v=')) {
                finalUrl = finalUrl.replace('/watch?v=', '/embed/').split('&')[0];
            } else if (finalUrl === 'https://www.youtube.com' || finalUrl === 'https://youtube.com') {
                finalUrl = 'https://www.youtube.com/embed/';
            } else if (finalUrl.includes('bing.com') && !finalUrl.includes('/search')) {
                finalUrl = 'https://www.bing.com/search?q=';
            }
        } else {
            // Default to Google search
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
        }

        // Update UI
        urlInput.value = finalUrl;
        placeholder.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = finalUrl;

        // Save history
        if (!isHistoryNavigation) {
            history = history.slice(0, historyIndex + 1);
            history.push(finalUrl);
            historyIndex++;
        }
    }

    // --- EVENT LISTENERS FOR BROWSER CONTROLS ---
    btnGo.addEventListener('click', () => navigate(urlInput.value));
    
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navigate(urlInput.value);
    });

    document.querySelectorAll('.site-shortcut').forEach(card => {
        card.addEventListener('click', () => navigate(card.getAttribute('data-url')));
    });

    btnHome.addEventListener('click', () => {
        iframe.style.display = 'none';
        iframe.src = '';
        placeholder.style.display = 'flex';
        urlInput.value = '';
    });

    btnRefresh.addEventListener('click', () => {
        if (iframe.src) iframe.src = iframe.src;
    });

    btnBack.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            navigate(history[historyIndex], true);
        }
    });

    btnForward.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            navigate(history[historyIndex], true);
        }
    });

    // --- DARK MODE LOGIC ---
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("browserDarkMode", isDark);
        btnDarkMode.textContent = isDark ? "☀️" : "🌙";
    });

    if (localStorage.getItem("browserDarkMode") === "true") {
        document.body.classList.add("dark");
        btnDarkMode.textContent = "☀️";
    }

    // --- AUTHENTICATION (SIGN IN) LOGIC ---
    function checkAuthStatus() {
        const storedUser = localStorage.getItem('browserUser');
        if (storedUser) {
            const userName = JSON.parse(storedUser).name;
            btnProfile.textContent = `👤 ${userName}`;
            btnProfile.classList.add('logged-in');
            welcomeText.textContent = `Welcome back, ${userName}`;
        } else {
            btnProfile.textContent = '👤 Sign In';
            btnProfile.classList.remove('logged-in');
            welcomeText.textContent = 'New Tab';
        }
    }

    btnProfile.addEventListener('click', () => {
        if (localStorage.getItem('browserUser')) {
            if(confirm("Do you want to sign out?")) {
                localStorage.removeItem('browserUser');
                checkAuthStatus();
            }
        } else {
            authModal.style.display = 'flex';
        }
    });

    closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        
        localStorage.setItem('browserUser', JSON.stringify({ name, email }));
        
        authModal.style.display = 'none';
        authForm.reset();
        checkAuthStatus();
    });

    checkAuthStatus(); // Run on startup

    // --- MUSIC PLAYER LOGIC ---
    const musicEmbeds = {
        spotify: '<iframe src="https://open.spotify.com/embed/playlist/37i9dQZEVXbMDoHDwVN2tF" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>',
        youtube: '<iframe width="100%" height="152" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0" title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        soundcloud: '<iframe width="100%" height="152" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/charts/top&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>'
    };

    musicProvider.addEventListener('change', (e) => {
        musicContainer.innerHTML = musicEmbeds[e.target.value];
    });

    musicToggle.addEventListener('click', () => {
        if (musicBody.style.display === 'none') {
            musicBody.style.display = 'block';
            musicIcon.textContent = '▼';
        } else {
            musicBody.style.display = 'none';
            musicIcon.textContent = '▲';
        }
    });
});