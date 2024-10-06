// Import necessary functions and tokens
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_REPO_OWNER = 'kevinveragit';
const GITHUB_REPO_NAME = 'Maclellan-Frontend';
const GITHUB_IMAGE_FOLDER = 'images';
const GITHUB_RAW_CONTENT_URL = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/${GITHUB_IMAGE_FOLDER}`;

// Base64 encoded GitHub token
const ENCODED_GITHUB_TOKEN = 'Z2l0aHViX3BhdF8xMUJHSkJPTUkwb3oySEtZbDZPNEtiX3BDVkwxWDdpMkFkTlZvYjU4VDFkNnNRc2NZblprcWdsN3pKWnJRRFdJV3hGUEVKR0tDM2JGZ1dFWHZS';

// Function to decode and get the GitHub token
function getGitHubToken() {
    return atob(ENCODED_GITHUB_TOKEN);
}

async function getGitHubImageUrl(imageName) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_IMAGE_FOLDER}/${imageName}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${getGitHubToken()}`
            }
        });

        if (response.status === 200) {
            return `${GITHUB_RAW_CONTENT_URL}/${imageName}`;
        }
        return null;
    } catch (error) {
        console.error('Error checking GitHub for image:', error);
        return null;
    }
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    }
    // If a user is signed in, do nothing and allow access to the current page.
});

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
  
// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\\[]/, '\\[').replace(/[\\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');

async function getFullSizeImageBlob(path) {
    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path
                })
            }
        });

        if (!response.ok) {
            throw new Error(`Dropbox API error: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error fetching full-size image from Dropbox:', error);
        return null;
    }
}

async function checkImageExistsInGitHub(imageName) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_IMAGE_FOLDER}/${imageName}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${getGitHubToken()}`
            }
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error checking GitHub for image:', error);
        return false;
    }
}

async function getDropboxTemporaryLink(path) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });

        if (!response.ok) {
            throw new Error(`Dropbox API error: ${response.status}`);
        }

        const data = await response.json();
        return data.link;
    } catch (error) {
        console.error('Error fetching Dropbox image URL:', error);
        return null;
    }
}

async function getImageUrl(dropboxPaths) {
    // Ensure dropboxPaths is an array
    if (!Array.isArray(dropboxPaths)) {
        console.error("dropboxPaths is not an array.");
        return;
    }

    const imageUrls = await Promise.all(dropboxPaths.map(async (dropboxPath) => {
        const imageName = dropboxPath.split('/').pop();

        // Step 1: Check if the image already exists in GitHub
        if (await checkImageExistsInGitHub(imageName)) {
            console.log(`Image found in GitHub: ${imageName}`);
            return `../images/${imageName}`;
        }

        // Step 2: Fetch the high-quality image from Dropbox
        console.log(`Image not found in GitHub, fetching from Dropbox: ${imageName}`);
        const dropboxUrl = await getDropboxTemporaryLink(dropboxPath);
        
        if (!dropboxUrl) {
            console.error('Failed to get Dropbox temporary link.');
            return null;
        }

        // Step 3: Download the image and commit to GitHub
        const imageResponse = await fetch(dropboxUrl);
        const imageBlob = await imageResponse.blob();
        await commitImageToGitHub(imageName, imageBlob);

        return `../images/${imageName}`;  // Return the relative GitHub image URL
    }));

    return imageUrls;
}

async function commitImageToGitHub(imageName, imageBlob) {
    try {
        const base64 = await blobToBase64(imageBlob);

        // Correct API endpoint for committing files to the 'images' folder
        const apiUrl = `${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_IMAGE_FOLDER}/${imageName}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${getGitHubToken()}`
            },
            body: JSON.stringify({
                message: `Upload image: ${imageName}`,
                content: base64.split(',')[1],  // Use base64 encoded image without the prefix
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status}. Message: ${errorData.message}`);
        }

        console.log(`Uploaded image to GitHub: ${imageName}`);
    } catch (error) {
        console.error('Error uploading image to GitHub:', error);
    }
}

// Modified getThumbnailBlob to always use 'w64h64' and implement caching
async function getThumbnailBlob(path) {
    const size = 'w128h128';
    const cacheKey = `${path}_${size}`;
    const cache = await caches.open('thumbnails-cache');

    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return await cachedResponse.blob();
    }

    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: path,
                    format: 'jpeg',
                    size: size
                })
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: false,
                include_mounted_folders: false,
                limit: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Dropbox API error: ${response.status}`);
        }

        const data = await response.json();

        const imageFiles = data.entries.filter(entry =>
            entry['.tag'] === 'file' &&
            (
                (entry.media_info && entry.media_info['.tag'] === 'photo') ||
                /\.(jpg|jpeg|png|gif|heic)$/i.test(entry.name)
            )
        );

        if (imageFiles.length === 0) return null;

        imageFiles.sort((a, b) => {
            const dateA = new Date(a.client_modified || a.server_modified);
            const dateB = new Date(b.client_modified || b.server_modified);
            return dateB - dateA;
        });

        const mostRecentImage = imageFiles[0];
        const imageUrl = await getImageUrl([mostRecentImage.path_lower]);

        return {
            thumbnail: imageUrl,
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
                            const folderLink = document.createElement('a');
                            folderLink.className = 'folder-item';
                            const encodedPath = encodeURIComponent(item.path_lower);
                            folderLink.href = `family-pictures.html?year=${encodeURIComponent(year)}&path=${encodedPath}`;
        
                            const img = document.createElement('img');
                            img.alt = item.name;
                            img.loading = 'lazy';
                            img.style.width = '100%';
                            img.style.height = 'auto';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '4px';
                            img.src = imageData.thumbnail;
        
                            folderLink.appendChild(img);
        
                            const caption = document.createElement('p');
                            caption.textContent = item.name;
                            folderLink.appendChild(caption);
        
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

// Example of initializing dropboxPaths and calling the getImageUrl function
const dropboxPaths = ['/path/to/file1.jpg', '/path/to/file2.jpg']; // Initialize with the correct paths
getImageUrl(dropboxPaths).then((urls) => {
    console.log('Processed image URLs:', urls);
});

listExactYearFolders();
