import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const listFolderUrl = 'https://api.dropboxapi.com/2/files/list_folder';
const listFolderContinueUrl = 'https://api.dropboxapi.com/2/files/list_folder/continue';
const getTemporaryLinkUrl = 'https://api.dropboxapi.com/2/files/get_temporary_link';


onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, fetch their folder path
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
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
        window.location.href = '/';
    }
});

const familyKeywords = ['family', 'reunion', 'birthday', 'wedding', 'anniversary', 'holiday', 'vacation', 'siblings', 'parents', 'grandparents', 'children'];

async function ensureAccessToken() {
    await refreshDropboxAccessToken();
}

async function listFolderRecursive(folderPath) {
    await ensureAccessToken();
    let allEntries = [];
    let hasMore = true;
    let cursor = null;

    while (hasMore) {
        let response;
        if (cursor === null) {
            response = await fetch(listFolderUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: folderPath,
                    recursive: true,
                    include_media_info: false,
                    include_deleted: false,
                    include_has_explicit_shared_members: false,
                    include_mounted_folders: true,
                    include_non_downloadable_files: false
                })
            });
        } else {
            response = await fetch(listFolderContinueUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cursor: cursor })
            });
        }

        const result = await response.json();
        allEntries = allEntries.concat(result.entries);
        hasMore = result.has_more;
        cursor = result.cursor;
    }

    return allEntries;
}

async function getTemporaryLink(filePath) {
    await ensureAccessToken();
    const response = await fetch(getTemporaryLinkUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: filePath })
    });
    return await response.json();
}

function isFamilyRelated(name) {
    const lowerName = name.toLowerCase();
    return familyKeywords.some(keyword => lowerName.includes(keyword));
}

async function getRandomFamilyImage() {
    const allEntries = await listFolderRecursive('');
    const familyImages = allEntries.filter(item => 
        item['.tag'] === 'file' && 
        item.name.match(/\.(jpg|jpeg|png|gif)$/i) && 
        isFamilyRelated(item.name)
    );

    if (familyImages.length > 0) {
        const randomImage = familyImages[Math.floor(Math.random() * familyImages.length)];
        const tempLink = await getTemporaryLink(randomImage.path_lower);
        return { link: tempLink.link, name: randomImage.name };
    }
    return null;
}

async function displayRandomFamilyImage() {
    const contentContainer = document.getElementById('random-picture');
    if (!contentContainer) {
        console.error('Element with ID "random-picture" not found');
        return;
    }
    contentContainer.innerHTML = 'Loading...';

    try {
        const image = await getRandomFamilyImage();
        if (image) {
            const img = document.createElement('img');
            img.src = image.link;
            img.alt = `Family image: ${image.name}`;
            contentContainer.innerHTML = '';
            contentContainer.appendChild(img);
        } else {
            contentContainer.innerHTML = 'No family-related images found.';
        }
    } catch (error) {
        console.error('Error loading random family image:', error);
        contentContainer.innerHTML = 'Error loading image';
    }
}

// Wait for Firebase authentication state to be determined
onAuthStateChanged(auth, (user) => {
    const contentContainer = document.getElementById('random-picture');
    if (!contentContainer) {
        console.error('Element with ID "random-picture" not found');
        return;
    }

    if (user) {
        // User is signed in, display random family image
        displayRandomFamilyImage();
    } else {
        // User is signed out, handle accordingly
        contentContainer.innerHTML = 'Please sign in to view family images';
    }
});

// Ensure the DOM is loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // You can put any initialization code here if needed
});








// // Add this function to create the year select element
// function createYearSelect() {
//     const select = document.createElement('select');
//     select.id = 'year-select';
//     select.style.position = 'relative';
//     select.style.zIndex = '2';
//     select.style.borderRadius = '50px';
//     select.style.padding = '10px 17px 10px 17px';
//     select.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
//     select.style.background = 'linear-gradient(to bottom, #8B4513, #663300)';
//     select.style.color = 'white';
//     select.style.fontFamily = 'Arial, sans-serif';
//     select.style.cursor = 'pointer';
//     select.style.outline = 'none';
//     select.style.appearance = 'none';
//     select.style.mozAppearance = 'none';
//     select.style.fontSize = '16px';
    
//     // Generate options for the last 10 years
//     const currentYear = new Date().getFullYear();
//     const selectOption = document.createElement('option');
//     selectOption.textContent = 'Select Year';
//     select.appendChild(selectOption);
//     for (let i = 0; i < 20; i++) {
//         const option = document.createElement('option');
//         option.value = currentYear - i;
//         option.textContent = currentYear - i;
//         select.appendChild(option);
//     }

//     const styleOptions = () => {
//         const options = select.options;
//         for (let i = 0; i < options.length; i++) {
//             options[i].style.background = '#663300';
//             options[i].style.color = 'white';
//             options[i].style.padding = '8px';
//         }
//     };
    
