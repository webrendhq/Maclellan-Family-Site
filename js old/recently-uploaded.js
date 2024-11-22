import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';

let isTokenRefreshed = false;

async function ensureTokenRefreshed() {
    if (!isTokenRefreshed) {
        console.log("Refreshing access token");
        await refreshDropboxAccessToken();
        isTokenRefreshed = true;
        console.log("Access token refreshed");
    }
}

async function listRecentMedia(path = '', days = 30) {
    console.log(`Starting listRecentMedia with path: ${path}, for the last ${days} days`);
    await ensureTokenRefreshed();
    const listFolderUrl = 'https://api.dropboxapi.com/2/files/list_folder';
    
    try {
        const response = await fetch(listFolderUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: path,
                recursive: true,
                include_media_info: true,
                include_deleted: false,
                limit: 2000  // Increased limit to get more files
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to list folder contents: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Folder contents received");
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

        const recentMediaFiles = data.entries.filter(entry => 
            entry['.tag'] === 'file' &&
            entry.name.match(/\.(jpg|jpeg|png|gif|mp4|mov)$/i) &&
            new Date(entry.server_modified) > thirtyDaysAgo
        );

        console.log(`Found ${recentMediaFiles.length} recent media files`);
        
        // Sort by most recent first
        recentMediaFiles.sort((a, b) => new Date(b.server_modified) - new Date(a.server_modified));

        // Limit to 25 most recent files
        return recentMediaFiles.slice(0, 25);
    } catch (error) {
        console.error("Error in listRecentMedia:", error);
        throw error;
    }
}

async function getThumbnail(path) {
    console.log("Getting thumbnail for path:", path);
    const thumbnailUrl = 'https://content.dropboxapi.com/2/files/get_thumbnail_v2';
    const thumbnailBody = {
        resource: {
            ".tag": "path",
            "path": path
        },
        format: {
            ".tag": "jpeg"
        },
        size: {
            ".tag": "w256h256"
        },
        mode: {
            ".tag": "strict"
        }
    };

    try {
        const response = await fetch(thumbnailUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify(thumbnailBody)
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get thumbnail: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error in getThumbnail:", error);
        throw error;
    }
}

async function displayMedia(mediaFiles) {
    console.log("Starting displayMedia with files:", mediaFiles.length);
    const container = document.getElementById('recently-uploaded');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    container.innerHTML = ''; // Clear existing content

    if (mediaFiles.length === 0) {
        console.log("No media files to display");
        container.textContent = 'No recent media files found.';
        return;
    }

    for (const file of mediaFiles) {
        try {
            console.log("Processing file:", file.name);
            const thumbnailUrl = await getThumbnail(file.path_lower);
            const div = document.createElement('div');
            div.className = 'media-item';
            
            div.style.backgroundImage = `url(${thumbnailUrl})`;
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';
            div.style.width = '200px';
            div.style.height = '200px';
            div.style.margin = '10px';
            div.style.display = 'inline-block';
            div.style.position = 'relative';
            
            if (file.name.match(/\.(mp4|mov)$/i)) {
                const videoIndicator = document.createElement('div');
                videoIndicator.textContent = '▶';
                videoIndicator.style.position = 'absolute';
                videoIndicator.style.top = '5px';
                videoIndicator.style.right = '5px';
                videoIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                videoIndicator.style.color = 'white';
                videoIndicator.style.padding = '2px 5px';
                videoIndicator.style.borderRadius = '3px';
                div.appendChild(videoIndicator);
            }
            
            // Add upload date
            const dateDiv = document.createElement('div');
            dateDiv.textContent = new Date(file.server_modified).toLocaleDateString();
            dateDiv.style.position = 'absolute';
            dateDiv.style.bottom = '5px';
            dateDiv.style.left = '5px';
            dateDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            dateDiv.style.color = 'white';
            dateDiv.style.padding = '2px 5px';
            dateDiv.style.borderRadius = '3px';
            dateDiv.style.fontSize = '12px';
            div.appendChild(dateDiv);
            
            container.appendChild(div);
            console.log("Appended media item for:", file.name);
        } catch (error) {
            console.error('Error displaying media:', file.name, error);
        }
    }
}

async function main() {
    try {
        console.log("Starting main function");
        await ensureTokenRefreshed();
        const mediaFiles = await listRecentMedia('');  // You can specify a folder path here if needed
        console.log("Recent media files retrieved:", mediaFiles.length);
        await displayMedia(mediaFiles);
        console.log("Display media completed");
    } catch (error) {
        console.error('Error in main function:', error);
        const container = document.getElementById('recently-uploaded');
        if (container) {
            container.textContent = 'An error occurred while fetching media. Please check the console for details.';
        }
    }
}

// Call the main function to start the process
console.log("Script loaded, calling main function");
main();