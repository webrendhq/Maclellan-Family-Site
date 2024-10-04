import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged, app } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';

async function listFolder(path) {
    await refreshDropboxAccessToken();
    const response = await fetch(DROPBOX_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
    });
    return response.json();
}

function isYearFolder(name) {
    return /^\d{4}$/.test(name);
}

async function findYearFolders(path = '') {
    const result = await listFolder(path);
    const yearFolders = result.entries
        .filter(entry => entry['.tag'] === 'folder' && isYearFolder(entry.name))
        .map(entry => entry.name);

    if (yearFolders.length > 0) {
        return yearFolders;
    }

    // If no year folders found, search in subfolders
    const subfolders = result.entries
        .filter(entry => entry['.tag'] === 'folder' && !isYearFolder(entry.name));

    for (const folder of subfolders) {
        const subYearFolders = await findYearFolders(folder.path_lower);
        if (subYearFolders.length > 0) {
            return subYearFolders;
        }
    }

    return [];
}

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
                    
                    // Find year folders under folderPath for 'your-years'
                    const yourYearFolders = await findYearFolders(folderPath);
                    yourYearFolders.forEach(year => {
                        addYearLink(year, 'your-years');
                    });
                    
                    // Also find year folders under root for 'family-years'
                    const familyYearFolders = await findYearFolders('');
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
