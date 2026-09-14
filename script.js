document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const frame = document.getElementById('browser-frame');
  const placeholder = document.getElementById('placeholder');
  const themeBtn = document.getElementById('btn-darkmode');
  const goBtn = document.getElementById('btn-go');
  const backBtn = document.getElementById('btn-back');
  const fwdBtn = document.getElementById('btn-forward');
  const rfrBtn = document.getElementById('btn-refresh');
  const homeBtn = document.getElementById('btn-home');
  const bookmarkBtn = document.getElementById('btn-bookmark');
  const popoutBtn = document.getElementById('btn-popout');
  const saveMemoBtn = document.getElementById('btn-save-memo');
  const scratchpad = document.getElementById('scratchpad-memo');
  const newsFeed = document.getElementById('news-feed');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  const libraryModal = document.getElementById('library-modal');
  const closeLibrary = document.getElementById('close-library');
  const authModal = document.getElementById('auth-modal');
  const closeModal = document.getElementById('close-modal');
  const authForm = document.getElementById('auth-form');
  const authBtn = document.getElementById('btn-profile');

  let historyStack = [];
  let historyIdx = -1;
  let sessionHistory = [];
  let bookmarks = JSON.parse(localStorage.getItem('portalBookmarks') || '[]');

  scratchpad.value = localStorage.getItem('portalMemo') || '';
  if (localStorage.getItem('portalTheme') === 'dark') document.body.classList.add('dark-mode');

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('portalTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  saveMemoBtn.addEventListener('click', () => {
    localStorage.setItem('portalMemo', scratchpad.value);
    saveMemoBtn.textContent = 'Saved!';
    setTimeout(() => saveMemoBtn.textContent = 'Save Note', 1500);
  });

  function navigateTo(url) {
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('.') && !url.includes(' ') ? 'https://' + url : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    urlInput.value = url;
    placeholder.style.display = 'none';
    frame.style.display = 'block';
    frame.src = url;
    historyStack = historyStack.slice(0, historyIdx + 1);
    historyStack.push(url);
    historyIdx = historyStack.length - 1;
    sessionHistory.push({ url, time: new Date().toLocaleTimeString() });
    renderHistory();
  }

  goBtn.addEventListener('click', () => navigateTo(urlInput.value.trim()));
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigateTo(urlInput.value.trim()); });
  backBtn.addEventListener('click', () => { if (historyIdx > 0) { historyIdx--; frame.src = historyStack[historyIdx]; urlInput.value = frame.src; } });
  fwdBtn.addEventListener('click', () => { if (historyIdx < historyStack.length - 1) { historyIdx++; frame.src = historyStack[historyIdx]; urlInput.value = frame.src; } });
  rfrBtn.addEventListener('click', () => { if (frame.src) frame.contentWindow.location.reload(); });
  homeBtn.addEventListener('click', () => { frame.style.display = 'none'; placeholder.style.display = 'block'; frame.src = ''; urlInput.value = ''; });
  popoutBtn.addEventListener('click', () => { if (urlInput.value) window.open(urlInput.value, '_blank'); });

  bookmarkBtn.addEventListener('click', () => {
    const targetUrl = urlInput.value || window.location.href;
    if (!bookmarks.includes(targetUrl)) {
      bookmarks.push(targetUrl);
      localStorage.setItem('portalBookmarks', JSON.stringify(bookmarks));
      renderBookmarks();
      bookmarkBtn.textContent = 'Bookmarked!';
      setTimeout(() => bookmarkBtn.textContent = 'BOOKMARK', 1500);
    }
  });

  window.copyBookmark = u => navigator.clipboard.writeText(u);

  function renderBookmarks() {
    const list = document.getElementById('bookmarks-list');
    list.innerHTML = bookmarks.map(b => `<li class="data-record-item"><span>${b}</span><button class="ctrl-btn" onclick="copyBookmark('${b.replace(/'/g, "\\'")}')">COPY</button></li>`).join('');
  }

  function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = sessionHistory.slice().reverse().map(h => `<li class="data-record-item"><span>${h.url}</span><span style="color:#666">${h.time}</span></li>`).join('');
  }
  renderBookmarks();

  document.querySelectorAll('.site-shortcut').forEach(card => card.addEventListener('click', () => navigateTo(card.dataset.url)));

  ['bookmarks', 'history', 'downloads'].forEach(t => {
    document.getElementById(`btn-show-${t}`).addEventListener('click', () => {
      libraryModal.classList.add('active');
      document.getElementById(`tab-${t}`).click();
    });
  });
  closeLibrary.addEventListener('click', () => libraryModal.classList.remove('active'));

  document.querySelectorAll('.lib-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.library-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).style.display = 'block';
    });
  });

  document.getElementById('clear-bookmarks').addEventListener('click', () => { bookmarks = []; localStorage.removeItem('portalBookmarks'); renderBookmarks(); });
  document.getElementById('clear-history').addEventListener('click', () => { sessionHistory = []; renderHistory(); });

  authBtn.addEventListener('click', () => authModal.classList.add('active'));
  closeModal.addEventListener('click', () => authModal.classList.remove('active'));
  authForm.addEventListener('submit', e => {
    e.preventDefault();
    authBtn.textContent = document.getElementById('auth-name').value.toUpperCase();
    authModal.classList.remove('active');
  });

  document.getElementById('music-toggle').addEventListener('click', () => {
    const body = document.getElementById('music-body');
    const icon = document.getElementById('music-icon');
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? 'block' : 'none';
    icon.textContent = hidden ? 'HIDE' : 'SHOW';
  });

  const newsMock = [
    { title: 'Low-latency global edge routing hits sub-5ms milestone in AP-SOUTH-1', cat: 'Technology', time: '12m ago' },
    { title: 'Quantum persistent storage registers zero-drift telemetry state', cat: 'Science', time: '45m ago' },
    { title: 'Semiconductor capital expenditure rises amid next-gen accelerator demand', cat: 'Business', time: '2h ago' },
    { title: 'Workspace portal architecture adopts unified local-first sync mesh', cat: 'Technology', time: '3h ago' },
    { title: 'Global telemetry indices reflect stabilization in regional transport layers', cat: 'Home', time: '4h ago' },
    { title: 'Fusion containment milestone verified via distributed optical sensor array', cat: 'Science', time: '5h ago' }
  ];

  function loadNews(filterCat = 'Home') {
    loadingSpinner.style.display = 'block';
    setTimeout(() => {
      const filtered = filterCat === 'Home' ? newsMock : newsMock.filter(n => n.cat === filterCat);
      newsFeed.innerHTML = filtered.map(item => `
        <div class="wire-card glass-panel" style="padding:15px; border-radius:8px;">
          <span style="font-size:0.7rem; color:var(--neon-blue); font-weight:700;">${item.cat.toUpperCase()} • ${item.time}</span>
          <h4 style="margin:8px 0 0 0; font-size:0.95rem;">${item.title}</h4>
        </div>
      `).join('') || '<p style="color:#666;">No wire dispatches in this sector.</p>';
      loadingSpinner.style.display = 'none';
    }, 400);
  }

  document.querySelectorAll('#gn-categories .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#gn-categories .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadNews(tab.dataset.cat);
    });
  });

  loadNews('Home');

  setInterval(() => {
    const pingEl = document.getElementById('tele-ping');
    if (pingEl) pingEl.textContent = `${Math.floor(Math.random() * 6) + 11} ms`;
  }, 3000);
});