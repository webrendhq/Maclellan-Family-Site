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

let allSearchResults = [];
let currentQuery = "";
let currentPage = 1;
const itemsPerPage = 50;
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

// Inject necessary CSS styles for the noise overlay, pagination, and modal
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

        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 10000;
            padding-top: 100px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.9);
        }

        .modal-content {
            margin: auto;
            display: block;
            max-width: 80%;
            max-height: 80%;
        }

        .close {
            position: absolute;
            top: 50px;
            right: 50px;
            color: #fff;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }

        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #main-content {
            display: none;
        }
        .video-thumbnail {
            position: relative;
            cursor: pointer;
        }

        .play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: white;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3;
        }

        .modal-video {
            width: 80%;
            max-height: 80vh;
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
async function searchDropboxFiles(query) {
    console.log("Searching Dropbox files with query:", query);
    await refreshDropboxAccessToken(); // Ensure the access token is fresh
    let searchResults = [];
    let hasMore = true;
    let cursor = null;

    try {
        while (hasMore) {
            let response;
            if (!cursor) {
                // Initial search request
                response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: query,
                        options: { max_results: 1000 }
                    })
                });
            } else {
                // Continue from where we left off
                response = await fetch('https://api.dropboxapi.com/2/files/search/continue_v2', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        cursor: cursor
                    })
                });
            }

            if (response.ok) {
                const data = await response.json();
                const matches = data.matches.map(match => match.metadata.metadata);
                searchResults = searchResults.concat(matches);
                hasMore = data.has_more;
                cursor = hasMore ? data.cursor : null;
            } else {
                console.error('Error searching Dropbox files:', response.statusText);
                hasMore = false; // Stop loop on error
            }
        }
    } catch (error) {
        console.error('Error during search:', error);
    }

    console.log("Total search results:", searchResults.length);
    return searchResults;
}

// Pagination and render logic
async function renderPage() {
    const container = document.getElementById('search-grid');
    container.innerHTML = '';  // Clear previous results

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageResults = allSearchResults.slice(startIndex, endIndex);

    const loadImage = async (file, index) => {
        if (file['.tag'] === 'file') {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];

            if (imageExtensions.includes(fileExtension) || videoExtensions.includes(fileExtension)) {
                let fileType = imageExtensions.includes(fileExtension) ? 'image' : 'video';

                try {
                    const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ path: file.path_lower })
                    });

                    if (tempLinkResponse.ok) {
                        const tempLinkData = await tempLinkResponse.json();
                        const tempLinkUrl = tempLinkData.link;

                        // Function to fetch thumbnail
                        const fetchThumbnail = async (size) => {
                            const thumbnailResponse = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Dropbox-API-Arg': JSON.stringify({
                                        path: file.path_lower,
                                        format: 'jpeg',
                                        size: size
                                    })
                                }
                            });

                            if (!thumbnailResponse.ok) {
                                console.error('Error getting thumbnail:', thumbnailResponse.statusText);
                                return null;
                            }

                            return await thumbnailResponse.blob();
                        };

                        // Fetch low-res thumbnail
                        const lowResData = await fetchThumbnail('w32h32');
                        let lowResUrl = lowResData ? URL.createObjectURL(lowResData) : null;

                        const folderLink = document.createElement('a');
                        folderLink.className = 'folder-item';
                        folderLink.dataset.fileType = fileType; // 'image' or 'video'

                        const img = document.createElement('img');
                        img.src = lowResUrl;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';

                        folderLink.appendChild(img);
                        folderLink.dataset.tempLinkUrl = tempLinkUrl;

                        const noiseOverlay = document.createElement('div');
                        noiseOverlay.className = 'noise-overlay';
                        folderLink.appendChild(noiseOverlay);

                        const caption = document.createElement('div');
                        caption.className = 'caption';
                        caption.textContent = file.name;
                        folderLink.appendChild(caption);

                        // For videos, add a play icon overlay
                        if (fileType === 'video') {
                            const playIcon = document.createElement('div');
                            playIcon.className = 'play-icon';
                            playIcon.innerHTML = '&#9658;'; // Unicode for play symbol
                            folderLink.appendChild(playIcon);
                        }

                        folderLink.addEventListener('click', function(event){
                            event.preventDefault();

                            const fileType = this.dataset.fileType;
                            const tempLinkUrl = this.dataset.tempLinkUrl;

                            const modal = document.getElementById('media-modal');
                            const modalImg = document.getElementById('modal-image');
                            const modalVideo = document.getElementById('modal-video');

                            modal.style.display = 'block';

                            if (fileType === 'image') {
                                modalImg.style.display = 'block';
                                modalVideo.style.display = 'none';
                                modalImg.src = tempLinkUrl;
                                // Adjust image size after it loads
                                modalImg.onload = function() {
                                    adjustModalImageSize(this);
                                };
                            } else if (fileType === 'video') {
                                modalImg.style.display = 'none';
                                modalVideo.style.display = 'block';
                                modalVideo.src = tempLinkUrl;
                                modalVideo.play();
                            }
                        });

                        container.appendChild(folderLink);
                        imageObserver.observe(img);

                        // Fetch high-res thumbnail in the background
                        fetchThumbnail('w128h128').then(highResData => {
                            if (highResData) {
                                const highResUrl = URL.createObjectURL(highResData);
                                img.src = highResUrl;
                            }
                        });

                        // Reinitialize Isotope after each image is added
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
                    }
                } catch (error) {
                    console.error('Error fetching thumbnail or temp link:', error);
                }
            }
        }
    };

    for (let i = 0; i < pageResults.length; i++) {
        await loadImage(pageResults[i], i);
        // Add a delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    createPaginationControls();
    if (currentPage === 1) {
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
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
            loadPage(i);
        });
        container.appendChild(button);
    }
}


