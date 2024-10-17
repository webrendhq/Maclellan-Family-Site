// Import Firebase modules from your S3 URL
import { auth, onAuthStateChanged, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

// Import Firestore functions
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Import necessary functions and tokens 
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';

// Initialize authentication state listener
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    } else {
        // User is signed in, proceed
        try {
            const docRef = doc(db, 'users', user.uid); // Adjust collection name if different
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                let folderPath = docSnap.data().folderPath;
                if (!folderPath) {
                    console.error('folderPath is not defined in the user document');
                    return;
                }
                // Start listing folders
                await listExactYearFolders(folderPath);
            } else {
                console.error('No such document!');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
});

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');

// Inject necessary CSS styles
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Container for each folder item */
        .folder-item {
            position: relative;
            transform: scale(1); 
            transition: box-shadow 0.3s ease, transform 0.3s ease;
            overflow: hidden;
            cursor: pointer;
            flex: 1 1 auto;
            min-width: 200px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-bottom: 4px;
            z-index: 0;
        }

        /* Hover effect */
        .folder-item:hover {
            box-shadow: 0 8px 50px rgba(0, 0, 0, 0.3);
            transform: scale(1.10);
            z-index: 99;
            box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.5);
        }

        /* Image styling */
        .folder-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: filter 0.3s ease;
            border-radius: 8px;
            position: relative;
            z-index: 1;
        }

        /* Remove blur on hover */
        .folder-item:hover img {
            filter: blur(0);
            z-index: 99;
        }

        /* Caption styling */
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
            opacity: 0.8;
            text-align: center;
            transition: opacity 0.3s ease;
            pointer-events: none;
            background: rgba(0, 0, 0, 0.3);
            z-index: 2;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
        }

        /* Show caption on hover */
        .folder-item:hover .caption {
            opacity: 1;
            z-index: 99;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
        }

        /* Noise Overlay Styling */
        .noise-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('./images/noise.png');
            background-repeat: repeat;
            opacity: 1;
            pointer-events: none;
            z-index: 9999;
            box-shadow: inset 0px 0px 50px rgba(0, 0, 0, 1);
        }

        /* Responsive grid */
        #event-bento-grid2 {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px;
        }

        /* Pagination Controls Styling */
        #pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 5vh;
            gap: 10px;
            position: fixed;
            top: 10%;
            right: 8%;
            z-index: 9999;
        }

        .pagination-button {
            padding: 8px 12px;
            border: none;
            background-color: #007BFF;
            color: white;
            cursor: pointer;
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

        /* Loading Spinner Styles */
        #loading-spinner {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            display: block;
        }

        .spinner {
            border: 16px solid #f3f3f3;
            border-top: 16px solid #007BFF;
            border-radius: 50%;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
        }

        /* Spinner Animation */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Screen Reader Only Text */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

// Call the function to inject styles
injectStyles();

/**
 * Concurrency Control and Retry Mechanism
 */

// Configuration for thumbnail fetching
const THUMBNAIL_CONCURRENCY_LIMIT = 12;
const API_CONCURRENCY_LIMIT = 12;
const RETRY_LIMIT = 5;
const INITIAL_BACKOFF = 1000;

// Simple semaphore to limit concurrency
class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }

    acquire() {
        return new Promise(resolve => {
            if (this.current < this.max) {
                this.current++;
                resolve();
            } else {
                this.queue.push(resolve);
            }
        });
    }

    release() {
        this.current--;
        if (this.queue.length > 0) {
            this.current++;
            const resolve = this.queue.shift();
            resolve();
        }
    }
}

const thumbnailSemaphore = new Semaphore(THUMBNAIL_CONCURRENCY_LIMIT);
const apiSemaphore = new Semaphore(API_CONCURRENCY_LIMIT);

/**
 * Helper function to perform fetch with retry on 429 errors
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries left
 */
