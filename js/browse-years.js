import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';
const DROPBOX_GET_TEMPORARY_LINK_URL = 'https://api.dropboxapi.com/2/files/get_temporary_link';

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

async function getTemporaryLink(path) {
  await refreshDropboxAccessToken();
  const response = await fetch(DROPBOX_GET_TEMPORARY_LINK_URL, {
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
        const linkResult = await getTemporaryLink(randomImage.path_lower);
        
        if (!linkResult || !linkResult.link) {
          console.error('Failed to get temporary link:', linkResult);
          return null;
        }
        
        return linkResult.link;
      }
      
      // If we didn't find suitable images in this folder, search through subfolders
      for (const folder of folders) {
        const imageLink = await getRandomImageFromFolder(year, folder.path_lower);
        if (imageLink) {
          return imageLink;
        }
      }
      
      // If we've searched through all subfolders and found nothing, return null
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

  async function addYearLink(year) {
    const grid = document.getElementById('browse-years-grid');
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
  
      try {
        // Get a random image from any folder containing the year
        const randomImageUrl = await getRandomImageFromFolder(year);
        if (randomImageUrl) {
          link.style.backgroundImage = `url(${randomImageUrl})`;
          link.style.backgroundSize = 'cover';
          link.style.backgroundPosition = 'center';
        } else {
          console.log(`No image found for year ${year}, using default styling`);
          link.style.backgroundColor = '#cccccc'; // Example default color
        }
        link.style.color = 'white'; // Ensure text is visible on the image or default background
        link.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)'; // Add shadow for better readability
      } catch (error) {
        console.error(`Error setting background for year ${year}:`, error);
        link.style.backgroundColor = '#cccccc'; // Example default color
      }
  
      grid.appendChild(link);
    }
  }


async function main() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const yearFolders = await findYearFolders();
        for (const year of yearFolders) {
          await addYearLink(year);
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

// Export the year variable
export let year;