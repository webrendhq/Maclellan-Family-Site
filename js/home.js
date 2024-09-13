// Import the functions you need from the SDKs you need
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
  

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, continue to show the restricted page.
    } else {
      // No user is signed in, redirect to login page.
    //   window.location.href = 'https://webrendhq.github.io/Maclellan-Frontend/';
    }
});

// Add this function to create the year select element
function createYearSelect() {
    const select = document.createElement('select');
    select.id = 'year-select';
    select.style.position = 'relative';
    select.style.zIndex = '2';
    
    // Generate options for the last 10 years
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
        const option = document.createElement('option');
        option.value = currentYear - i;
        option.textContent = currentYear - i;
        select.appendChild(option);
    }
    
    // Add event listener to update the section when a new year is selected
    select.addEventListener('change', (event) => {
        createSingleYearSection(event.target.value);
    });
    
    // Insert the select element before the section-folders container
    const sectionFoldersContainer = document.getElementById('section-folders');
    sectionFoldersContainer.parentNode.insertBefore(select, sectionFoldersContainer);
}

async function createSingleYearSection(year) {
    await refreshDropboxAccessToken(); // Ensure the access token is fresh
    const sectionFoldersContainer = document.getElementById('section-folders');
    sectionFoldersContainer.innerHTML = ''; // Clear existing content

    const section = document.createElement('div');
    section.style.width = '100%';
    section.style.height = '100%';
    section.style.overflow = 'auto';
    section.classList.add('custom-scrollbar'); // Add a class for custom scrollbar styling

    const header = document.createElement('h2');
    header.textContent = year;
    header.style.padding = '10px';
    header.style.backgroundColor = '#f0f0f0';
    header.style.margin = '0';

    section.appendChild(header);
    sectionFoldersContainer.appendChild(section);

    // Inject the custom scrollbar styling into the document head
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 12px;
            position: absolute;
            z-index: 1;
            right: 0;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
        }

        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
        }
    `;
    document.head.appendChild(style);

    await fetchAllYearFolders(year, section);
}


async function fetchAllYearFolders(year, sectionElement) {
    try {
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
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const yearFolders = data.matches
                .filter(match => match.metadata.metadata['.tag'] === 'folder' && match.metadata.metadata.name.includes(year))
                .map(match => match.metadata.metadata);

            for (const folder of yearFolders) {
                await createFolderDiv(folder, sectionElement);
            }
        } else {
            console.error('Error searching Dropbox folders:', response.statusText);
        }
    } catch (error) {
        console.error('Error during folder search:', error);
    }
}

async function createFolderDiv(folder, sectionElement) {
    const folderDiv = document.createElement('div');
    folderDiv.style.width = '100%';
    folderDiv.style.height = '35vh';
    
    folderDiv.style.position = 'relative';
    folderDiv.style.overflow = 'hidden';

    const folderHeader = document.createElement('h3');
    folderHeader.textContent = folder.name.replace(/^\d{4}\s*/, '').trim() || folder.name;
    folderHeader.style.position = 'absolute';
    folderHeader.style.top = '10px';
    folderHeader.style.left = '10px';
    folderHeader.style.color = 'white';
    folderHeader.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
    folderHeader.style.zIndex = '1';

    folderDiv.appendChild(folderHeader);

    // Fetch a random image from the folder
    const randomImage = await getRandomImage(folder.path_lower);
    if (randomImage) {
        folderDiv.style.backgroundImage = `url(${randomImage})`;
        folderDiv.style.backgroundSize = 'cover';
        folderDiv.style.backgroundPosition = 'center';
    } else {
        folderDiv.style.backgroundColor = '#f0f0f0'; // Fallback color if no image is found
    }

    sectionElement.appendChild(folderDiv);
}

async function getRandomImage(folderPath) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: folderPath,
                recursive: false
            })
        });

        if (response.ok) {
            const data = await response.json();
            const images = data.entries.filter(entry => 
                entry['.tag'] === 'file' && 
                /\.(jpe?g|png|gif)$/i.test(entry.name)
            );

            if (images.length > 0) {
                const randomImage = images[Math.floor(Math.random() * images.length)];
                const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ path: randomImage.path_lower })
                });

                if (tempLinkResponse.ok) {
                    const tempLinkData = await tempLinkResponse.json();
                    return tempLinkData.link;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching random image:', error);
    }
    return null;
}

// async function fetchSubfolders(path) {
//     try {
//         const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 path: path,
//                 recursive: false
//             })
//         });

//         if (response.ok) {
//             const data = await response.json();
//             return data.entries
//                 .filter(entry => entry['.tag'] === 'folder')
//                 .map(folder => folder.name);
//         } else {
//             console.error('Error listing subfolders:', response.statusText);
//             return [];
//         }
//     } catch (error) {
//         console.error('Error fetching subfolders:', error);
//         return [];
//     }
// }

// function handleYearChange(event) {
//     const selectedYear = event.target.value;
//     createSingleYearSection(selectedYear);
// }

function initializePage() {
    createYearSelect();
}

initializePage();







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

