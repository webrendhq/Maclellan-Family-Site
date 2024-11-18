// main.js

// Import necessary functions and tokens
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
        // If a user is signed in, start listing folders
        await listExactYearFolders();
    }
});

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');

// Inject necessary CSS styles
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* [Your existing CSS styles here] */
        /* ... (omitted for brevity) ... */
        
        /* Container for each folder item */
        .folder-item {
            position: relative;
            transform: scale(1); 
            transition: box-shadow 0.3s ease, transform 0.3s ease;
            overflow: hidden; /* Ensure child elements don't overflow */
            cursor: pointer; /* Indicate clickable item */
            flex: 1 1 auto;
            min-width: 200px; /* Minimum width to maintain layout */
            height: auto; /* Adjust height as needed */
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-bottom: 4px;
            z-index: 0;
        }

        /* Hover effect with box shadow and slight scale-up */
        .folder-item:hover {
            box-shadow: 0 8px 50px rgba(0, 0, 0, 0.3);
            transform: scale(1.10); /* Slightly scale up on hover */
            z-index: 99;
            box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.5); /* Inner box shadow */
        }

        /* Image styling with blur filter */
        .folder-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: filter 0.3s ease;
            border-radius: 8px;
            position: relative; /* Added to establish stacking context */
            z-index: 1; /* Ensure image is below the noise overlay */
        }

        /* Remove blur on hover for better visibility */
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
            font-weight: 800; /* Extra bold */
            font-size: 1.2em; /* Adjust as needed */
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none; /* Ensure caption doesn't block hover */
            background: rgba(0, 0, 0, 0.3); /* Semi-transparent background for better text visibility */
            z-index: 2; /* Ensure caption is above the noise overlay */
        }

        /* Show caption on hover */
        .folder-item:hover .caption {
            opacity: 1;
            z-index: 99;
        }

        /* Noise Overlay Styling */
        .noise-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('./images/noise.png'); /* Relative path to noise.png */
            background-repeat: repeat;
            opacity: 1; /* Adjust opacity as needed */
            pointer-events: none; /* Allow clicks to pass through */
            z-index: 9999; /* Ensure noise overlay is above the caption */
            box-shadow: inset 0px 0px 50px rgba(0, 0, 0, 1); /* Inner box shadow */
        }

        /* Ensure the grid is responsive */
        #event-bento-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center; /* Center items horizontally */
            padding: 20px; /* Add some padding around the grid */
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
            border: 2px solid #000000;
            border-radius: 4px;
            font-size: 16px;
            transition: background-color 0.3s ease;
            box-shadow: -3px 3px 0px 0px #000000;
            transition: all 0.3s ease;
        }

        .pagination-button:hover {
            transform: translate(-3px, 3px);
            box-shadow: -0px 0px 0px 0px #000000;
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
            z-index: 10000; /* Above other elements */
            display: block; /* Visible by default */
        }

        .spinner {
            border: 16px solid #f3f3f3; /* Light grey */
            border-top: 16px solid #007BFF; /* Blue */
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
            white-space: nowrap; /* added line */
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

// Call the function to inject styles
injectStyles();

/**
 * IndexedDB Utility Functions
 */
const dbName = 'FamilyPicturesDB';
const dbVersion = 2; // Updated to 2 to match existing version
let db;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.error("Your browser doesn't support a stable version of IndexedDB.");
            reject(new Error("IndexedDB not supported"));
            return;
        }

        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const oldVersion = event.oldVersion;
            const newVersion = event.newVersion || db.version;
            console.log(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);

            if (oldVersion < 1) {
                // Initial setup for version 1
                if (!db.objectStoreNames.contains('folders')) {
                    const folderStore = db.createObjectStore('folders', { keyPath: 'path_lower' });
                    folderStore.createIndex('path_lower', 'path_lower', { unique: true });
                }
            }

            if (oldVersion < 2) {
                // Setup for version 2
                // Example: Adding a new index or object store
                // if (!db.objectStoreNames.contains('images')) {
                //     const imageStore = db.createObjectStore('images', { keyPath: 'imagePath' });
                //     imageStore.createIndex('imagePath', 'imagePath', { unique: true });
                // }
            }

            // Add further version upgrades here if needed
        };
    });
}

