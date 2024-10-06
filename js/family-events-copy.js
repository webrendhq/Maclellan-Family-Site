
// Import necessary functions and tokens
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    }
    // If a user is signed in, do nothing and allow access to the current page.
});

  
// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\\[]/, '\\[').replace(/[\\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');

// Modified getThumbnailBlob to always use 'w64h64' and implement caching
async function getThumbnailBlob(path) {
    const size = 'w128h128'; // Enforce 64x64 resolution
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
                    size: size // Always use 'w64h64'
                })
            }
        });

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

// Main function to list folders and display images
async function listExactYearFolders() {
    if (!year) {
        console.error('No year specified in URL parameters. Use ?year=YYYY in the URL.');
        return;
    }

    try {
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

        const exactMatches = data.matches.filter(match =>
            match.metadata.metadata['.tag'] === 'folder' &&
            match.metadata.metadata.name === year
        );

        const eventBentoGrid = document.getElementById('event-bento-grid');
        if (!eventBentoGrid) {
            console.error('Element with id "event-bento-grid" not found');
            return;
        }

        if (exactMatches.length > 0) {
            for (const match of exactMatches) {
                const folderPath = match.metadata.metadata.path_lower;
                const folderContentsResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
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
                });

                if (!folderContentsResponse.ok) {
                    throw new Error(`HTTP error! status: ${folderContentsResponse.status}`);
                }

                const folderContents = await folderContentsResponse.json();

                for (const item of folderContents.entries) {
                    if (item['.tag'] === 'folder') {
                        const imageData = await getMostRecentImageFromFolder(item.path_lower);
                        if (imageData && imageData.thumbnail) {
                            // Create an 'a' element
                            const folderLink = document.createElement('a');
                            folderLink.className = 'folder-item';

                            // Set the href attribute to include year and path
                            const encodedPath = encodeURIComponent(item.path_lower);
                            const href = `family-pictures.html?year=${encodeURIComponent(year)}&path=${encodedPath}`;
                            folderLink.href = href;

                            // Create an img element
                            const img = document.createElement('img');
                            img.alt = item.name;
                            img.loading = 'lazy'; // Implement lazy loading

                            // Set the styles to enforce 64x64 resolution
                            img.style.width = '100%';
                            img.style.height = 'auto';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '4px';

                            // Set the src attribute
                            img.src = imageData.thumbnail;

                            // Append the image to the folder link
                            folderLink.appendChild(img);

                            // Optionally, add a caption
                            const caption = document.createElement('p');
                            caption.textContent = item.name;
                            folderLink.appendChild(caption);

                            // Append the folder link to the grid
                            eventBentoGrid.appendChild(folderLink);
                        } else {
                            console.log(`Folder skipped (no images): ${item.path_display}`);
                        }
                    }
                }
            }

            // Initialize Isotope after all folder items are added
            const iso = new Isotope(eventBentoGrid, {
                itemSelector: '.folder-item',
                layoutMode: 'masonry',
                percentPosition: true,
                masonry: {
                    columnWidth: '.folder-item',  // Use folder-item width as the column size
                    horizontalOrder: true         // Stack items vertically, filling one column before the next
                }
            });

            // Ensure layout updates once all images are loaded
            imagesLoaded(eventBentoGrid, function () {
                iso.layout();
            });

            // Ensure layout updates once all images are loaded
            imagesLoaded(eventBentoGrid, function () {
                iso.layout();
            });

        } else {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No folders named exactly '${year}' were found.`;
            eventBentoGrid.appendChild(noResultsDiv);
        }

        console.log(`Finished listing folders for ${year}.`);

    } catch (error) {
        console.error('Error searching Dropbox folders:', error);
        console.error('Error details:', error.message);

        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        const eventBentoGrid = document.getElementById('event-bento-grid');
        if (eventBentoGrid) {
            eventBentoGrid.appendChild(errorDiv);
        }
    }
}


listExactYearFolders();