async function fetchWithRetry(url, options, retries = RETRY_LIMIT) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status !== 429) {
                return response;
            }
            if (attempt < retries) {
                const data = await response.json();
                const retryAfter = data.error && data.error.retry_after ? data.error.retry_after : 5;
                console.warn(`Rate limited. Retrying after ${retryAfter} seconds... (Attempt ${attempt + 1} of ${RETRY_LIMIT})`);
                await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
            } else {
                throw new Error(`Max retries reached for ${url}`);
            }
        } catch (error) {
            if (attempt < retries) {
                const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt);
                console.warn(`Fetch error: ${error.message}. Retrying after ${backoffTime} ms... (Attempt ${attempt + 1} of ${RETRY_LIMIT})`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Modified getThumbnailBlob to use concurrency control and always use 'w64h64' resolution
 */
async function getThumbnailBlob(path) {
    const size = 'w64h64';
    const cacheKey = `${path}_${size}`;
    const cache = await caches.open('thumbnails-cache');

    // Check if the image is already in the cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return await cachedResponse.blob();
    }

    // Acquire semaphore before making the request
    await thumbnailSemaphore.acquire();

    try {
        const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/get_thumbnail', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path,
                    format: 'jpeg',
                    size: size
                }),
                'Content-Type': 'application/octet-stream'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Clone the response so we can store it in the cache
        const responseClone = response.clone();
        await cache.put(cacheKey, responseClone);

        return await response.blob();
    } catch (error) {
        console.error(`Error fetching thumbnail for path ${path}:`, error);
        return null;
    } finally {
        // Release the semaphore regardless of success or failure
        thumbnailSemaphore.release();
    }
}

// Function to create object URL for the thumbnail
async function getThumbnail(path) {
    const blob = await getThumbnailBlob(path);
    if (blob) {
        const url = URL.createObjectURL(blob);
        return url;
    } else {
        // Return a placeholder image or null
        return './images/placeholder.png';
    }
}

// Function to get the most recent image from a folder and its thumbnail
async function getMostRecentImageFromFolder(folderPath) {
    try {
        // Acquire API semaphore
        await apiSemaphore.acquire();

        const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: folderPath,
                recursive: false,
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: false,
                include_mounted_folders: false,
                limit: 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        // Handle has_more for list_folder
        let allEntries = data.entries;
        let hasMore = data.has_more;
        let cursor = data.cursor;

        while (hasMore) {
            const continueResponse = await fetchWithRetry('https://api.dropboxapi.com/2/files/list_folder/continue', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cursor: cursor })
            });

            if (!continueResponse.ok) {
                const errorText = await continueResponse.text();
                throw new Error(`HTTP error on list_folder/continue! status: ${continueResponse.status}, message: ${errorText}`);
            }

            const continueData = await continueResponse.json();
            allEntries = allEntries.concat(continueData.entries);
            hasMore = continueData.has_more;
            cursor = continueData.cursor;
        }

        // Release API semaphore
        apiSemaphore.release();

        // Log the contents of the folder to the console
        console.log(`Contents of folder "${extractFolderName(folderPath)}":`, allEntries);

        // Filter files that are images based on media_info or file extensions
        const imageFiles = allEntries.filter(entry =>
            entry['.tag'] === 'file' &&
            (
                (entry.media_info && entry.media_info['.tag'] === 'photo') ||
                /\.(jpg|jpeg|png|gif|heic)$/i.test(entry.name)
            )
        );

        if (imageFiles.length === 0) return null;

        // Sort by client_modified date if available, otherwise use server_modified
        imageFiles.sort((a, b) => {
            const dateA = new Date(a.client_modified || a.server_modified);
            const dateB = new Date(b.client_modified || b.server_modified);
            return dateB - dateA;
        });

        const mostRecentImage = imageFiles[0];

        // Get the thumbnail
        const thumbnailUrl = await getThumbnail(mostRecentImage.path_lower);

        return {
            thumbnail: thumbnailUrl,
            imagePath: mostRecentImage.path_lower
        };
    } catch (error) {
        console.error('Error getting most recent image:', error);
        return null;
    }
}

// Function to extract folder name from path
function extractFolderName(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'Unnamed Folder';
}

// Create and append loading spinner
function createLoadingSpinner() {
    const spinnerContainer = document.createElement('div');
    spinnerContainer.id = 'loading-spinner';
    spinnerContainer.setAttribute('role', 'status');
    spinnerContainer.setAttribute('aria-live', 'polite');

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');

    spinnerContainer.appendChild(spinner);

    const loadingText = document.createElement('span');
    loadingText.className = 'sr-only';
    loadingText.textContent = 'Loading...';
    spinnerContainer.appendChild(loadingText);

    document.body.appendChild(spinnerContainer);
}

