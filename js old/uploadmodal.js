import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';

const uploadBtn = document.getElementById('uploadBtn');
const modal = document.getElementById('uploadModal');
const closeBtn = document.getElementsByClassName('close')[0];
const dropArea = document.getElementById('drop-area');
const gallery = document.getElementById('gallery');
const folderSelects = document.getElementById('folderSelects');
const uploadToDropboxBtn = document.getElementById('uploadToDropbox');
const fileElem = document.getElementById('fileElem');
const createFolderBtn = document.getElementById('createFolderBtn'); // New button

let files = [];

uploadBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = closeModal;
window.onclick = (event) => {
    if (event.target == modal) closeModal();
};

function closeModal() {
    modal.style.display = 'none';
    resetUIState();
}

function resetUIState() {
    files = [];
    updateGallery();
    updateFolderSelects();
    fileElem.value = '';
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);
fileElem.addEventListener('change', handleFiles, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const newFiles = [...dt.files];
    handleFiles(newFiles);
}

function handleFiles(newFiles) {
    files = newFiles instanceof FileList ? [...newFiles] : newFiles;
    updateGallery();
    updateFolderSelects();
}

function updateGallery() {
    gallery.innerHTML = '';
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            gallery.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => URL.revokeObjectURL(video.src);
            gallery.appendChild(video);
        }
    });
}

async function updateFolderSelects() {
    folderSelects.innerHTML = '';
    await createFolderSelect('', 0);
    uploadToDropboxBtn.style.display = files.length > 0 ? 'inline-block' : 'none';
}

async function createFolderSelect(path, level) {
    const select = document.createElement('select');
    let options;
    try {
        options = await listFolders(path);
    } catch (error) {
        console.error('Error listing folders:', error);
        alert('Failed to load folders. Please try again.');
        return;
    }

    options.unshift({ path_lower: path, name: '(This folder)' });
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.path_lower;
        optElement.textContent = option.name;
        select.appendChild(optElement);
    });

    select.addEventListener('change', async (e) => {
        const selectedPath = e.target.value;
        while (folderSelects.children[level + 1]) {
            folderSelects.removeChild(folderSelects.children[level + 1]);
        }
        if (selectedPath !== path) {
            await createFolderSelect(selectedPath, level + 1);
        }
    });

    folderSelects.appendChild(select);
}

async function listFolders(path) {
    try {
        await refreshDropboxAccessToken();
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: path === '' ? '' : path,
                recursive: false,
                include_mounted_folders: true,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.entries.filter(entry => entry['.tag'] === 'folder');
    } catch (error) {
        console.error('Error in listFolders:', error);
        throw error;
    }
}

uploadToDropboxBtn.addEventListener('click', async () => {
    try {
        await refreshDropboxAccessToken();
        const path = getSelectedPath();
        for (const file of files) {
            await uploadFileToDropbox(file, path);
        }
        alert('Upload complete!');
        closeModal();
    } catch (error) {
        console.error('Upload failed:', error);
        if (error.status === 409) {
            alert('Upload failed due to a naming conflict. Please try again with a different file name.');
        } else {
            alert('Upload failed. Please try again.');
        }
    }
});

function getSelectedPath() {
    const lastSelect = folderSelects.lastElementChild;
    return lastSelect ? lastSelect.value : '';
}

async function uploadFileToDropbox(file, path) {
    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: `${path}/${file.name}`,
                    mode: 'add',
                    autorename: true,
                    mute: false,
                    strict_conflict: false
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw { status: response.status, message: errorData.error_summary };
        }

        return await response.json();
    } catch (error) {
        console.error('Error in uploadFileToDropbox:', error);
        throw error;
    }
}

// New function to handle creating a folder
async function handleCreateFolder() {
    const folderName = prompt('Enter new folder name:');
    if (!folderName) {
        return; // User cancelled or didn't enter a name
    }

    const selectedPath = getSelectedPath();
    const newFolderPath = selectedPath === '' ? `/${folderName}` : `${selectedPath}/${folderName}`;

    try {
        await refreshDropboxAccessToken();
        await createFolderInDropbox(newFolderPath);
        alert('Folder created successfully!');
        // Refresh the folder selects to include the new folder
        await updateFolderSelects();
    } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder. Please try again.');
    }
}

// New function to create a folder in Dropbox
async function createFolderInDropbox(path) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: path,
                autorename: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw { status: response.status, message: errorData.error_summary };
        }

        return await response.json();
    } catch (error) {
        console.error('Error in createFolderInDropbox:', error);
        throw error;
    }
}

createFolderBtn.addEventListener('click', handleCreateFolder); // Event listener for the new button

// Initial call to set up the first folder select
updateFolderSelects();
