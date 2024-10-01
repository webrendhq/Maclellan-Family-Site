import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

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

function addYearLink(year) {
    const grid = document.getElementById('your-years');
    if (!grid) {
        console.error('Grid element not found');
        return;
    }


    // Check if a link for this year already exists
    if (!document.getElementById(year)) {
        const link = document.createElement('a');
        link.id = year;
        link.textContent = year;
        link.href = `/family-events.html?year=${year}`;
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
                const yearFolders = await findYearFolders();
                yearFolders.forEach(addYearLink);
            } catch (error) {
                console.error('Error fetching year folders:', error);
            }
        } else {
            console.log('User not signed in');
        }
    });
}

main();

// Export the year variable
export let year;