// Show the spinner
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
        console.log('Spinner shown');
    }
}

// Hide the spinner
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
        console.log('Spinner hidden');
    }
}

// Create the spinner element
createLoadingSpinner();

/**
 * Responsive and Debounce Utilities
 */

// Function to calculate and set the number of columns
function setResponsiveColumns(eventBentoGrid, iso) {
    const gridWidth = eventBentoGrid.clientWidth;
    const minItemWidth = 200;
    const gutter = 4;

    // Calculate the number of columns that can fit
    const columns = Math.floor((gridWidth + gutter) / (minItemWidth + gutter)) || 1;

    // Calculate the actual width for each item
    const itemWidth = Math.floor((gridWidth - (columns - 1) * gutter) / columns);

    // Select all folder-item elements
    const items = eventBentoGrid.querySelectorAll('.folder-item');

    // Set the width for each item
    items.forEach(item => {
        item.style.width = `${itemWidth}px`;
    });

    // Update Isotope layout
    iso.arrange();
}

// Debounce function to limit how often a function can fire
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function fetchAllFolderContents(folderPath) {
    let allEntries = [];
    let hasMore = true;
    let cursor = null;

    while (hasMore) {
        let requestBody = {
            path: folderPath,
            recursive: false,
            include_media_info: false,
            include_deleted: false,
            include_has_explicit_shared_members: false,
            include_mounted_folders: false,
            limit: 2000
        };

        if (cursor) {
            requestBody = { cursor: cursor };
        }

        const endpoint = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';

        await apiSemaphore.acquire();

        try {
            const response = await fetchWithRetry(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error on list_folder/continue for path ${folderPath}! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();

            allEntries = allEntries.concat(data.entries);
            hasMore = data.has_more;
            cursor = data.cursor;
        } catch (error) {
            console.error(`Error fetching contents for folder "${extractFolderName(folderPath)}" (${folderPath}):`, error);
            throw error;
        } finally {
            apiSemaphore.release();
        }
    }

    return allEntries;
}


async function openImageModal(imagePath, index) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.getElementsByClassName('close')[0];
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');

    window.currentImageIndex = index;

    async function loadImage(path) {
        const fullSizeImageUrl = await getFullSizeImage(path);
        modalImg.src = fullSizeImageUrl;
    }

    await loadImage(imagePath);
    modal.style.display = 'block';

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    prevBtn.onclick = async function() {
        if (window.currentImageIndex > 0) {
            window.currentImageIndex--;
            await loadImage(window.allMediaFiles[window.currentImageIndex].path_lower);
        }
    }

    nextBtn.onclick = async function() {
        if (window.currentImageIndex < window.allMediaFiles.length - 1) {
            window.currentImageIndex++;
            await loadImage(window.allMediaFiles[window.currentImageIndex].path_lower);
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

async function getFullSizeImage(path) {
    try {
        const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path
                })
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error fetching full-size image:', error);
        return null;
    }
}

function injectAdditionalStyles() {
    const style = document.createElement('style');
    style.textContent += `
        .media-item-wrapper {
            overflow: hidden;
            cursor: pointer;
        }
        .media-item {
            transition: all 0.3s ease;
        }
        .media-item:hover {
            transform: scale(1.1);
            opacity: 0.8;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
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
            width: 80%;
            max-width: 700px;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            transition: 0.3s;
        }
        .close:hover,
        .close:focus {
            color: #bbb;
            text-decoration: none;
            cursor: pointer;
        }
            .nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            padding: 15px;
            font-size: 24px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .nav-button:hover {
            background-color: rgba(0, 0, 0, 0.8);
        }
        #prevImage {
            left: 20px;
        }
        #nextImage {
            right: 20px;
        }
    `;

    document.head.appendChild(style);
}

// Call this function after your existing injectStyles() call
injectAdditionalStyles();


/**
 * Main Function to List Folders and Display Images with Pagination
 */
async function listExactYearFolders(folderPath) {
    if (!year) {
        console.error('No year specified in URL parameters. Use ?year=YYYY in the URL.');
        return;
    }

    try {
        showSpinner();
        await refreshDropboxAccessToken();

        if (!folderPath.startsWith('/')) {
            folderPath = '/' + folderPath;
        }

        console.log(`Searching for '${year}' folder within '${folderPath}'...`);

        const searchResponse = await fetchWithRetry('https://api.dropboxapi.com/2/files/search_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: year,
                options: {
                    path: folderPath,
                    max_results: 1000,
                    file_status: "active",
                    filename_only: true
                },
                match_field_options: {
                    include_highlights: false
                }
            })
        });

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            console.error('Error from Dropbox API during search:', errorData);
            throw new Error(`Dropbox API Search Error: ${errorData.error_summary}`);
        }

        const searchData = await searchResponse.json();
        const yearFolderMatches = searchData.matches.filter(match =>
            match.metadata.metadata['.tag'] === 'folder' &&
            match.metadata.metadata.name === year
        );

        if (yearFolderMatches.length === 0) {
            console.error(`No '${year}' folder found within '${folderPath}'.`);
            const eventBentoGrid = document.getElementById('event-bento-grid2');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No '${year}' folder found within '${folderPath}'.`;
            eventBentoGrid.appendChild(noResultsDiv);
            hideSpinner();
            return;
        }

        const yearFolderPath = yearFolderMatches[0].metadata.metadata.path_lower;
        console.log(`Found '${year}' folder at: ${yearFolderPath}`);

        const entries = await fetchAllFolderContents(yearFolderPath);

        const eventBentoGrid = document.getElementById('event-bento-grid2');
        const picturesInFolder = document.getElementById('pictures-in-folder');

        if (!eventBentoGrid || !picturesInFolder) {
            console.error('Required elements not found');
            hideSpinner();
            return;
        }

        if (entries.length > 0) {
            const folderItems = entries.filter(item => item['.tag'] === 'folder').map(item => ({
                path_lower: item.path_lower,
                name: item.name
            }));

            console.log(`Subfolders within '${year}':`, folderItems);

            const itemsPerPage = 49;
            const totalPages = Math.ceil(folderItems.length / itemsPerPage);
            let currentPage = 1;

            async function renderPage(pageNumber) {
                const startIndex = (pageNumber - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const itemsToDisplay = folderItems.slice(startIndex, endIndex);

                eventBentoGrid.innerHTML = '';

                const renderPromises = itemsToDisplay.map(folder => processFolderItem(folder));
                await Promise.all(renderPromises);

                imagesLoaded(eventBentoGrid, function () {
                    if (!window.iso) {
                        window.iso = new Isotope(eventBentoGrid, {
                            itemSelector: '.folder-item',
                            layoutMode: 'masonry',
                            percentPosition: true,
                            masonry: {
                                columnWidth: '.folder-item',
                                horizontalOrder: true,
                                gutter: 4
                            }
                        });
                    } else {
                        window.iso.reloadItems();
                        window.iso.layout();
                    }
        
                    setResponsiveColumns(eventBentoGrid, window.iso);
                });

                updatePaginationControls();
            }

            // New function to append images and videos to pictures-in-folder
            async function appendMediaToPicturesInFolder() {
                picturesInFolder.innerHTML = ''; // Clear existing content
            
                const mediaFiles = entries.filter(item => 
                    item['.tag'] === 'file' && 
                    /\.(jpg|jpeg|png|gif)$/i.test(item.name) // Only include image files
                );
            
                window.allMediaFiles = mediaFiles; // Store all media files globally
            
                const appendPromises = mediaFiles.map(async (file, index) => {
                    const fileWrapper = document.createElement('div');
                    fileWrapper.className = 'media-item-wrapper';
            
                    const fileElement = document.createElement('img');
                    fileElement.className = 'media-item';
                    
                    // Add click event for images to open modal
                    fileElement.onclick = () => openImageModal(file.path_lower, index);
            
                    const thumbnailUrl = await getThumbnail(file.path_lower);
                    fileElement.src = thumbnailUrl;
                    fileElement.alt = file.name;
            
                    fileWrapper.appendChild(fileElement);
                    picturesInFolder.appendChild(fileWrapper);
                });
            
                await Promise.all(appendPromises);
            
                // Initialize Isotope for pictures-in-folder
                imagesLoaded(picturesInFolder, function() {
                    if (!window.isoPictures) {
                        window.isoPictures = new Isotope(picturesInFolder, {
                            itemSelector: '.media-item-wrapper',
                            layoutMode: 'masonry',
                            masonry: {
                                columnWidth: '.media-item-wrapper',
                                gutter: 10
                            }
                        });
                    } else {
                        window.isoPictures.reloadItems();
                        window.isoPictures.layout();
                    }
                });
            }

            async function processFolderItem(folder) {
                const imageData = await getMostRecentImageFromFolder(folder.path_lower);
                if (imageData && imageData.thumbnail) {
                    const folderLink = document.createElement('a');
                    folderLink.className = 'folder-item';
                    const encodedFolderPath = encodeURIComponent(folder.path_lower);
                    folderLink.href = `family-pictures.html?year=${encodeURIComponent(year)}&path=${encodedFolderPath}`;

                    const img = document.createElement('img');
                    img.alt = folder.name;
                    img.loading = 'lazy';
                    img.src = imageData.thumbnail;

                    folderLink.appendChild(img);

                    const noiseOverlay = document.createElement('div');
                    noiseOverlay.className = 'noise-overlay';
                    folderLink.appendChild(noiseOverlay);

                    const caption = document.createElement('div');
                    caption.className = 'caption';
                    caption.textContent = folder.name;

                    folderLink.appendChild(caption);
                    eventBentoGrid.appendChild(folderLink);
                }
            }

            function createPaginationControls() {
                const existingControls = document.getElementById('pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }

                if (totalPages <= 1) return;

                const paginationDiv = document.createElement('div');
                paginationDiv.id = 'pagination-controls';

                const prevButton = document.createElement('button');
                prevButton.textContent = 'Previous';
                prevButton.className = 'pagination-button';
                if (currentPage === 1) {
                    prevButton.classList.add('disabled');
                    prevButton.disabled = true;
                }
                prevButton.onclick = () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPage(currentPage);
                    }
                };
                paginationDiv.appendChild(prevButton);

                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    pageButton.className = 'pagination-button';
                    if (i === currentPage) {
                        pageButton.classList.add('active');
                    }
                    pageButton.onclick = () => {
                        currentPage = i;
                        renderPage(i);
                    };
                    paginationDiv.appendChild(pageButton);
                }

                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next';
                nextButton.className = 'pagination-button';
                if (currentPage === totalPages) {
                    nextButton.classList.add('disabled');
                    nextButton.disabled = true;
                }
                nextButton.onclick = () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderPage(currentPage);
                    }
                };
                paginationDiv.appendChild(nextButton);

                eventBentoGrid.parentNode.insertBefore(paginationDiv, eventBentoGrid.nextSibling);
            }

            function updatePaginationControls() {
                const existingControls = document.getElementById('pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }
                createPaginationControls();
            }

            await renderPage(currentPage);
            await appendMediaToPicturesInFolder(); // Call the new function to append media

            window.addEventListener('resize', debounce(() => {
                setResponsiveColumns(eventBentoGrid, window.iso);
                if (window.isoPictures) {
                    window.isoPictures.layout();
                }
            }, 200));

            createPaginationControls();
            hideSpinner();

        } else {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No folders found in '${yearFolderPath}'.`;
            eventBentoGrid.appendChild(noResultsDiv);
            hideSpinner();
        }

        console.log(`Finished listing folders for ${year} in '${yearFolderPath}'.`);

    } catch (error) {
        console.error('Error listing folders:', error);
        console.error('Error details:', error.message);
        hideSpinner();
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        document.getElementById('event-bento-grid2').appendChild(errorDiv);
    }
}


document.body.insertAdjacentHTML('beforeend', `
    <div id="imageModal" class="modal">
        <span class="close">&times;</span>
        <button id="prevImage" class="nav-button">&lt;</button>
        <button id="nextImage" class="nav-button">&gt;</button>
        <img class="modal-content" id="modalImage">
    </div>
`);