//     // Call styleOptions initially and whenever the select is clicked
//     styleOptions();
//     select.addEventListener('mousedown', styleOptions);
    
    
//     // Add event listener to update the section when a new year is selected
//     select.addEventListener('change', (event) => {
//         animateSectionFolders(() => createSingleYearSection(event.target.value));
//     });
    
//     // Insert the select element before the section-folders container
//     const sectionFoldersContainer = document.getElementById('section-folders');
//     sectionFoldersContainer.parentNode.insertBefore(select, sectionFoldersContainer);
// }

// function animateSectionFolders(callback) {
//     const sectionFolders = document.getElementById('section-folders');
//     sectionFolders.style.animation = 'none';
//     sectionFolders.offsetHeight; // Trigger reflow
//     sectionFolders.style.animation = 'shrinkMoveDown 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, ' +
//                                      'wait 3s 1s forwards, ' +
//                                      'expandMoveUp 1s 4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
    
//     // Execute the callback after the animation completes
//     setTimeout(callback, 5000); // 5 seconds total animation time
// }

// async function createSingleYearSection(year) {
//     await refreshDropboxAccessToken(); // Ensure the access token is fresh
//     const sectionFoldersContainer = document.getElementById('section-folders');
//     sectionFoldersContainer.innerHTML = ''; // Clear existing content

//     const section = document.createElement('div');
//     section.style.width = '100%';
//     section.style.height = '100%';
//     section.style.marginBottom = '16px';
//     section.style.overflow = 'auto';
//     section.style.cursor = 'pointer';
    
//     section.classList.add('custom-scrollbar'); // Add a class for custom scrollbar styling

//     const header = document.createElement('h2');
//     header.textContent = year;
//     header.style.padding = '10px';
//     header.style.backgroundColor = '#fffff00';
//     header.style.margin = '0';
//     header.style.position = 'sticky';
//     header.style.top = '16px';
//     header.style.zIndex = '5';
//     header.style.fontSize = '5rem';
//     header.style.textAlign = 'center';
//     header.style.color = 'white';
//     header.style.textShadow = '2px 2px 4px #000000';
//     header.style.marginTop = '-10%';

//     section.appendChild(header);
//     sectionFoldersContainer.appendChild(section);

//     // Inject the custom scrollbar styling and animations into the document head
//     const style = document.createElement('style');
//     style.innerHTML = `
//         .custom-scrollbar::-webkit-scrollbar {
//             width: 12px;
//             position: absolute;
//             z-index: 1;
//             right: 0;
//             border-right: 2px solid black;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//             background: #ffffff00;
//             border-radius: 10px;
//             position: absolute;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: #888;
//             border-radius: 10px;
//             position: absolute;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: #555;
//             position: absolute;
//         }

//         .custom-scrollbar {
//             scrollbar-width: thin;
//             scrollbar-color: #888 #ffffff00;
//             position: absolute;
//         }

//         @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//         }

//         .fade-in {
//             animation: fadeIn 0.5s ease-in-out;
//         }

//         @keyframes shrinkMoveDown {
//             0% { width: 98%; transform: translateY(0); }
//             100% { width: 50%; transform: translateY(90vh); }
//         }

//         @keyframes wait {
//             0%, 100% { width: 50%; transform: translateY(90vh); }
//         }

//         @keyframes expandMoveUp {
//             0% { width: 50%; transform: translateY(90vh); }
//             100% { width: 98%; transform: translateY(0); }
//         }

//         #section-folders {
//             transition: width 1s, transform 1s;
//             width: 98%;
//             margin: 0 auto;
//         }
//     `;
//     document.head.appendChild(style);

//     await fetchAllYearFolders(year, section);
// }

// async function fetchAllYearFolders(year, sectionElement) {
//     try {
//         const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 query: year,
//                 options: {
//                     path: "",
//                     max_results: 1000,
//                     file_status: "active",
//                     filename_only: true
//                 }
//             })
//         });

//         if (response.ok) {
//             const data = await response.json();
//             const yearFolders = data.matches
//                 .filter(match => match.metadata.metadata['.tag'] === 'folder' && match.metadata.metadata.name.includes(year))
//                 .map(match => match.metadata.metadata);

//             for (const folder of yearFolders) {
//                 await createFolderDiv(folder, sectionElement);
//             }
//         } else {
//             console.error('Error searching Dropbox folders:', response.statusText);
//         }
//     } catch (error) {
//         console.error('Error during folder search:', error);
//     }
// }

// async function createFolderDiv(folder, sectionElement) {
//     const folderDiv = document.createElement('div');
//     folderDiv.style.width = '100%';
//     folderDiv.style.height = '35vh';
//     folderDiv.style.position = 'relative';
//     folderDiv.style.overflow = 'hidden';
//     folderDiv.style.opacity = '0'; // Start with opacity 0 for fade-in effect
//     folderDiv.style.borderBottom = '3px solid black';

