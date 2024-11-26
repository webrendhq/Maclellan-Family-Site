// search.js
function handleSearch(event) {
    event?.preventDefault();
    const searchInput = document.querySelector('#nav-search-input');
    const query = searchInput?.value.trim();
    
    if (query) {
        const currentPath = window.location.pathname;
        if (!currentPath.endsWith('search.html')) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        } else {
            // Already on search page, update URL and trigger search
            const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
            window.history.pushState({ query }, '', newUrl);
            window.dispatchEvent(new Event('popstate'));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#nav-search-input');
    const searchButton = document.querySelector('#nav-search-button');

    searchButton?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch(e);
    });

    // Set input value from URL param if on search page
    if (window.location.pathname.endsWith('search.html')) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && searchInput) {
            searchInput.value = query;
        }
    }
});