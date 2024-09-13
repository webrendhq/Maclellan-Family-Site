// Import the functions you need from the SDKs you need
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
  

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, continue to show the restricted page.
    } else {
      // No user is signed in, redirect to login page.
      window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/index';
    }
});

let cursor = null;
let startIndex = 0;
let currentQuery = "";
let hasMore = false;

// Function to search Dropbox files and append results
async function searchDropboxFiles(query, startIndex = 0) {
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

    return searchResults;
}

// Function to append search results to the DOM
async function appendResults(results) {
    const container = document.getElementById('search-results');
    if (startIndex === 0) {
        container.innerHTML = ''; // Clear previous results only on new search
    }

    let appendedCount = 0;

    for (const file of results) {
        if (appendedCount >= 25) { // Stop appending after 25 elements
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

    // Show "Load More" button if there are more results or we've appended less than 25 items
    if (hasMore || appendedCount === 25) {
        appendLoadMoreButton();
    } else {
        hideLoadMoreButton();
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
    const results = await searchDropboxFiles(currentQuery, startIndex);
    await appendResults(results);
}

// Function to handle the search
async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    currentQuery = searchInput.value.trim();
    
    if (currentQuery) {
        startIndex = 0;
        cursor = null; // Reset cursor for new search
        const results = await searchDropboxFiles(currentQuery);
        await appendResults(results);
    }
}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', handleSearch);

// Add event listener for pressing Enter in the search input
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
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