//     const folderHeader = document.createElement('h3');
//     folderHeader.textContent = folder.name.replace(/^\d{4}\s*/, '').trim() || folder.name;
//     folderHeader.style.position = 'absolute';
//     folderHeader.style.top = '10px';
//     folderHeader.style.left = '10px';
//     folderHeader.style.color = 'white';
//     folderHeader.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
//     folderHeader.style.zIndex = '1';

//     folderDiv.appendChild(folderHeader);

//     // Fetch a random image from the folder
//     const randomImage = await getRandomImage(folder.path_lower);
//     if (randomImage) {
//         folderDiv.style.backgroundImage = `url(${randomImage})`;
//         folderDiv.style.backgroundSize = 'cover';
//         folderDiv.style.backgroundPosition = 'center';
//     } else {
//         folderDiv.style.backgroundColor = '#f0f0f0'; // Fallback color if no image is found
//     }

//     sectionElement.appendChild(folderDiv);

//     // Trigger reflow to ensure the fade-in animation works
//     folderDiv.offsetHeight;

//     // Add the fade-in class to start the animation
//     folderDiv.classList.add('fade-in');
//     folderDiv.style.opacity = '1';
// }

// async function getRandomImage(folderPath) {
//     try {
//         const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 path: folderPath,
//                 recursive: false
//             })
//         });

//         if (response.ok) {
//             const data = await response.json();
//             const images = data.entries.filter(entry => 
//                 entry['.tag'] === 'file' && 
//                 /\.(jpe?g|png|gif)$/i.test(entry.name)
//             );

//             if (images.length > 0) {
//                 const randomImage = images[Math.floor(Math.random() * images.length)];
//                 const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({ path: randomImage.path_lower })
//                 });

//                 if (tempLinkResponse.ok) {
//                     const tempLinkData = await tempLinkResponse.json();
//                     return tempLinkData.link;
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('Error fetching random image:', error);
//     }
//     return null;
// }










// const MAX_DEPTH = 10; // Maximum folder depth to search
// const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

// function getRandomFolder(path = '') {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ path })
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             const folders = data.entries.filter(entry => entry['.tag'] === 'folder');

//             if (folders.length > 0) {
//                 const randomFolder = folders[Math.floor(Math.random() * folders.length)];
//                 resolve(randomFolder.path_lower);
//             } else {
//                 resolve(null);
//             }
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// async function findRandomImage(path = '', depth = 0) {
//     if (depth > MAX_DEPTH) return null;

//     try {
//         const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ path })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         const images = data.entries.filter(entry => 
//             entry['.tag'] === 'file' && 
//             IMAGE_EXTENSIONS.includes(entry.name.split('.').pop().toLowerCase())
//         );

//         if (images.length > 0) {
//             return images[Math.floor(Math.random() * images.length)].path_lower;
//         }

//         const randomSubfolder = await getRandomFolder(path);
//         if (randomSubfolder) {
//             return findRandomImage(randomSubfolder, depth + 1);
//         }

//         return null;
//     } catch (error) {
//         console.error('Error finding random image:', error);
//         return null;
//     }
// }

// async function getRandomPictureFromDropbox() {
//     await refreshDropboxAccessToken();
//     const today = new Date().toDateString();
//     const seed = today + accessToken.substring(0, 10); // Use date and part of access token as seed
//     Math.seedrandom(seed); // Set the seed for randomization

//     try {
//         const imagePath = await findRandomImage();
//         if (!imagePath) {
//             console.log('No image files found in Dropbox');
//             return null;
//         }

//         const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ path: imagePath })
//         });

//         if (!tempLinkResponse.ok) {
//             throw new Error(`HTTP error! status: ${tempLinkResponse.status}`);
//         }

//         const tempLinkData = await tempLinkResponse.json();
//         return tempLinkData.link;
//     } catch (error) {
//         console.error('Error fetching random picture:', error);
//         return null;
//     }
// }

// async function setRandomPictureBackground() {
//     const randomPictureDiv = document.getElementById('random-picture');
//     if (!randomPictureDiv) {
//         console.error('random-picture div not found');
//         return;
//     }

//     try {
//         const randomImageUrl = await getRandomPictureFromDropbox();
//         if (randomImageUrl) {
//             randomPictureDiv.style.backgroundImage = `url("${randomImageUrl}")`;
//             randomPictureDiv.style.backgroundSize = 'cover';
//             randomPictureDiv.style.backgroundPosition = 'center';
//             randomPictureDiv.style.backgroundRepeat = 'no-repeat';
//         } else {
//             console.error('Failed to fetch a random picture');
//         }
//     } catch (error) {
//         console.error('Error setting random picture background:', error);
//     }
// }

// async function initializePage() {
//     await setRandomPictureBackground();
// }

// // Initialize when the DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializePage);
// } else {
//     initializePage();
// }






