// Import the functions you need from the SDKs you need
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

let cursor = null;
let startIndex = 0;
let currentQuery = "";
let hasMore = false;

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



// Function to search Dropbox files and append results
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
                    options: { max_results: 100 } // Request more results to check if there are more
                })
            });

            if (response.ok) {
                const data = await response.json();
                searchResults = data.matches.map(match => match.metadata.metadata);
                cursor = data.has_more ? data.cursor : null; // Save the cursor only if there are more results
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
                cursor = data.has_more ? data.cursor : null; // Update cursor only if there are more results
                hasMore = data.has_more;
            } else {
                console.error('Error continuing search for Dropbox files:', response.statusText);
            }
        }
    } catch (error) {
        console.error('Error during search or continue search:', error);
    }

    console.log("Search results:", searchResults);
    return searchResults;
}

const itemClasses = [
    "bento-grid-family-photo w-node-_94965c23-ae8a-8ce0-e964-880b257bc7b7-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-ec6869a4-d13b-cd8c-e6dd-19dda5ef75a4-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-dccce7c7-c208-2da0-de4a-34a8011fdf92-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_9225746e-1b4e-b654-ae25-f860cb774aa7-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_4f41c8bf-ce48-cfea-1c26-9fa79bee9afc-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_3945aeda-f377-0051-274a-20cc734dc9f8-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_5f1a6629-3047-f65e-2a71-339c12d0b905-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_6793b981-9fe9-6b6a-f2aa-585dbcaf6bc-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_5e5a805e-3778-fd3c-f49f-faf8b86c33bb-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-_4c6d9103-222a-7e47-8b80-c0c1af28f0f-b5c26c10 w-inline-block",
    "bento-grid-family-photo w-node-e18d4e44-b537-61bd-0245-f90047d328d8-b5c26c10 w-inline-block"
];

let currentItemIndex = 0;

// Function to append search results to the DOM
async function appendResults(results) {
    const container = document.getElementById('search-grid');
    if (startIndex === 0) {
        container.innerHTML = ''; // Clear previous results only on new search
        currentItemIndex = 0; // Reset the item index on new search
    }

    let appendedCount = 0;

    for (const file of results) {
        if (appendedCount >= 11 || currentItemIndex >= 11) { // Stop appending after 11 elements
            break;
        }
        if (file['.tag'] === 'file') {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            let format = 'jpeg'; // Default format
            if (['png', 'heic'].includes(fileExtension)) {
                format = fileExtension; // Use png or heic if applicable
            }
        
            if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mkv'].includes(fileExtension)) {
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
                                size: 'w480h320'
                            })
                        }
                    });
            
                    if (!thumbnailResponse.ok) {
                        console.error('Error getting thumbnail:', thumbnailResponse.statusText);
                        continue;
                    }

                    if (tempLinkResponse.ok) {
                        const tempLinkData = await tempLinkResponse.json();
                        const previewData = await thumbnailResponse.blob();
                        
                        let previewUrl = URL.createObjectURL(previewData);
                        console.log('Thumbnail size:', previewData.size);
                        let mediaElement;
                        
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                            mediaElement = document.createElement('img');
                        } else if (['mp4', 'mov', 'avi', 'mkv'].includes(fileExtension)) {
                            mediaElement = document.createElement('video');
                            mediaElement.controls = true;
                        }

                        if (mediaElement) {
                            mediaElement.className = 'fade-in';
                            mediaElement.style.opacity = '0';  // Start fully transparent
                            mediaElement.style.transition = 'opacity 0.5s ease-in-out';
                            mediaElement.src = previewUrl;

                            const wrapper = document.createElement('div');
                            wrapper.className = itemClasses[currentItemIndex]; // Assign the appropriate class
                            wrapper.style.position = 'relative';
                            wrapper.style.display = 'inline-block';
                            wrapper.appendChild(mediaElement);
                            container.appendChild(wrapper);

                            // Trigger reflow to ensure the initial state is applied before starting the animation
                            mediaElement.offsetHeight;

                            // Start the fade-in
                            mediaElement.style.opacity = '1';

                            appendedCount++;
                            startIndex++;
                            currentItemIndex++;
                        }
                    } else {
                        console.error('Error getting temporary link:', tempLinkResponse.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching temporary link:', error);
                }
            }
        }
    }

    // Show "Load More" button if there are more results and we've appended less than 11 items
    if (hasMore && appendedCount === 11) {
        appendLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }
}

async function handleSearch(query) {
    console.log("handleSearch called with query:", query);
    if (query) {
        // Update URL with the current query
        updateURLWithQuery(query);

        startIndex = 0;
        cursor = null; // Reset cursor for new search
        currentQuery = query;
        const results = await searchDropboxFiles(query);
        await appendResults(results);
    }
}

// Separate function to initialize search from URL
async function initializeSearchFromURL() {
    console.log("initializeSearchFromURL called");
    const queryFromURL = getQueryFromURL();
    console.log("Query from URL:", queryFromURL);
    
    if (queryFromURL) {
        document.getElementById('search-input').value = queryFromURL; // Populate search input with the query from URL
        await handleSearch(queryFromURL);
    } else {
        console.log("No query found in URL");
    }
}

async function initialize() {
    console.log("Initializing...");
    try {
        await refreshDropboxAccessToken();
        console.log("Dropbox token refreshed");
        await initializeSearchFromURL();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

function appendLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more-button');
    loadMoreButton.style.display = 'flex';
}

function hideLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more-button');
    loadMoreButton.style.display = 'none';
}

async function loadMoreFiles() {
    if (currentItemIndex >= 11) {
        currentItemIndex = 0; // Reset to start assigning classes from the beginning
    }
    const results = await searchDropboxFiles(currentQuery, startIndex);
    await appendResults(results);
}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    handleSearch(searchInput.value.trim());
});

// Add event listener for pressing Enter in the search input
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch(this.value.trim());
    }
});

// Initialize by setting up the "Load More" button
const loadMoreWrapper = document.getElementById('load-more-wrapper');
const loadMoreButton = document.createElement('button');
loadMoreButton.id = 'load-more-button';
loadMoreButton.innerText = 'Load More';
loadMoreButton.style.display = 'none';
loadMoreButton.addEventListener('click', loadMoreFiles);

loadMoreWrapper.appendChild(loadMoreButton);


// At the end of your script file, replace the DOMContentLoaded event listener with this:

function domReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function() {
    console.log("DOM is ready");
    initialize();
});

// If you want to be extra sure, you can also add this:
if (document.readyState === "complete") {
    console.log("Document already complete, initializing...");
    initialize();
}