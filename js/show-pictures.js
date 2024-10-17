// Import necessary functions and tokens
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

/**
 * External Libraries:
 * Ensure that Isotope and imagesLoaded are loaded via script tags in your HTML.
 * They are available as global variables `Isotope` and `imagesLoaded`.
 */

// Initialize admin flag
let isAdmin = false;

// Pagination Configuration
const ITEMS_PER_PAGE = 49;
let currentPage = 1;
let totalPages = 1;

// Semaphore class for concurrency control
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

// Concurrency Limits
const API_CONCURRENCY_LIMIT = 10;
const apiSemaphore = new Semaphore(API_CONCURRENCY_LIMIT);

// Placeholder for mediaFiles array
let mediaFiles = [];

/**
 * Function to create and append loading spinner
 */
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

/**
 * Functions to show and hide the spinner
 */
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Create the spinner element
createLoadingSpinner();

/**
 * Debounce function to limit how often a function can fire
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Inject necessary CSS styles (Includes pagination, noise overlay, etc.)
 */
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Container for each file item */
        .file-item {
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
            margin-bottom: 16px;
            background-color: #000; /* Optional: Background color for better noise overlay visibility */
        }

        /* Hover effect with box shadow and slight scale-up */
        .file-item:hover {
            box-shadow: 0 8px 50px rgba(0, 0, 0, 0.3);
            transform: scale(1.05);
            z-index: 2;
        }

        /* Image styling with blur filter */
        .file-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(0px);
            transition: filter 0.3s ease;
            border-radius: 8px;
            position: relative;
            z-index: 1;
        }

        /* Remove blur on hover for better visibility */
        .file-item:hover img {
            filter: blur(0);
        }

        /* Caption styling */
        .file-item .caption {
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
            pointer-events: none;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            z-index: 2;
        }

        /* Show caption on hover */
        .file-item:hover .caption {
            opacity: 1;
        }

        /* Noise Overlay Styling */
        .noise-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('./images/noise.png'); /* Ensure this path is correct */
            background-repeat: repeat;
            opacity: 1;
            pointer-events: none;
            z-index: 3;
        }

        /* Ensure the grid is responsive */
        #event-n-year-bento-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px;
            gap: 16px;
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
            bottom: 20px;
            right: 20px;
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
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
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
            display: none; /* Hidden by default */
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
            z-index: 1002;
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
        #file-modal {
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

        #file-modal-body {
            margin: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        #file-modal-body img, #file-modal-body video {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            transition: 0.3s;
            z-index: 1002;
        }
        .close:hover,
        .close:focus {
            color: #bbb;
            text-decoration: none;
            cursor: pointer;
        }
        #download-link {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            z-index: 1002;
        }
    `;
    document.head.appendChild(style);
}

// Call the function to inject styles
injectStyles();

/**
 * Authentication State Listener
 */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    } else {
        // Check if the user is an admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
        // If a user is signed in, allow access to the current page and list images.
        listImagesAndVideosInFolder();
    }
});

/**
 * Function to create a delete button for admin users
 */
function createDeleteButton(file) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '&#10006;'; // 'x' character
    deleteButton.className = 'delete-button';
    deleteButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: red;
        z-index: 10;
    `;
    
    deleteButton.onclick = (e) => {
        e.stopPropagation(); // Prevent opening the image modal
        showDeleteConfirmationModal(file);
    };
    
    return deleteButton;
}

/**
 * Function to show a delete confirmation modal
 */
function showDeleteConfirmationModal(file) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.4);
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: #fefefe;
        padding: 20px;
        border-radius: 5px;
        text-align: center;
    `;
    
    modalContent.innerHTML = `
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete ${file.name}?</p>
        <button id="confirmDelete" style="margin-right: 10px;">Yes, Delete</button>
        <button id="cancelDelete">Cancel</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    document.getElementById('confirmDelete').onclick = () => {
        deleteFile(file);
        document.body.removeChild(modal);
    };
    
    document.getElementById('cancelDelete').onclick = () => {
        document.body.removeChild(modal);
    };
}

/**
 * Function to delete a file from Dropbox
 */
