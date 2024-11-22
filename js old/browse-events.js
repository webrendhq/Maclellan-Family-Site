import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';
const EVENTS_PER_PAGE = 5;

let allEvents = [];
let currentIndex = 0;

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
    .map(entry => entry.path_lower);

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
  const grid = document.getElementById('browse-events-grid');
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
        const yearFolders = await findYearFolders();
        for (const yearPath of yearFolders) {
          const eventFolders = await findEventFolders(yearPath);
          allEvents = allEvents.concat(eventFolders);
        }
        
        // Sort events by year (descending) and then by name
        allEvents.sort((a, b) => {
          if (b.year !== a.year) {
            return b.year - a.year;
          }
          return a.name.localeCompare(b.name);
        });

        loadMoreEvents();
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