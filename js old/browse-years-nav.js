import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged, app } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';

// Function to list all entries in a Dropbox folder
async function listFolderAll(path) {
    await refreshDropboxAccessToken();
    let entries = [];
    let has_more = false;
    let cursor = null;

    do {
        const url = has_more ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : DROPBOX_API_URL;
        const body = has_more ? { cursor } : { path, recursive: true };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();

        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }

        entries = entries.concat(result.entries);
        has_more = result.has_more;
        cursor = result.cursor;
    } while (has_more);

    return entries;
}

// Function to check if a folder name is a year (e.g., '2021')
function isYearFolder(name) {
    return /^\d{4}$/.test(name);
}

// Function to find year folders in a given path
async function findYearFolders(path = '') {
    const entries = await listFolderAll(path);

    // Collect unique year folder names
    const yearFolders = Array.from(new Set(entries
        .filter(entry => entry['.tag'] === 'folder' && isYearFolder(entry.name))
        .map(entry => entry.name)));

    return yearFolders;
}

// Function to add a year link to the specified grid
function addYearLink(year, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.error(`Grid element not found: ${gridId}`);
        return;
    }

    // Check if a link for this year already exists
    if (!document.getElementById(`${gridId}-${year}`)) {
        const link = document.createElement('a');
        link.id = `${gridId}-${year}`;
        link.textContent = year;
        
        // Set different href based on the grid
        if (gridId === 'family-years') {
            link.href = `/family-events.html?year=${year}`;
        } else if (gridId === 'your-years') {
            link.href = `/your-events.html?year=${year}`;
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.year = year;
            window.location.href = link.href;
        });
        grid.appendChild(link);
    }
}

// Function to get year folders with caching
async function getYearFolders(path, cacheKey) {
    // Check localStorage for cached data
    let cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        let parsedData = JSON.parse(cachedData);
        let now = new Date().getTime();
        // Set cache expiry time (e.g., 24 hours)
        let expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (now - parsedData.timestamp < expiryTime) {
            // Use cached data
            return parsedData.data;
        } else {
            // Remove expired data
            localStorage.removeItem(cacheKey);
        }
    }

    // Fetch data from Dropbox and cache it
    try {
        const yearFolders = await findYearFolders(path);
        let dataToCache = {
            timestamp: new Date().getTime(),
            data: yearFolders
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        return yearFolders;
    } catch (error) {
        console.error('Error fetching year folders:', error);
        return [];
    }
}

// Main function to initialize the app
async function main() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const db = getFirestore(app); // Initialize Firestore with app
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const folderPath = userData.folderPath || '';
                    
                    // Get cached or fresh year folders for 'your-years'
                    const yourYearFolders = await getYearFolders(folderPath, `yearFolders-${user.uid}`);
                    yourYearFolders.sort((a, b) => b - a); // Sort years in descending order
                    yourYearFolders.forEach(year => {
                        addYearLink(year, 'your-years');
                    });
                    
                    // Get cached or fresh year folders for 'family-years'
                    const familyYearFolders = await getYearFolders('', 'yearFolders-family');
                    familyYearFolders.sort((a, b) => b - a); // Sort years in descending order
                    familyYearFolders.forEach(year => {
                        addYearLink(year, 'family-years');
                    });
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            console.log('User not signed in');
        }
    });
}

main();

// Export the year variable
export let year;
