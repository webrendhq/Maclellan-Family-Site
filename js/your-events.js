import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2/files/list_folder';
const EVENTS_PER_PAGE = 5;

let allEvents = [];
let currentIndex = 0;

async function listFolder(path) {
  try {
    const response = await fetch(DROPBOX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dropbox API error:', response.status, errorText);
      return { error: `API error: ${response.status} ${errorText}` };
    }

    const result = await response.json();
    console.log('API response for path:', path, result);
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: `Fetch error: ${error.message}` };
  }
}

function getYearFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('year');
}

async function findEventFolders(year) {
  const yearPath = `/dylan/${year}`;
  const result = await listFolder(yearPath);
  
  if (result.error) {
    console.error('Error listing year folder:', yearPath, result.error);
    return [];
  }

  return result.entries
    .filter(entry => entry['.tag'] === 'folder')
    .map(entry => ({
      name: entry.name,
      path: entry.path_lower,
      year: year
    }));
}

function displayEvents() {
  const grid = document.getElementById('event-bento-grid2');
  if (!grid) {
    console.error('Event bento grid element not found');
    return;
  }

  grid.innerHTML = ''; // Clear existing content

  const year = getYearFromURL();
  const yearDiv = document.createElement('div');
  yearDiv.className = 'year-container';
  yearDiv.innerHTML = `<h2>Family moments in ${year}</h2>`;

  for (const event of allEvents) {
    const link = document.createElement('a');
    link.textContent = event.name;
    link.href = `/family-pictures.html?year=${year}&event=${encodeURIComponent(event.name)}`;
    link.setAttribute('data-year', year);
    link.setAttribute('data-path', event.path);
    yearDiv.appendChild(link);
  }

  grid.appendChild(yearDiv);
}

async function main() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await refreshDropboxAccessToken();
        
        const year = getYearFromURL();
        if (!year) {
          console.error('Year not specified in URL');
          return;
        }

        console.log('Fetching events for year:', year);
        allEvents = await findEventFolders(year);
        console.log('Events found:', allEvents);

        displayEvents();
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