// Save folder data to IndexedDB
function saveFoldersToDB(folders) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['folders'], 'readwrite');
        const store = transaction.objectStore('folders');

        folders.forEach(folder => {
            store.put(folder);
        });

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Retrieve folder data from IndexedDB
function getFoldersFromDB(year) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['folders'], 'readonly');
        const store = transaction.objectStore('folders');
        const index = store.index('path_lower');

        // Assuming folder paths contain the year
        const folders = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.name === year) {
                    folders.push(cursor.value);
                }
                cursor.continue();
            } else {
                resolve(folders);
            }
        };

        request.onerror = (event) => {
            console.error('Cursor error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Clear all folders from IndexedDB (Optional)
function clearFoldersFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['folders'], 'readwrite');
        const store = transaction.objectStore('folders');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            resolve();
        };

        clearRequest.onerror = (event) => {
            console.error('Clear error:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Thumbnail Fetching with Concurrency Control and Retry Mechanism
 */

// Configuration for thumbnail fetching
const THUMBNAIL_CONCURRENCY_LIMIT = 12; // Further increased from 10 to 15
const RETRY_LIMIT = 5; // Maximum number of retries for failed requests
const INITIAL_BACKOFF = 1000; // Initial backoff time in ms

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

// Separate semaphore for general API calls to manage overall concurrency
const API_CONCURRENCY_LIMIT = 12; // Further increased from 10 to 15
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
                await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000)); // Adding 1 second buffer
            } else {
                throw new Error(`Max retries reached for ${url}`);
            }
        } catch (error) {
            if (attempt < retries) {
                const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt); // Exponential backoff
                console.warn(`Fetch error: ${error.message}. Retrying after ${backoffTime} ms... (Attempt ${attempt + 1} of ${RETRY_LIMIT})`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Function to fetch thumbnail blob with retries and backoff
 * @param {string} path - Dropbox path of the file
 * @param {number} retryCount - Current retry attempt
 */
async function getThumbnailBlob(path, retryCount = 0) {
    const size = 'w128h128'; // Enforce 128x128 resolution
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
                    size: size // Always use 'w128h128'
                }),
                'Content-Type': 'application/octet-stream' // Corrected Content-Type
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get error details
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
        return './images/placeholder.png'; // Ensure you have a placeholder.png in your images folder
    }
}

// Function to extract folder name from path
function extractFolderName(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'Unnamed Folder';
}

/**
 * Function to get the most recent image from a folder and its thumbnail
 * @param {string} folderPath - Dropbox path of the folder
 */
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
                include_media_info: true, // Enable media info
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
            return dateB - dateA; // Most recent first
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

