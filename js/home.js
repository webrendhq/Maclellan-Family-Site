// Import the functions you need from the SDKs you need
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
import { refreshDropboxAccessToken, createDropboxInstance, getDropboxInstance, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { query, getDocs, collection, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getUserCount, updateTotalFileCount } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/usercount.js';





// Function to search Dropbox files and append results
async function searchDropboxFiles(startIndex = 1) {
    await refreshDropboxAccessToken(); // Ensure the access token is fresh
    let searchResults = [];
      
    try {
      if (!cursor) {
        // Initial search request
        const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: "family vacation",
            options: { max_results: 25, start: startIndex }
          })
        });
  
        if (response.ok) {
          const data = await response.json();
          searchResults = data.matches.map(match => match.metadata.metadata);
          cursor = data.cursor; // Save the cursor for the next request
        } else {
          console.error('Error searching Dropbox files:', response.statusText);
        }
      } else {
        // Continue from where we left off
        const response = await fetch('https://api.dropboxapi.com/2/files/search/continue_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              query: "family vacation", 
              cursor: cursor, 
              options: { max_results: 25, start: startIndex }
          })
        });
  
        if (response.ok) {
          const data = await response.json();
          searchResults = data.matches.map(match => match.metadata.metadata);
          cursor = data.cursor; // Update cursor for the next request
        } else {
          console.error('Error continuing search for Dropbox files:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error during search or continue search:', error);
    }
  
    return searchResults;
  }
  
  let startIndex = 1;
  // Function to append search results to the DOM
  async function appendResults(results) {
      const container = document.getElementById('search-results');
  
      for (const file of results) {
          if (startIndex >= 25) { // Stop appending after 25 elements
          appendLoadMoreButton();
          break;
          }
          if (file['.tag'] === 'file') {
              const fileExtension = file.name.split('.').pop().toLowerCase();
             
              let format = 'jpeg'; // Default format
              if (['png', 'heic'].includes(fileExtension)) {
                  format = fileExtension; // Use png or heic if applicable
              }
          
              if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mkv'].includes(fileExtension)) {
                  try {
                  const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                      method: 'POST',
                      headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ path: file.path_lower })
                  });
  
                  const thumbnailResponse = await fetch('https://content.dropboxapi.com/2/files/get_thumbnail', {
                      method: 'POST',
                      headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Dropbox-API-Arg': JSON.stringify({
                          path: file.path_lower,
                          format: format, // Choose your desired format
                          size: 'w640h480' // Choose your desired size (e.g., 'w128h128', 'w640h480')
                      })
                      }
                  });
          
                  if (!thumbnailResponse.ok) {
                      console.error('Error getting thumbnail:', thumbnailResponse.statusText);
                      continue;
                  }
  
                  if (tempLinkResponse.ok) {
                      const tempLinkData = await tempLinkResponse.json();
                      const previewData = await thumbnailResponse.blob();
                       
  
                      let previewUrl = URL.createObjectURL(previewData);  // Use preview URL if available, otherwise temp link
                      // || tempLinkData.link
                      console.log('Thumbnail size:', previewData.size); // Log the size in bytes 
                      console.log(startIndex);
                      let mediaElement;
                      
                      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                      mediaElement = document.createElement('img');
                      // mediaElement.dataset.src = tempLinkData.link;
                      mediaElement.src = previewUrl; // Use preview URL for initial loading
                      // mediaElement.setAttribute('data-src', tempLinkData.link); // Set temp link for lazy loading
                      // mediaElement.setAttribute('loading', 'lazy');
                      // mediaElement.style.maxWidth = '100%';
                      
                      } else if (['mp4', 'mov', 'avi', 'mkv'].includes(fileExtension)) {
                      mediaElement = document.createElement('video');
                      // mediaElement.dataset.src = tempLinkData.link;
                      mediaElement.src = previewUrl; // Use preview URL for initial loading
                      // mediaElement.setAttribute('data-src', tempLinkData.link); // Set temp link for lazy loading
                      // mediaElement.setAttribute('loading', 'lazy');
                      mediaElement.controls = true;
                      // mediaElement.style.maxWidth = '100%';
                      
                      }
  
                      if (mediaElement) {
                      const wrapper = document.createElement('div');
                      wrapper.style.position = 'relative';
                      wrapper.style.display = 'inline-block';
                      wrapper.appendChild(mediaElement);
                      container.appendChild(wrapper);
  
                      // Increment the startIndex each time an element is added
                      startIndex++;
                      }
                  } else {
                      console.error('Error getting temporary link:', tempLinkResponse.statusText);
                  }
                  } catch (error) {
                  console.error('Error fetching temporary link:', error);
                  }
              }
          }
      }
      
  }
  
  function appendLoadMoreButton() {
      const loadMoreButton = document.getElementById('load-more-button');
      loadMoreButton.style.display = 'flex';
    
      loadMoreButton.onclick = () => {
        startIndex = 0; // Reset the startIndex counter to 0 when the button is clicked
        loadMoreButton.style.display = 'none'; // Hide the button after clicking
        loadMoreFiles(); // Load more files
      };
    }
  
  // Handle loading more files
  
  async function loadMoreFiles() {
      const results = await searchDropboxFiles(startIndex);
      await appendResults(results);
  }