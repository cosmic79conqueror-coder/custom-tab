document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const btnGo = document.getElementById('btn-go');
    const placeholder = document.getElementById('placeholder');
    const iframe = document.getElementById('browser-frame');
    const btnBookmark = document.getElementById('btn-bookmark');
    const btnPopout = document.getElementById('btn-popout');
    const mainContent = document.getElementById('main-content');
    
    let sessionHistory = [];
    let sessionIndex = -1;
    let currentFinalUrl = '';

    let savedBookmarks = JSON.parse(localStorage.getItem('browserBookmarks')) || [];
    let savedHistory = JSON.parse(localStorage.getItem('browserHistory')) || [];

    function navigate(query, isHistoryNavigation = false) {
        if (!query || !query.trim()) return;

        let finalUrl = '';
        const isUrl = /^https?:\/\//i.test(query) || /^www\./i.test(query) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query);

        if (isUrl) {
            finalUrl = query.startsWith('http') ? query : `https://${query}`;
            if (finalUrl.includes('google.com') && !finalUrl.includes('igu=1')) {
                finalUrl = 'https://www.google.com/search?q=&igu=1';
            }
        } else {
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
        }

        currentFinalUrl = finalUrl;
        urlInput.value = finalUrl;
        placeholder.style.display = 'none';
        
        mainContent.style.padding = '0';
        iframe.style.display = 'block';
        iframe.src = finalUrl;
        checkIfBookmarked();

        if (!isHistoryNavigation) {
            sessionHistory = sessionHistory.slice(0, sessionIndex + 1);
            sessionHistory.push(finalUrl);
            sessionIndex++;
            
            savedHistory.unshift({ url: finalUrl, time: new Date().toLocaleString() });
            if(savedHistory.length > 50) savedHistory.pop(); 
            localStorage.setItem('browserHistory', JSON.stringify(savedHistory));
            renderLibrary();
        }
    }

    btnGo.addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') navigate(urlInput.value); });
    
    btnPopout.addEventListener('click', () => {
        if (currentFinalUrl) window.open(currentFinalUrl, '_blank');
    });

    document.querySelectorAll('.site-shortcut').forEach(card => {
        card.addEventListener('click', () => navigate(card.getAttribute('data-url')));
    });

    document.getElementById('btn-home').addEventListener('click', () => {
        iframe.style.display = 'none'; 
        iframe.src = '';
        placeholder.style.display = 'flex'; 
        urlInput.value = '';
        currentFinalUrl = ''; 
        checkIfBookmarked();
    });
    
    document.getElementById('btn-refresh').addEventListener('click', () => { if (iframe.src) iframe.src = iframe.src; });
    document.getElementById('btn-back').addEventListener('click', () => {
        if (sessionIndex > 0) { sessionIndex--; navigate(sessionHistory[sessionIndex], true); }
    });
    document.getElementById('btn-forward').addEventListener('click', () => {
        if (sessionIndex < sessionHistory.length - 1) { sessionIndex++; navigate(sessionHistory[sessionIndex], true); }
    });

    function checkIfBookmarked() {
        if (!currentFinalUrl) { btnBookmark.textContent = '☆'; btnBookmark.style.color = 'inherit'; return; }
        const isBookmarked = savedBookmarks.some(b => b.url === currentFinalUrl);
        btnBookmark.textContent = isBookmarked ? 'S' : '☆';
        btnBookmark.style.color = isBookmarked ? '#f1c40f' : 'inherit';
    }

    btnBookmark.addEventListener('click', () => {
        if(!currentFinalUrl) return;
        const exists = savedBookmarks.findIndex(b => b.url === currentFinalUrl);
        if (exists >= 0) {
            savedBookmarks.splice(exists, 1);
        } else {
            savedBookmarks.push({ url: currentFinalUrl, title: currentFinalUrl.substring(0, 40) + '...' });
        }
        localStorage.setItem('browserBookmarks', JSON.stringify(savedBookmarks));
        checkIfBookmarked();
        renderLibrary();
    });

    const libraryModal = document.getElementById('library-modal');
    function openLibrary(tabId) {
        libraryModal.style.display = 'flex';
        document.querySelectorAll('.lib-view').forEach(v => v.style.display = 'none');
        document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).style.display = 'block';
        const activeTabBtn = Array.from(document.querySelectorAll('.lib-tab')).find(t => t.dataset.target === tabId);
        if(activeTabBtn) activeTabBtn.classList.add('active');
        renderLibrary();
    }

    document.getElementById('btn-show-bookmarks').addEventListener('click', () => openLibrary('bookmarks-view'));
    document.getElementById('btn-show-history').addEventListener('click', () => openLibrary('history-view'));
    document.getElementById('btn-show-downloads').addEventListener('click', () => openLibrary('downloads-view'));
    document.getElementById('close-library').addEventListener('click', () => libraryModal.style.display = 'none');
    document.querySelectorAll('.lib-tab').forEach(tab => tab.addEventListener('click', (e) => openLibrary(e.target.dataset.target)));

    function renderLibrary() {
        const bmList = document.getElementById('bookmarks-list');
        bmList.innerHTML = savedBookmarks.length ? '' : '<p class="empty-state">No bookmarks yet.</p>';
        savedBookmarks.forEach((b, i) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="lib-url" title="${b.url}">${b.url}</span> <button class="btn-delete" data-index="${i}" data-type="bm">❌</button>`;
            li.querySelector('.lib-url').addEventListener('click', () => { navigate(b.url); libraryModal.style.display = 'none'; });
            bmList.appendChild(li);
        });

        const histList = document.getElementById('history-list');
        histList.innerHTML = savedHistory.length ? '' : '<p class="empty-state">No history yet.</p>';
        savedHistory.forEach((h, i) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="lib-url" title="${h.url}">${h.url}</span> <span class="lib-time">${h.time}</span> <button class="btn-delete" data-index="${i}" data-type="hist">❌</button>`;
            li.querySelector('.lib-url').addEventListener('click', () => { navigate(h.url); libraryModal.style.display = 'none'; });
            histList.appendChild(li);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                if(e.target.dataset.type === 'bm') {
                    savedBookmarks.splice(idx, 1);
                    localStorage.setItem('browserBookmarks', JSON.stringify(savedBookmarks));
                    checkIfBookmarked();
                } else {
                    savedHistory.splice(idx, 1);
                    localStorage.setItem('browserHistory', JSON.stringify(savedHistory));
                }
                renderLibrary();
            });
        });
    }

    document.getElementById('clear-bookmarks').addEventListener('click', () => { savedBookmarks = []; localStorage.removeItem('browserBookmarks'); checkIfBookmarked(); renderLibrary(); });
    document.getElementById('clear-history').addEventListener('click', () => { savedHistory = []; localStorage.removeItem('browserHistory'); renderLibrary(); });

    const btnDarkMode = document.getElementById('btn-darkmode');
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("browserDarkMode", isDark);
        btnDarkMode.textContent = isDark ? "D" : "L";
    });
    if (localStorage.getItem("browserDarkMode") === "true") {
        document.body.classList.add("dark");
        btnDarkMode.textContent = "D";
    }

    const btnProfile = document.getElementById('btn-profile');
    const authModal = document.getElementById('auth-modal');
    
    function checkAuthStatus() {
        const storedUser = localStorage.getItem('browserUser');
        if (storedUser) {
            btnProfile.textContent = `👤 ${JSON.parse(storedUser).name}`;
            btnProfile.classList.add('logged-in');
            document.getElementById('welcome-text').textContent = `Welcome back, ${JSON.parse(storedUser).name}`;
        } else {
            btnProfile.textContent = '👤 Sign In';
            btnProfile.classList.remove('logged-in');
            document.getElementById('welcome-text').textContent = 'New Tab';
        }
    }

    btnProfile.addEventListener('click', () => {
        if (localStorage.getItem('browserUser')) {
            if(confirm("Do you want to sign out?")) { localStorage.removeItem('browserUser'); checkAuthStatus(); }
        } else {
            authModal.style.display = 'flex';
        }
    });
    document.getElementById('close-modal').addEventListener('click', () => authModal.style.display = 'none');
    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('browserUser', JSON.stringify({ 
            name: document.getElementById('auth-name').value, 
            email: document.getElementById('auth-email').value 
        }));
        authModal.style.display = 'none';
        document.getElementById('auth-form').reset();
        checkAuthStatus();
    });
    checkAuthStatus();

    const newsFeed = document.getElementById('news-feed');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    const newsDatabase = [
        { title: "Next-Gen AI integration completely reshapes smart home devices", source: "Tech News", initial: "T", color: "#e03a3e", time: "1h ago", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80" },
        { title: "James Webb Telescope spots potential atmospheric signals on exoplanet", source: "Space", initial: "S", color: "#bb1919", time: "3h ago", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80" },
        { title: "Global milestone: Renewable energy production hits all time high", source: "Green Earth", initial: "G", color: "#00a100", time: "5h ago", img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&q=80" },
        { title: "Tech stocks rally heavily as inflation reports show steady cooling", source: "Finance", initial: "F", color: "#005594", time: "8h ago", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80" },
        { title: "New AR Glasses set to hit the market in late 2026", source: "The Verge", initial: "V", color: "#6a0dad", time: "10h ago", img: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=80" },
        { title: "Archaeologists uncover untouched ancient tomb in Egypt", source: "History", initial: "H", color: "#ffd700", time: "12h ago", img: "https://images.unsplash.com/photo-1539667468225-eebb663053e6?w=500&q=80" },
        { title: "Major cybersecurity flaw patched in millions of routers worldwide", source: "Security", initial: "S", color: "#000", time: "14h ago", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80" },
        { title: "Global gaming revenues hit record highs despite economic slowdown", source: "Gaming", initial: "G", color: "#bf1313", time: "16h ago", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80" },
        { title: "New ocean mapping initiative reveals deep sea ecosystem", source: "NatGeo", initial: "N", color: "#005aa3", time: "18h ago", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&q=80" },
        { title: "Breakthrough in quantum computing achieves zero-error calculation", source: "TechRadar", initial: "T", color: "#e4002b", time: "20h ago", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80" },
        { title: "Rare celestial event visible to the naked eye this weekend", source: "Astro", initial: "A", color: "#333", time: "1d ago", img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500&q=80" },
        { title: "Cities rethink urban planning with focus on pedestrian zones", source: "Urban", initial: "U", color: "#005cff", time: "1d ago", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500&q=80" }
    ];

    let currentNewsIndex = 0;
    const newsPerLoad = 4;
    let isLoading = false;

    function renderNewsBatch() {
        if (currentNewsIndex >= newsDatabase.length) {
            loadingSpinner.style.display = 'none';
            return;
        }
        isLoading = true;
        loadingSpinner.style.display = 'block';

        setTimeout(() => {
            const batch = newsDatabase.slice(currentNewsIndex, currentNewsIndex + newsPerLoad);
            
            batch.forEach(news => {
                const card = document.createElement('div');
                card.className = 'news-feed-card glass-effect';
                card.innerHTML = `
                    <img src="${news.img}" alt="News" class="news-thumbnail">
                    <div class="news-content">
                        <div class="news-source">
                            <span class="source-icon" style="background:${news.color};">${news.initial}</span> ${news.source} &bull; ${news.time}
                        </div>
                        <h4 class="news-title">${news.title}</h4>
                    </div>
                `;
                card.addEventListener('click', () => navigate(news.title + " news"));
                newsFeed.appendChild(card);
            });

            currentNewsIndex += newsPerLoad;
            isLoading = false;
            
            if (currentNewsIndex >= newsDatabase.length) {
                loadingSpinner.textContent = "You're all caught up!";
            } else {
                loadingSpinner.style.display = 'none';
            }
        }, 600);
    }

    renderNewsBatch();

    mainContent.addEventListener('scroll', () => {
        if (placeholder.style.display !== 'none' && !isLoading) {
            if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 50) {
                renderNewsBatch();
            }
        }
    });

    const musicToggle = document.getElementById('music-toggle');
    const musicBody = document.getElementById('music-body');
    const musicIcon = document.getElementById('music-icon');
    const vinylRecord = document.getElementById('vinyl-record');
    const tonearm = document.getElementById('tonearm');

    musicToggle.addEventListener('click', () => {
        const isHidden = musicBody.style.display === 'none';
        musicBody.style.display = isHidden ? 'block' : 'none';
        musicIcon.textContent = isHidden ? '▼' : '▲';
        
        if(isHidden) {
            vinylRecord.style.animationPlayState = 'running';
            tonearm.style.transform = 'rotate(25deg)';
        } else {
            vinylRecord.style.animationPlayState = 'paused';
            tonearm.style.transform = 'rotate(0deg)';
        }
    });
});