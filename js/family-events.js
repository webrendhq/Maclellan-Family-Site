// Import necessary functions and tokens
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

// Initialize authentication state listener
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    }
    // If a user is signed in, do nothing and allow access to the current page.
    else {
        listExactYearFolders(); // Start listing folders
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
            overflow: hidden; /* Ensure child elements don't overflow */
            cursor: pointer; /* Indicate clickable item */
            /* Remove fixed width and use flex-basis for responsiveness */
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
            background-image: url('../images/noise.png');
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
            /* Removed gap: 16px; to let Isotope handle spacing */
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

// Modified getThumbnailBlob to always use 'w128h128' and implement caching
async function getThumbnailBlob(path, retryCount = 0) {
    const size = 'w128h128'; // Enforce 128x128 resolution
    const cacheKey = `${path}_${size}`;
    const cache = await caches.open('thumbnails-cache');

    // Check if the image is already in the cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return await cachedResponse.blob();
    }

    // If not in cache, fetch the image
    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path,
                    format: 'jpeg',
                    size: size // Always use 'w128h128'
                }),
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 429) {
            if (retryCount < 5) {
                const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                console.log(`Rate limit reached. Retrying after ${backoffTime / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return getThumbnailBlob(path, retryCount + 1); // Retry request
            } else {
                throw new Error(`Max retry attempts reached for path ${path}`);
            }
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clone the response so we can store it in the cache
        const responseClone = response.clone();
        cache.put(cacheKey, responseClone);

        return await response.blob();
    } catch (error) {
        console.error('Error fetching thumbnail:', error);
        return null;
    }
}


// Function to create object URL for the thumbnail
async function getThumbnail(path) {
    const blob = await getThumbnailBlob(path);
    if (blob) {
        const url = URL.createObjectURL(blob);
        return url;
    } else {
        console.error(`Failed to fetch thumbnail for path ${path}`);
        return null;
    }
}

// Function to extract folder name from path
function extractFolderName(path) {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'Unnamed Folder';
}

// Function to get the most recent image from a folder and its thumbnail
async function getMostRecentImageFromFolder(folderPath) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Filter files that are images based on media_info or file extensions
        const imageFiles = data.entries.filter(entry =>
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

// Function to calculate and set the number of columns
function setResponsiveColumns(eventBentoGrid, iso) {
    const gridWidth = eventBentoGrid.clientWidth;
    const minItemWidth = 200; // Minimum desired width for each item
    const gutter = 0; // Gutter defined in Isotope (16px)

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

// Main function to list folders and display images with pagination
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
            await refreshDropboxAccessToken();
            console.log(`Searching for folders named exactly '${year}'...`);

            const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: year,
                    options: {
                        path: "",
                        max_results: 1000,
                        file_status: "active",
                        filename_only: true
                    },
                    match_field_options: {
                        include_highlights: false
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            exactMatches = data.matches.filter(match =>
                match.metadata.metadata['.tag'] === 'folder' &&
                match.metadata.metadata.name === year
            ).map(match => ({
                path_lower: match.metadata.metadata.path_lower,
                name: match.metadata.metadata.name
            }));

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

            // Fetch contents for all folders in parallel
            const folderContentsPromises = folderPaths.map(folderPath => fetch('https://api.dropboxapi.com/2/files/list_folder', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: folderPath,
                    recursive: false,
                    include_media_info: false,
                    include_deleted: false,
                    include_has_explicit_shared_members: false,
                    include_mounted_folders: false,
                    limit: 2000
                })
            }));

            const folderContentsResponses = await Promise.all(folderContentsPromises);

            // Check for any failed fetches
            folderContentsResponses.forEach((response, index) => {
                if (!response.ok) {
                    console.error(`HTTP error fetching contents for folder ${folderPaths[index]}! status: ${response.status}`);
                }
            });

            // Parse all folder contents
            const folderContentsData = await Promise.all(folderContentsResponses.map(res => res.ok ? res.json() : Promise.resolve(null)));

            // Collect all folder items (subfolders within each year folder)
            const folderItems = folderContentsData.flatMap((folderData, idx) => {
                if (!folderData) return []; // Skip if fetch failed
                return folderData.entries.filter(item => item['.tag'] === 'folder').map(item => ({
                    path_lower: item.path_lower,
                    name: item.name
                }));
            });

            // Fetch the most recent image for all folders in parallel
            const imageDataPromises = folderItems.map(item => 
                getMostRecentImageFromFolder(item.path_lower).then(imageData => ({
                    ...imageData,
                    folderName: item.name,
                    folderPath: item.path_lower // Add folderPath to the data
                }))
            );
            const allImageData = await Promise.all(imageDataPromises);

            // Filter out folders without images
            const validImageData = allImageData.filter(data => data && data.thumbnail);

            if (validImageData.length === 0) {
                const noImagesDiv = document.createElement('div');
                noImagesDiv.textContent = `No images found in the subfolders of '${year}'.`;
                eventBentoGrid.appendChild(noImagesDiv);
                hideSpinner(); // Hide spinner as loading is complete
                return;
            }

            // Pagination Variables
            const itemsPerPage = 49;
            const totalPages = Math.ceil(validImageData.length / itemsPerPage);
            let currentPage = 1;

            // Function to render a specific page
            function renderPage(pageNumber) {
                // Calculate start and end indices
                const startIndex = (pageNumber - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const itemsToDisplay = validImageData.slice(startIndex, endIndex);
            
                // Clear existing items in the grid
                eventBentoGrid.innerHTML = '';
            
                // Append new items
                itemsToDisplay.forEach(data => {
                    // Create an 'a' element
                    const folderLink = document.createElement('a');
                    folderLink.className = 'folder-item';
            
                    // Set the href attribute to include year and folderPath (exclude imagePath)
                    const encodedFolderPath = encodeURIComponent(data.folderPath);
                    const href = `family-pictures.html?year=${encodeURIComponent(year)}&path=${encodedFolderPath}`;
                    folderLink.href = href;
            
                    // Create an img element
                    const img = document.createElement('img');
                    img.alt = data.folderName;
                    img.loading = 'lazy'; // Implement lazy loading
            
                    // Set the src attribute
                    img.src = data.thumbnail;
            
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
                    caption.textContent = data.folderName; // Use folder name for caption
            
                    // Append the caption to the folder link
                    folderLink.appendChild(caption);
            
                    // Append the folder link to the grid
                    eventBentoGrid.appendChild(folderLink);
                });
            
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
                                gutter: 4 // Set gutter to 16px
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
            renderPage(currentPage);

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

// Call the main function to list folders
listExactYearFolders();
