// Import the functions you need from the SDKs you need
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

let cursor = null;
let startIndex = 0;
let currentQuery = "";
let hasMore = false;
let userFolderPath = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, fetch their folder path
        try {
            const userDoc = await getDoc(doc(db, 'users', user.email));
            if (userDoc.exists()) {
                userFolderPath = userDoc.data().folderPath;
                console.log('User folder path:', userFolderPath);
            } else {
                console.error('No folder path found for user:', user.email);
            }
        } catch (error) {
            console.error('Error fetching user folder path:', error);
        }
    } else {
        // No user is signed in, redirect to login page.
        window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/';
    }
});

// Function to search Dropbox files and append results
async function searchDropboxFiles(query, startIndex = 0) {
    await refreshDropboxAccessToken(); // Ensure the access token is fresh
    let searchResults = [];
    
    if (!userFolderPath) {
        console.error('User folder path not set');
        return [];
    }

    try {
        const searchPath = userFolderPath.endsWith('/') ? userFolderPath : `${userFolderPath}/`;
        const searchBody = {
            query: query,
            options: {
                path: searchPath,
                file_status: 'active',
                filename_only: false,
                max_results: 100,
                file_extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mkv']
            }
        };

        if (!cursor) {
            // Initial search request
            const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchBody)
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
                body: JSON.stringify({ cursor: cursor })
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
        console.error('Error during search or continue search:', error);
    }

    return searchResults;
}

// Function to append search results to the DOM
async function appendResults(results) {
    const container = document.getElementById('personal-results');
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
    const searchInput = document.getElementById('personal-search-input');
    currentQuery = searchInput.value.trim();
    
    if (currentQuery && userFolderPath) {
        startIndex = 0;
        cursor = null; // Reset cursor for new search
        const results = await searchDropboxFiles(currentQuery);
        await appendResults(results);
    } else if (!userFolderPath) {
        console.error('User folder path not set. Please ensure you are logged in.');
    }
}

// Add event listener to search button
document.getElementById('personal-search-button').addEventListener('click', handleSearch);

// Add event listener for pressing Enter in the search input
document.getElementById('personal-search-input').addEventListener('keypress', function(event) {
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