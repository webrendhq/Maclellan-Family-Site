// Import the functions you need from the SDKs you need
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

/**
 * External Libraries:
 * Ensure that Isotope and imagesLoaded are loaded via script tags in your HTML.
 * They are available as global variables `Isotope` and `imagesLoaded`.
 */

// Initialize authentication state listener
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    } else {
        // Start the search
        await initializeSearchFromURL();
    }
});

let cursor = null;
let startIndex = 0;
let currentQuery = "";
let hasMore = false;
let currentPage = 1;
const itemsPerPage = 12;
let totalPages = 1;

// Function to update the URL with the search query
function updateURLWithQuery(query) {
    const url = new URL(window.location);
    url.searchParams.set('query', query);
    window.history.pushState({}, '', url);
}

// Function to get the query from the URL parameters
function getQueryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('query') || "";
}

// Function to check for additional URL parameters and adjust the number of appended elements
function getAdditionalParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('adjust')) || 0; // Default adjustment is 0 if not present
}

// Inject necessary CSS styles for the noise overlay and pagination
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .folder-item {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            flex: 1 1 auto;
            min-width: 200px;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            z-index: 0;
        }

        .folder-item:hover {
            transform: scale(1.10);
            z-index: 99;
            box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.5);
        }

        .folder-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: filter 0.3s ease;
            border-radius: 8px;
            z-index: 1;
        }

        .folder-item:hover img {
            filter: blur(0);
            z-index: 99;
        }

        .folder-item .caption {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 1.2em;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            background: rgba(0, 0, 0, 0.3);
            z-index: 2;
        }

        .folder-item:hover .caption {
            opacity: 1;
            z-index: 99;
        }

        .noise-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('./images/noise.png');
            background-repeat: repeat;
            pointer-events: none;
            z-index: 9999;
            box-shadow: inset 0px 0px 50px rgba(0, 0, 0, 1);
        }

        #pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 5vh;
            gap: 10px;
        }

        .pagination-button {
            padding: 8px 12px;
            background-color: #007BFF;
            color: white;
            border-radius: 4px;
            font-size: 16px;
            transition: background-color 0.3s ease;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
        }

        .pagination-button:hover {
            background-color: #0056b3;
        }

        .pagination-button.disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .pagination-button.active {
            background-color: #0056b3;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}
injectStyles();

// Create observer for lazy loading images
function createObserver() {
    return new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const mediaElement = entry.target;
                if (!mediaElement.src) {
                    mediaElement.src = mediaElement.dataset.src;
                    mediaElement.style.opacity = '1';
                }
                observer.unobserve(mediaElement);
            }
        });
    }, { rootMargin: '100px' });
}

const imageObserver = createObserver();

// Fetch Dropbox files and append results
async function searchDropboxFiles(query, startIndex = 0) {
    console.log("Searching Dropbox files with query:", query);
    await refreshDropboxAccessToken(); // Ensure the access token is fresh
    let searchResults = [];
    
    try {
        if (!cursor) {
            // Initial search request
            const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    options: { max_results: 100 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                searchResults = data.matches.map(match => match.metadata.metadata);
                cursor = data.has_more ? data.cursor : null;
                hasMore = data.has_more;
            } else {
                console.error('Error searching Dropbox files:', response.statusText);
            }
        } else {
            // Continue from where we left off
            const response = await fetch('https://api.dropboxapi.com/2/files/search/continue_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    cursor: cursor
                })
            });

            if (response.ok) {
                const data = await response.json();
                searchResults = data.matches.map(match => match.metadata.metadata);
                cursor = data.has_more ? data.cursor : null;
                hasMore = data.has_more;
            } else {
                console.error('Error continuing search for Dropbox files:', response.statusText);
            }
        }
    } catch (error) {
        console.error('Error during search:', error);
    }

    console.log("Search results:", searchResults);
    return searchResults;
}

// Pagination and render logic
async function renderPage(results) {
    const container = document.getElementById('search-grid');
    container.innerHTML = '';  // Clear previous results

    // Get the adjustment value from URL param (subtract 1 if applicable)
    const adjustment = getAdditionalParam();
    let adjustedItemsPerPage = itemsPerPage + adjustment;  // Adjust the number of items to append

    results.slice(0, adjustedItemsPerPage).forEach(async (file, index) => {
        if (file['.tag'] === 'file') {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let format = 'jpeg';  // Default format

            // Check for specific image or video file extensions
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                try {
                    const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ path: file.path_lower })
                    });

                    const thumbnailResponse = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Dropbox-API-Arg': JSON.stringify({
                                path: file.path_lower,
                                format: format,
                                size: 'w256h256'
                            })
                        }
                    });

                    if (!thumbnailResponse.ok) {
                        console.error('Error getting thumbnail:', thumbnailResponse.statusText);
                        return;
                    }

                    if (tempLinkResponse.ok) {
                        const tempLinkData = await tempLinkResponse.json();
                        const previewData = await thumbnailResponse.blob();
                        let previewUrl = URL.createObjectURL(previewData);

                        const folderLink = document.createElement('a');
                        folderLink.className = 'folder-item';

                        const img = document.createElement('img');
                        img.src = previewUrl;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';

                        folderLink.appendChild(img);

                        // Add noise overlay
                        const noiseOverlay = document.createElement('div');
                        noiseOverlay.className = 'noise-overlay';
                        folderLink.appendChild(noiseOverlay);

                        // Caption
                        const caption = document.createElement('div');
                        caption.className = 'caption';
                        caption.textContent = file.name;
                        folderLink.appendChild(caption);

                        container.appendChild(folderLink);
                        imageObserver.observe(img);
                    }
                } catch (error) {
                    console.error('Error fetching thumbnail or temp link:', error);
                }
            }
        }
    });

    // Initialize Isotope for masonry layout after images load
    imagesLoaded(container, function () {
        const iso = new Isotope(container, {
            itemSelector: '.folder-item',
            layoutMode: 'masonry',
            percentPosition: true,
            masonry: {
                columnWidth: '.folder-item',
                horizontalOrder: true,
                gutter: 4
            }
        });
    });

    createPaginationControls();
}

function createPaginationControls() {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';  // Clear old controls

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.classList.add('pagination-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            loadPage(i);
        });
        container.appendChild(button);
    }
}

// Load the specified page of results
async function loadPage(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const results = await searchDropboxFiles(currentQuery, startIndex);
    renderPage(results);
}

// Separate function to initialize search from URL
async function initializeSearchFromURL() {
    console.log("initializeSearchFromURL called");
    const queryFromURL = getQueryFromURL();
    
    if (queryFromURL) {
        document.getElementById('search-input').value = queryFromURL; // Populate search input with the query from URL
        await handleSearch(queryFromURL);
    }
}

async function handleSearch(query) {
    if (query) {
        updateURLWithQuery(query);
        currentPage = 1;  // Reset pagination
        const results = await searchDropboxFiles(query);
        renderPage(results);
    }
}

// Event listeners for search and pagination
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    handleSearch(query);
});

document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const query = this.value.trim();
        handleSearch(query);
    }
});

// Initialize on page load
function initialize() {
    console.log("Initializing...");
    refreshDropboxAccessToken().then(() => {
        console.log("Dropbox token refreshed");
        initializeSearchFromURL();
    }).catch(error => {
        console.error("Error during initialization:", error);
    });
}

// Check if DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM is ready");
    initialize();
});