async function deleteFile(file) {
    try {
        await refreshDropboxAccessToken();
        const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: file.path_lower
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the file from the UI
        const fileElement = document.querySelector(`[data-path="${file.path_lower}"]`);
        if (fileElement) {
            fileElement.remove();
        }

        console.log(`File deleted successfully: ${file.name}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete the file. Please try again.');
    }
}

/**
 * Function to get URL parameters
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');
const path = getUrlParameter('path');

/**
 * Function to perform fetch with retry on 429 errors
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries left
 */
async function fetchWithRetry(url, options, retries = 5) {
    const INITIAL_BACKOFF = 1000; // 1 second
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status !== 429) {
                return response;
            }
            if (attempt < retries) {
                let retryAfter = 5; // Default retry after 5 seconds
                try {
                    const data = await response.json();
                    if (data.error && data.error.retry_after) {
                        retryAfter = data.error.retry_after;
                    }
                } catch (e) {
                    console.warn('Failed to parse retry_after from response.');
                }
                console.warn(`Rate limited. Retrying after ${retryAfter} seconds... (Attempt ${attempt + 1} of ${retries})`);
                await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000)); // Adding 1 second buffer
            } else {
                throw new Error(`Max retries reached for ${url}`);
            }
        } catch (error) {
            if (attempt < retries) {
                const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt); // Exponential backoff
                console.warn(`Fetch error: ${error.message}. Retrying after ${backoffTime} ms... (Attempt ${attempt + 1} of ${retries})`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Function to get thumbnail blob with retries and backoff
 * @param {string} filePath - Dropbox path of the file
 */
async function getThumbnailBlob(filePath) {
    const size = 'w128h128'; // Fixed size
    const cacheKey = `${filePath}_${size}`;
    const cache = await caches.open('thumbnails-cache');

    // Check if the image is already in the cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return await cachedResponse.blob();
    }

    // Acquire semaphore before making the request
    await apiSemaphore.acquire();

    try {
        const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/get_thumbnail_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    resource: {
                        ".tag": "path",
                        "path": filePath
                    },
                    format: {
                        ".tag": "jpeg"
                    },
                    size: {
                        ".tag": size
                    },
                    mode: {
                        ".tag": "strict"
                    }
                }),
                'Content-Type': 'application/octet-stream' // Correct Content-Type
            },
            body: '' // Empty body as per Dropbox API requirements
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
        console.error(`Error fetching thumbnail for path ${filePath}:`, error);
        return null;
    } finally {
        // Release the semaphore regardless of success or failure
        apiSemaphore.release();
    }
}

/**
 * Function to create object URL for the thumbnail
 */
async function getThumbnail(filePath) {
    const blob = await getThumbnailBlob(filePath);
    if (blob) {
        const url = URL.createObjectURL(blob);
        return url;
    } else {
        // Return a placeholder image or null
        return './images/placeholder.png'; // Ensure you have a placeholder.png in your images folder
    }
}

/**
 * Function to get all thumbnails (currently only 'w128h128')
 */
async function getThumbnails(filePath) {
    const size = 'w128h128'; // Only one size
    const thumbnails = {};

    const blob = await getThumbnailBlob(filePath);
    if (blob) {
        const url = URL.createObjectURL(blob);
        thumbnails[size] = url;
    } else {
        console.error(`Failed to fetch thumbnail of size ${size} for path ${filePath}`);
    }

    return thumbnails;
}

async function getTemporaryLink(filePath) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: filePath })
        });

        if (!response.ok) throw new Error('Failed to get temporary link');
        const data = await response.json();
        return data.link;
    } catch (error) {
        console.error('Error getting temporary link:', error);
        return null;
    }
}

/**
 * Function to open the modal and display the content
 */
function openModal(tempLink, fileName, folderName, index) {
    const modal = document.getElementById('file-modal');
    const modalBody = document.getElementById('file-modal-body');
    if (!modal || !modalBody) {
        console.error('Modal elements not found');
        return;
    }

    // Clear previous content
    modalBody.innerHTML = '';

    // Determine if the file is an image or video
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'];

    let mediaElement;
    if (imageExtensions.includes(extension)) {
        mediaElement = document.createElement('img');
        mediaElement.src = tempLink;
    } else if (videoExtensions.includes(extension)) {
        mediaElement = document.createElement('video');
        mediaElement.src = tempLink;
        mediaElement.controls = true;
    } else {
        mediaElement = document.createElement('div');
        mediaElement.textContent = 'Unsupported file type';
    }

    mediaElement.style.maxWidth = '100%';
    mediaElement.style.maxHeight = '80vh';
    mediaElement.alt = fileName;
    modalBody.appendChild(mediaElement);

    // Add folder name caption
    const folderCaption = document.createElement('div');
    folderCaption.textContent = `Folder: ${folderName}`;
    folderCaption.style.marginTop = '10px';
    modalBody.appendChild(folderCaption);

    // Show the modal
    modal.style.display = 'block';
}

/**
 * Event listeners for closing the modal
 */
const modalClose = document.getElementById('file-modal-close');
modalClose.onclick = function() {
    const modal = document.getElementById('file-modal');
    const modalBody = document.getElementById('file-modal-body');
    modal.style.display = 'none';
    modalBody.innerHTML = ''; // Clear content when modal is closed
};

window.onclick = function(event) {
    const modal = document.getElementById('file-modal');
    if (event.target == modal) {
        const modalBody = document.getElementById('file-modal-body');
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clear content when modal is closed
    }
};

/**
 * Function to extract folder name from path
 */
function extractFolderName(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'Unnamed Folder';
}

/**
 * Function to create and update pagination controls
 */
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

    // Page Numbers (show limited page buttons for better UX)
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
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
    const eventBentoGrid = document.getElementById('event-n-year-bento-grid');
    if (eventBentoGrid && eventBentoGrid.parentNode) {
        eventBentoGrid.parentNode.insertBefore(paginationDiv, eventBentoGrid.nextSibling);
    }
}

/**
 * Function to update pagination controls based on current page
 */
function updatePaginationControls() {
    createPaginationControls();
}

/**
 * Function to calculate and set the number of columns (optional if using Isotope)
 */
function setResponsiveColumns(eventBentoGrid, iso) {
    const gridWidth = eventBentoGrid.clientWidth;
    const minItemWidth = 200; // Minimum desired width for each item
    const gutter = 16; // Gap defined in CSS

    // Calculate the number of columns that can fit
    const columns = Math.floor((gridWidth + gutter) / (minItemWidth + gutter)) || 1;

    // Calculate the actual width for each item
    const itemWidth = Math.floor((gridWidth - (columns - 1) * gutter) / columns);

    // Select all file-item elements
    const items = eventBentoGrid.querySelectorAll('.file-item');

    // Set the width for each item
    items.forEach(item => {
        item.style.width = `${itemWidth}px`;
    });

    // Update Isotope layout
    if (iso) {
        iso.arrange();
    }
}

/**
 * Function to fetch media files with handling for pagination and concurrency
 */
async function fetchMediaFiles(folderPath) {
    const fetchedMediaFiles = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
        // Acquire API semaphore before making the request
        await apiSemaphore.acquire();

        try {
            const endpoint = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';
            const requestBody = cursor ? { cursor } : {
                path: folderPath,
                recursive: false,
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: false,
                include_mounted_folders: false,
                limit: 2000
            };

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
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();

            // Filter media files
            const fetchedFiles = data.entries.filter(entry => {
                if (entry['.tag'] === 'file') {
                    const extension = entry.name.split('.').pop().toLowerCase();
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'];
                    return imageExtensions.includes(extension) || videoExtensions.includes(extension);
                }
                return false;
            });

            fetchedMediaFiles.push(...fetchedFiles);

            hasMore = data.has_more;
            cursor = data.cursor;
        } catch (error) {
            console.error(`Error fetching media files:`, error);
            throw error;
        } finally {
            // Release API semaphore
            apiSemaphore.release();
        }
    }

    return fetchedMediaFiles;
}

/**
 * Function to render a specific page with media items
 */
async function renderPage(pageNumber) {
    const eventBentoGrid = document.getElementById('event-n-year-bento-grid');
    if (!eventBentoGrid) return;

    // Calculate start and end indices
    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = mediaFiles.slice(startIndex, endIndex);

    // Clear existing items in the grid
    eventBentoGrid.innerHTML = '';

    // Initialize or reset Isotope
    if (window.iso) {
        window.iso.destroy();
        window.iso = null;
    }

    /**
     * Function to process and append a single media item
     */
    async function processMediaItem(file, index) {
        const thumbnails = await getThumbnails(file.path_lower);
        if (thumbnails && thumbnails['w128h128']) {
            const fileLink = document.createElement('div'); // Changed to div
            fileLink.className = 'file-item';
            fileLink.style.position = 'relative';
            fileLink.dataset.path = file.path_lower;

            const img = document.createElement('img');
            img.alt = file.name;
            img.loading = 'lazy';
            img.src = thumbnails['w128h128'];

            fileLink.appendChild(img);

            const noiseOverlay = document.createElement('div');
            noiseOverlay.className = 'noise-overlay';
            fileLink.appendChild(noiseOverlay);

            if (isAdmin) {
                const deleteButton = createDeleteButton(file);
                fileLink.appendChild(deleteButton);
            }

            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = file.name;
            fileLink.appendChild(caption);

            // Add click event listener to the fileLink
            fileLink.addEventListener('click', async function(event) {
                event.preventDefault();
                try {
                    const tempLink = await getTemporaryLink(file.path_lower);
                    if (tempLink) {
                        openModal(tempLink, file.name, extractFolderName(path), startIndex + index);
                    } else {
                        console.error('Failed to get temporary link for file:', file.name);
                    }
                } catch (error) {
                    console.error('Error opening modal:', error);
                }
            });

            eventBentoGrid.appendChild(fileLink);
        }
    }

    // Function to manage concurrency when rendering items
    async function renderItemsConcurrently(items) {
        const MAX_RENDER_CONCURRENCY = API_CONCURRENCY_LIMIT; // Using the same as API semaphore
        const renderSemaphore = new Semaphore(MAX_RENDER_CONCURRENCY);

        const renderPromises = items.map((file, index) => (async () => {
            await renderSemaphore.acquire();
            try {
                await processMediaItem(file, index);
            } finally {
                renderSemaphore.release();
            }
        })());

        // Wait for all render operations in the page to complete
        await Promise.all(renderPromises);
    }

    // Fetch and render all items concurrently
    await renderItemsConcurrently(itemsToDisplay);

    // Initialize Isotope after appending all file items
    imagesLoaded(eventBentoGrid, function () {
        window.iso = new Isotope(eventBentoGrid, {
            itemSelector: '.file-item',
            layoutMode: 'masonry',
            percentPosition: true,
            masonry: {
                columnWidth: '.file-item',
                horizontalOrder: true,
                gutter: 16 // Set gutter to match CSS gap
            }
        });

        // Set responsive columns
        setResponsiveColumns(eventBentoGrid, window.iso);
    });

    // Update pagination controls
    updatePaginationControls();

    // Scroll to top of grid on page change
    window.scrollTo({
        top: eventBentoGrid.offsetTop - 20,
        behavior: 'smooth'
    });
}

/**
 * Function to list images and videos in a folder with pagination and masonry layout
 */
async function listImagesAndVideosInFolder() {
    if (!year || !path) {
        console.error('No year or path specified in URL parameters. Use ?year=YYYY&path=PATH in the URL.');
        return;
    }

    try {
        // Show spinner at the very start
        showSpinner();

        await refreshDropboxAccessToken();
        console.log(`Listing images and videos in folder '${path}' for year '${year}'...`);

        // Fetch media files with concurrency control
        mediaFiles = await fetchMediaFiles(path);

        const eventBentoGrid = document.getElementById('event-n-year-bento-grid');
        if (!eventBentoGrid) {
            console.error('Element with id "event-n-year-bento-grid" not found');
            hideSpinner(); // Hide spinner if grid is not found
            return;
        }

        // Clear existing content
        eventBentoGrid.innerHTML = '';

        // Pagination setup
        totalPages = Math.ceil(mediaFiles.length / ITEMS_PER_PAGE);
        currentPage = 1;

        if (mediaFiles.length > 0) {
            // Render the first page
            await renderPage(currentPage);
        } else {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No images or videos found in the folder '${path}'.`;
            eventBentoGrid.appendChild(noResultsDiv);
            hideSpinner();
            return;
        }

        // Create pagination controls
        createPaginationControls();

        // Hide spinner after all folders and images have been processed and rendered
        hideSpinner();

        // Add event listener for window resize to adjust columns
        window.addEventListener('resize', debounce(() => {
            if (window.iso) {
                setResponsiveColumns(eventBentoGrid, window.iso);
            }
        }, 200));

        console.log(`Finished listing images and videos for folder '${path}'.`);
    } catch (error) {
        console.error('Error listing images and videos:', error);
        console.error('Error details:', error.message);

        hideSpinner();

        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        const eventBentoGrid = document.getElementById('event-n-year-bento-grid');
        if (eventBentoGrid) {
            eventBentoGrid.appendChild(errorDiv);
        }
    }
}

// Call the main function to list images and videos
listImagesAndVideosInFolder();
