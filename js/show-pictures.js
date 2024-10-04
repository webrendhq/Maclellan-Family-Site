// Import necessary functions and tokens
import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';

import { auth, onAuthStateChanged, db } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

let isAdmin = false;

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
    `;
    
    deleteButton.onclick = (e) => {
        e.stopPropagation(); // Prevent opening the image modal
        showDeleteConfirmationModal(file);
    };
    
    return deleteButton;
}

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

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const year = getUrlParameter('year');
const path = getUrlParameter('path');

// Modified getThumbnailBlob function to always use 'w64h64'
async function getThumbnailBlob(filePath) {
    const size = 'w64h64'; // Fixed size
    const cacheKey = `${filePath}_${size}`;
    const cache = await caches.open('thumbnails-cache');

    // Check if the image is already in the cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return await cachedResponse.blob();
    }

    // If not in cache, fetch the image
    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail_v2', {
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
                        ".tag": size // Use the fixed size
                    },
                    mode: {
                        ".tag": "strict"
                    }
                }),
                'Content-Type': 'text/plain; charset=utf-8' // Set to accepted value
            },
            body: null // Empty body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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

// Modified getThumbnails function to only fetch 'w64h64' size
async function getThumbnails(filePath) {
    const size = 'w64h64'; // Only one size
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

// Get modal elements and set up event listeners
const modal = document.getElementById('file-modal');
const modalContent = document.getElementById('file-modal-content');
const modalBody = document.getElementById('file-modal-body');
const modalClose = document.getElementById('file-modal-close');
const downloadLink = document.getElementById('download-link');

// Event listener for closing the modal when the close button is clicked
modalClose.onclick = function() {
    modal.style.display = 'none';
    modalBody.innerHTML = ''; // Clear content when modal is closed
};

// Event listener for closing the modal when clicking outside the content
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        modalBody.innerHTML = ''; // Clear content when modal is closed
    }
};

// Function to open the modal and display the content
function openModal(tempLink, fileName) {
    // Clear previous content
    modalBody.innerHTML = '';

    // Determine if the file is an image or video
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'];

    if (imageExtensions.includes(extension)) {
        // Create an image element
        const img = document.createElement('img');
        img.src = tempLink;
        img.alt = fileName;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80vh'; // Limit height to viewport
        img.style.objectFit = 'contain';
        modalBody.appendChild(img);
    } else if (videoExtensions.includes(extension)) {
        // Create a video element
        const video = document.createElement('video');
        video.src = tempLink;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '80vh';
        video.style.objectFit = 'contain';
        modalBody.appendChild(video);
    } else {
        // Unsupported file type
        modalBody.textContent = 'Unsupported file type.';
    }

    // Set the download link
    downloadLink.href = tempLink;
    downloadLink.download = fileName;

    // Show the modal
    modal.style.display = 'block';
}

// Main function to list images and videos in a folder
// Main function to list images and videos in a folder
// Main function to list images and videos in a folder
async function listImagesAndVideosInFolder() {
    if (!year || !path) {
        console.error('No year or path specified in URL parameters. Use ?year=YYYY&path=PATH in the URL.');
        return;
    }

    try {
        await refreshDropboxAccessToken();
        console.log(`Listing images and videos in folder '${path}' for year '${year}'...`);

        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: path,
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

        const mediaFiles = data.entries.filter(entry => {
            if (entry['.tag'] === 'file') {
                const extension = entry.name.split('.').pop().toLowerCase();
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'];
                return imageExtensions.includes(extension) || videoExtensions.includes(extension);
            }
            return false;
        });

        const eventBentoGrid = document.getElementById('event-n-year-bento-grid');
        if (!eventBentoGrid) {
            console.error('Element with id "event-n-year-bento-grid" not found');
            return;
        }

        // Clear existing content
        eventBentoGrid.innerHTML = '';

        // Set to keep track of added files
        const addedFiles = new Set();

        if (mediaFiles.length > 0) {
            for (const file of mediaFiles) {
                // Check if the file has already been added
                if (addedFiles.has(file.path_lower)) {
                    console.log(`Skipping duplicate file: ${file.path_lower}`);
                    continue;
                }

                // Get thumbnails of 'w64h64' size
                const thumbnails = await getThumbnails(file.path_lower);

                if (thumbnails && Object.keys(thumbnails).length > 0) {
                    // Create an 'a' element
                    const fileLink = document.createElement('a');
                    fileLink.className = 'file-item';
                    fileLink.href = '#'; // Prevent default navigation
                    fileLink.style.position = 'relative'; // For positioning the delete button
                    fileLink.dataset.path = file.path_lower; // Add data attribute for easy selection

                    // Event listener for opening the modal
                    fileLink.addEventListener('click', async function(event) {
                        event.preventDefault();

                        // Get a temporary link to the file
                        let tempLink = '#'; // Default tempLink in case temporary link cannot be obtained

                        try {
                            const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    path: file.path_lower
                                })
                            });

                            if (tempLinkResponse.ok) {
                                const tempLinkData = await tempLinkResponse.json();
                                tempLink = tempLinkData.link;
                            } else {
                                const errorText = await tempLinkResponse.text();
                                console.error(`Error getting temporary link: ${errorText}`);
                            }
                        } catch (error) {
                            console.error('Error getting temporary link:', error);
                        }

                        // Open the modal and display the content
                        openModal(tempLink, file.name);
                    });

                    // Create an img element with fixed size
                    const img = document.createElement('img');
                    img.alt = file.name;
                    img.loading = 'lazy'; // Implement lazy loading

                    // Set the styles to enforce 64x64 resolution
                    img.style.width = '100%';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';

                    // Set the src to the 'w64h64' thumbnail
                    img.src = thumbnails['w64h64'];

                    // Append the image to the file link
                    fileLink.appendChild(img);

                    // Add delete button for admin users
                    if (isAdmin) {
                        const deleteButton = createDeleteButton(file);
                        fileLink.appendChild(deleteButton);
                    }

                    // Optionally, add a caption
                    const caption = document.createElement('p');
                    caption.textContent = file.name;
                    fileLink.appendChild(caption);

                    // Append the file link to the grid
                    eventBentoGrid.appendChild(fileLink);

                    // Mark this file as added
                    addedFiles.add(file.path_lower);
                } else {
                    console.log(`File skipped (no thumbnail): ${file.path_display}`);
                }
            }
        } else {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.textContent = `No images or videos found in the folder '${path}'.`;
            eventBentoGrid.appendChild(noResultsDiv);
        }

        console.log(`Finished listing images and videos for folder '${path}'.`);

    } catch (error) {
        console.error('Error listing images and videos:', error);
        console.error('Error details:', error.message);

        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        document.getElementById('event-n-year-bento-grid').appendChild(errorDiv);
    }
}

listImagesAndVideosInFolder();
