import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';
const DROPBOX_GET_TEMPORARY_LINK_URL = 'https://api.dropboxapi.com/2/files/get_temporary_link';
const EVENTS_PER_PAGE = 5;

let allEvents = [];
let currentIndex = 0;

async function listFolder(path) {
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

function isImageFile(name) {
    return /\.(jpg|jpeg|png|gif)$/i.test(name);
}

async function findYearFolder(year, path = '') {
  const result = await listFolder(path);
  for (const entry of result.entries) {
    if (entry['.tag'] === 'folder') {
      if (entry.name === year) {
        return entry.path_lower;
      }
      if (!isYearFolder(entry.name)) {
        const nestedResult = await findYearFolder(year, entry.path_lower);
        if (nestedResult) {
          return nestedResult;
        }
      }
    }
  }
  return null;
}

async function findEventFolders(yearPath) {
  const result = await listFolder(yearPath);
  return result.entries
    .filter(entry => entry['.tag'] === 'folder')
    .map(entry => ({
      name: entry.name,
      path: entry.path_lower,
      year: yearPath.split('/').pop()
    }));
}

function addEventLink(event) {
  const grid = document.getElementById('event-bento-grid');
  if (!grid) {
    console.error('Events grid element not found');
    return;
  }

  if (!document.getElementById(event.name)) {
    const link = document.createElement('a');
    link.id = event.name;
    link.textContent = `${event.year} - ${event.name}`;
    link.href = `/family-pictures.html?year=${event.year}&event=${encodeURIComponent(event.name)}`;
    link.setAttribute('data-year', event.year);
    link.setAttribute('data-path', event.path);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.events = allEvents;
      window.location.href = link.href;
    });
    grid.appendChild(link);
  }
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
      
      // If no suitable images in this folder, search through subfolders
      for (const folder of folders) {
        const imageLink = await getRandomImageFromFolder(year, folder.path_lower);
        if (imageLink) {
          return imageLink;
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

async function addYearLink(year) {
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

    try {
      const yearPath = await findYearFolder(year);
      const randomImageUrl = await getRandomImageFromFolder(year, yearPath);
      
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

function addSeeMoreButton() {
  const grid = document.getElementById('browse-events-grid');
  const existingButton = document.getElementById('see-more-button');
  if (existingButton) {
    existingButton.remove();
  }

  if (currentIndex < allEvents.length) {
    const button = document.createElement('button');
    button.id = 'see-more-button';
    button.textContent = 'See more';
    button.addEventListener('click', loadMoreEvents);
    grid.appendChild(button);
  }
}

function loadMoreEvents() {
  const endIndex = Math.min(currentIndex + EVENTS_PER_PAGE, allEvents.length);
  for (let i = currentIndex; i < endIndex; i++) {
    addEventLink(allEvents[i]);
  }
  currentIndex = endIndex;
  addSeeMoreButton();
}

async function main() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await refreshDropboxAccessToken();  // Refresh token once at the beginning
        
        const urlParams = new URLSearchParams(window.location.search);
        const year = urlParams.get('year');

        const yearFolders = await findYearFolders();

        if (year) {
          const yearPath = await findYearFolder(year);
          for (const year of yearFolders) {
            await addYearLink(year);
          }
          if (yearPath) {
            allEvents = await findEventFolders(yearPath);
            
            // Sort events by name
            allEvents.sort((a, b) => a.name.localeCompare(b.name));

            loadMoreEvents();
          } else {
            console.error(`Year folder ${year} not found`);
          }
        } else {
          console.error('No year specified in URL parameters');
        }
      } catch (error) {
        console.error('Error fetching event folders:', error);
      }
    } else {
      console.log('User not signed in');
    }
  });
}

main();

// Export the events variable
export { allEvents as events };
