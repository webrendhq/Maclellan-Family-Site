import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';
const DROPBOX_GET_THUMBNAIL_URL = 'https://content.dropboxapi.com/2/files/get_thumbnail_v2';

let lastTokenRefresh = 0;
const TOKEN_REFRESH_INTERVAL = 3600000; // 1 hour in milliseconds

async function refreshTokenIfNeeded() {
  const now = Date.now();
  if (now - lastTokenRefresh > TOKEN_REFRESH_INTERVAL) {
    await refreshDropboxAccessToken();
    lastTokenRefresh = now;
  }
}

async function listFolder(path) {
  await refreshTokenIfNeeded();
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

async function getThumbnail(path) {
  await refreshTokenIfNeeded();
  const response = await fetch(DROPBOX_GET_THUMBNAIL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify({
        path,
        format: 'jpeg',
        size: 'w64h64',
        mode: 'strict'
      })
    }
  });
  return response.blob();
}

function isYearFolder(name) {
  return /^\d{4}$/.test(name);
}

function isImageFile(name) {
  return /\.(jpg|jpeg|png|gif)$/i.test(name);
}

async function findYearFolders(path = '') {
  const result = await listFolder(path);
  const yearFolders = result.entries
    .filter(entry => entry['.tag'] === 'folder' && isYearFolder(entry.name))
    .map(entry => entry.name);

  if (yearFolders.length > 0) {
    return yearFolders;
  }

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

async function getRandomImageFromFolder(year, path = '') {
  try {
    const result = await listFolder(path);
    
    if (!result || !result.entries) {
      console.error('Unexpected response from listFolder:', result);
      return null;
    }
    
    const folders = result.entries.filter(entry => entry['.tag'] === 'folder');
    const imageFiles = result.entries.filter(entry => 
      entry['.tag'] === 'file' && 
      isImageFile(entry.name) && 
      isRelevantImage(entry.name, year)
    );
    
    if (imageFiles.length > 0) {
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
      const thumbnailBlob = await getThumbnail(randomImage.path_lower);
      return URL.createObjectURL(thumbnailBlob);
    }
    
    for (const folder of folders) {
      const imageUrl = await getRandomImageFromFolder(year, folder.path_lower);
      if (imageUrl) {
        return imageUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getRandomImageFromFolder for ${path}:`, error);
    return null;
  }
}

function isRelevantImage(filename, year) {
  const lowerFilename = filename.toLowerCase();
  const keywords = [
    'family', 'occasion', 'birthday', 'wedding', 'anniversary', 'holiday', 
    'vacation', 'christmas', 'thanksgiving', 'easter', 'graduation', 
    'reunion', 'party', 'celebration', year
  ];
  return keywords.some(keyword => lowerFilename.includes(keyword));
}

async function fetchAllRandomImages(years) {
  const imageUrls = {};
  for (const year of years) {
    imageUrls[year] = await getRandomImageFromFolder(year);
  }
  return imageUrls;
}

function addYearLink(year, imageUrl) {
  const grid = document.getElementById('browse-years-grid');
  if (!grid) {
    console.error('Grid element not found');
    return;
  }

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

    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        URL.revokeObjectURL(imageUrl); // Free up memory
        link.style.backgroundImage = `url(${img.src})`;
        link.style.backgroundSize = 'cover';
        link.style.backgroundPosition = 'center';
      };
      img.onerror = () => {
        console.log(`Error loading image for year ${year}, using default styling`);
        link.style.backgroundColor = '#cccccc';
      };
    } else {
      link.style.backgroundColor = '#cccccc';
    }
    
    link.style.color = 'white';
    link.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';

    grid.appendChild(link);
  }
}

async function main() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const yearFolders = await findYearFolders();
        const imageUrls = await fetchAllRandomImages(yearFolders);
        for (const year of yearFolders) {
          addYearLink(year, imageUrls[year]);
        }
      } catch (error) {
        console.error('Error fetching year folders:', error);
      }
    } else {
      console.log('User not signed in');
    }
  });
}

main();

export let year;