// Load the specified page of results
function loadPage(page) {
    currentPage = page;
    renderPage();
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
        
        // Show the loader before starting the search
        document.querySelector('.loader-container').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
        
        allSearchResults = await searchDropboxFiles(query);
        totalPages = Math.ceil(allSearchResults.length / itemsPerPage);
        await renderPage();  // Wait for renderPage to complete
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
        return initializeSearchFromURL();
    }).catch(error => {
        console.error("Error during initialization:", error);
        // In case of error, still hide the loader and show an error message
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('main-content').innerHTML = '<p>An error occurred. Please try refreshing the page.</p>';
        document.getElementById('main-content').style.display = 'block';
    });
}


// Check if DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM is ready");
    // injectStyles();
    injectModalHTML();
    initialize();
});

function adjustModalImageSize(img) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    if (imageAspectRatio > windowAspectRatio) {
        // Image is wider than the window
        img.style.width = '90%';
        img.style.height = 'auto';
    } else {
        // Image is taller than the window
        img.style.height = '90%';
        img.style.width = 'auto';
    }
}

// Add modal HTML to the page
function injectModalHTML() {
    const loaderHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);

    // Wrap the existing content in a main-content div
    const mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    while (document.body.firstChild) {
        if (document.body.firstChild.className !== 'loader-container') {
            mainContent.appendChild(document.body.firstChild);
        } else {
            break;
        }
    }
    document.body.appendChild(mainContent);

    const modalHTML = `
        <div id="media-modal" class="modal">
            <span class="close">&times;</span>
            <img class="modal-content" id="modal-image" style="display:none;">
            <video class="modal-content" id="modal-video" controls style="display:none;"></video>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when the close button is clicked
    document.querySelector('.close').addEventListener('click', function(){
        const modal = document.getElementById('media-modal');
        const modalVideo = document.getElementById('modal-video');
        modal.style.display = 'none';
        if (modalVideo.style.display !== 'none') {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    });

    // Close modal when clicking outside the media
    document.getElementById('media-modal').addEventListener('click', function(event){
        if (event.target == this) {
            this.style.display = 'none';
            const modalVideo = document.getElementById('modal-video');
            if (modalVideo.style.display !== 'none') {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
        }
    });

    // Adjust media size when window is resized
    window.addEventListener('resize', function() {
        const modalImg = document.getElementById('modal-image');
        const modalVideo = document.getElementById('modal-video');
        if (modalImg.style.display !== 'none') {
            adjustModalImageSize(modalImg);
        }
        // For videos, you can add a similar function if needed
    });
}
injectModalHTML();