// Create and append loading spinner
function createLoadingSpinner() {
    const spinnerContainer = document.createElement('div');
    spinnerContainer.id = 'loading-spinner';
    spinnerContainer.setAttribute('role', 'status');
    spinnerContainer.setAttribute('aria-live', 'polite');

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true'); // Hide from screen readers

    spinnerContainer.appendChild(spinner);

    const loadingText = document.createElement('span');
    loadingText.className = 'sr-only'; // Screen reader only
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
    const minItemWidth = 200; // Minimum desired width for each item
    const gutter = 4; // Gutter defined in Isotope

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

/**
 * Main Function to List Folders and Display Images with Pagination
 */
async function listExactYearFolders() {
    if (!year) {
        console.error('No year specified in URL parameters. Use ?year=YYYY in the URL.');
        return;
    }

    try {
        // Show spinner at the very start
        showSpinner();

        // Initialize IndexedDB
        await initDB();

        let exactMatches = await getFoldersFromDB(year);

        if (exactMatches.length === 0) {
            // If no cached data, fetch from Dropbox API
            await refreshDropboxAccessToken(); // Ensure accessToken is fresh
            console.log(`Searching for folders named exactly '${year}'...`);

            // Fetch folders named exactly as the year using list_folder
            exactMatches = await fetchExactYearFolders(year);

            if (exactMatches.length > 0) {
                // Save fetched folders to IndexedDB
                await saveFoldersToDB(exactMatches);
            }
        } else {
            console.log(`Loaded ${exactMatches.length} cached folders for year '${year}'.`);
        }

        const eventBentoGrid = document.getElementById('event-bento-grid');
        if (!eventBentoGrid) {
            console.error('Element with id "event-bento-grid" not found');
            hideSpinner(); // Hide spinner if grid is not found
            return;
        }

        if (exactMatches.length > 0) {
            // Collect all folder paths
            const folderPaths = exactMatches.map(match => match.path_lower);

            /**
             * Function to fetch all folder contents handling has_more
             */
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
                        requestBody = {
                            cursor: cursor
                        };
                    }

                    const endpoint = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';

                    // Acquire API semaphore before making the request
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
                        throw error; // Rethrow to be caught by outer try-catch
                    } finally {
                        // Release API semaphore
                        apiSemaphore.release();
                    }
                }

                return allEntries;
            }

            // Fetch all folder contents with handling for has_more
            const folderContentsPromises = folderPaths.map(folderPath => 
                fetchAllFolderContents(folderPath).then(entries => ({
                    path_lower: folderPath,
                    entries: entries
                })).catch(error => {
                    console.error(`Error fetching contents for folder "${extractFolderName(folderPath)}" (${folderPath}):`, error);
                    return null; // Return null for failed fetches
                })
            );

            const folderContentsResults = await Promise.all(folderContentsPromises);

            // Collect all folder items (subfolders within each year folder)
            const folderItems = folderContentsResults.flatMap(result => {
                if (!result) return []; // Skip if fetch failed
                return result.entries.filter(item => item['.tag'] === 'folder').map(item => ({
                    path_lower: item.path_lower,
                    name: item.name
                }));
            });

            // Log all folder items to the console
            console.log(`Subfolders within '${year}':`, folderItems);

            // To optimize speed, fetch image data in parallel with higher concurrency
            // and render folder items as they become available.

            // Pagination Variables
            const itemsPerPage = 49;
            const totalPages = Math.ceil(folderItems.length / itemsPerPage);
            let currentPage = 1;

            // Function to render a specific page
            async function renderPage(pageNumber) {
                // Calculate start and end indices
                const startIndex = (pageNumber - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const itemsToDisplay = folderItems.slice(startIndex, endIndex);

                // Clear existing items in the grid
                eventBentoGrid.innerHTML = '';

                // Function to process and append a single folder item
                async function processFolderItem(folder) {
                    const imageData = await getMostRecentImageFromFolder(folder.path_lower);
                    if (imageData && imageData.thumbnail) {
                        // Create an 'a' element
                        const folderLink = document.createElement('a');
                        folderLink.className = 'folder-item';

                        // Set the href attribute to include year and folderPath (exclude imagePath)
                        const encodedFolderPath = encodeURIComponent(folder.path_lower);
                        const href = `family-pictures.html?year=${encodeURIComponent(year)}&path=${encodedFolderPath}`;
                        folderLink.href = href;

                        // Create an img element
                        const img = document.createElement('img');
                        img.alt = folder.name;
                        img.loading = 'lazy'; // Implement lazy loading

                        // Set the src attribute
                        img.src = imageData.thumbnail;

                        // Append the image to the folder link
                        folderLink.appendChild(img);

                        // **Add Noise Overlay**
                        const noiseOverlay = document.createElement('div');
                        noiseOverlay.className = 'noise-overlay';
                        folderLink.appendChild(noiseOverlay);
                        // **End of Noise Overlay**

                        // Create a caption element with the folder's name
                        const caption = document.createElement('div');
                        caption.className = 'caption';
                        caption.textContent = folder.name; // Use folder name for caption

                        // Append the caption to the folder link
                        folderLink.appendChild(caption);

                        // Append the folder link to the grid
                        eventBentoGrid.appendChild(folderLink);
                    }
                }

                // Fetch and render all items in parallel, respecting the concurrency limit
                const MAX_RENDER_CONCURRENCY = API_CONCURRENCY_LIMIT; // Using the same as API semaphore
                const renderSemaphore = new Semaphore(MAX_RENDER_CONCURRENCY);

                const renderPromises = itemsToDisplay.map(folder => (async () => {
                    await renderSemaphore.acquire();
                    try {
                        await processFolderItem(folder);
                    } finally {
                        renderSemaphore.release();
                    }
                })());

                // Wait for all render operations in the page to complete
                await Promise.all(renderPromises);

                // Use imagesLoaded to ensure all images are loaded before initializing Isotope
                imagesLoaded(eventBentoGrid, function () {
                    // Initialize or Update Isotope
                    if (!window.iso) {
                        window.iso = new Isotope(eventBentoGrid, {
                            itemSelector: '.folder-item',
                            layoutMode: 'masonry',
                            percentPosition: true,
                            masonry: {
                                columnWidth: '.folder-item',
                                horizontalOrder: true,
                                gutter: 4 // Set gutter to 4px
                            }
                        });
                    } else {
                        window.iso.reloadItems();
                        window.iso.layout();
                    }

                    // Set responsive columns
                    setResponsiveColumns(eventBentoGrid, window.iso);
                });

                // Scroll to top of grid on page change
                window.scrollTo({
                    top: eventBentoGrid.offsetTop - 20,
                    behavior: 'smooth'
                });

                // Update pagination controls
                updatePaginationControls();
            }

            // Function to create and update pagination controls
            function createPaginationControls() {
                // Remove existing pagination controls if any
                const existingControls = document.getElementById('pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }

                // Do not create controls if only one page
                if (totalPages <= 1) return;

                const paginationDiv = document.createElement('div');
                paginationDiv.id = 'pagination-controls';

                // Previous Button
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

                // Page Numbers
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

                // Next Button
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

                // Append pagination controls after the grid
                eventBentoGrid.parentNode.insertBefore(paginationDiv, eventBentoGrid.nextSibling);
            }

            // Function to update pagination controls based on current page
            function updatePaginationControls() {
                // Remove existing pagination controls
                const existingControls = document.getElementById('pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }

                // Recreate pagination controls
                createPaginationControls();
            }

            // Initial render
            await renderPage(currentPage);

            // Add event listener for window resize to adjust columns
            window.addEventListener('resize', debounce(() => {
                setResponsiveColumns(eventBentoGrid, window.iso);
            }, 200));

            // Create pagination controls
            createPaginationControls();

            // Hide spinner after all folders and images have been processed and rendered
            hideSpinner();

        } else {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No folders named exactly '${year}' were found.`;
            eventBentoGrid.appendChild(noResultsDiv);
            hideSpinner(); // Hide spinner as loading is complete
        }

        console.log(`Finished listing folders for ${year}.`);
    } catch (error) {
        console.error('Error searching Dropbox folders:', error);
        console.error('Error details:', error ? error.message : 'Unknown error');

        // Hide spinner in case of error
        hideSpinner();

        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error ? error.message : 'Unknown error'}`;
        const eventBentoGrid = document.getElementById('event-bento-grid');
        if (eventBentoGrid) {
            eventBentoGrid.appendChild(errorDiv);
        }
    }
}

/**
 * Fetch Folders Named Exactly as the Year Using list_folder
 * This function replaces the search_v2 logic.
 */
async function fetchExactYearFolders(year) {
    await refreshDropboxAccessToken(); // Ensure accessToken is fresh
    console.log(`Fetching folders named exactly '${year}' using list_folder...`);

    const folderMatches = [];

    // Acquire API semaphore
    await apiSemaphore.acquire();

    try {
        // Initial list_folder request
        const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: "", // Root directory
                recursive: true, // Search recursively
                include_media_info: false,
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

        // Process entries
        data.entries.forEach(entry => {
            if (entry['.tag'] === 'folder' && entry.name === year) {
                folderMatches.push({
                    path_lower: entry.path_lower,
                    name: entry.name
                });
            }
        });

        let hasMore = data.has_more;
        let cursor = data.cursor;

        // Continue fetching if there are more entries
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

            // Process entries
            continueData.entries.forEach(entry => {
                if (entry['.tag'] === 'folder' && entry.name === year) {
                    folderMatches.push({
                        path_lower: entry.path_lower,
                        name: entry.name
                    });
                }
            });

            hasMore = continueData.has_more;
            cursor = continueData.cursor;
        }

        // Save fetched folders to IndexedDB
        if (folderMatches.length > 0) {
            await saveFoldersToDB(folderMatches);
            console.log(`Fetched and cached ${folderMatches.length} folders named '${year}'.`);
        }

        return folderMatches;

    } catch (error) {
        console.error('Error fetching folders using list_folder:', error);
        throw error; // Rethrow to be caught by outer try-catch
    } finally {
        // Release API semaphore
        apiSemaphore.release();
    }
}
