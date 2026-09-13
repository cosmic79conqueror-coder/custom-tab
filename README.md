# Simple Browser

A minimal, functional web browser built with HTML, CSS, and JavaScript. Features Google Search inside an iframe with a special workaround parameter, direct navigation, dark mode, and keyboard shortcuts.

## Features

- **Google Search**: Type any search term and it renders inside the browser iframe using the `igu=1` parameter
- **Direct URL Navigation**: Type full URLs (with `https://`) to load any website
- **Shortcut Buttons**: Quick access to Google, YouTube, Bing, Wikipedia
- **Dark Mode**: Toggle between light and dark theme (preference saved to localStorage)
- **Navigation History**: Back and Forward buttons with history tracking
- **Refresh Button**: Reload current page
- **Home Button**: Returns to Google Search
- **Responsive Design**: Works on mobile and desktop
- **Keyboard Shortcuts**: Ctrl+R (Refresh), Ctrl+L (focus URL bar), Escape (close errors)

## How It Works

The browser uses an `<iframe>` to display web content. Google Search normally blocks iframe embedding, but the `igu=1` parameter in the URL bypasses this restriction, allowing Google Search to render inside the browser.

For other websites, direct navigation is used (no iframe), which works reliably for all sites.

## How to Use

1. **Open `index.html`** in any modern web browser (Chrome, Firefox, Edge, Safari)
2. **Type a search term** (e.g., "photosynthesis") and click **Go** → Google Search renders inside the browser
3. **Type a full URL** (e.g., `https://www.github.com`) and click **Go** → Loads the website
4. **Click shortcut buttons** for instant access to Google, YouTube, Bing, Wikipedia
5. **Click Dark mode** → Toggle between light and dark theme (preference is remembered)
6. **Click Home** → Returns to Google Search
7. **Use Back/Forward** → Navigate your browsing history
8. **Press Ctrl+R** → Refresh the current page
9. **Use the URL bar** → Type addresses or search terms

## Technology Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Flexbox layout, CSS variables, dark mode, responsive design
- **JavaScript (ES6+)** - DOM manipulation, event handling, state management

## Browser Compatibility

Works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)