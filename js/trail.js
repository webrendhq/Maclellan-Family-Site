// Function to check URL and update h1 text
function updateH1BasedOnURL() {
  // Get the current URL pathname
  const path = window.location.pathname;
  
  // Get the h1 element
  const h1Element = document.getElementById('family-or-you');
  
  // Remove the leading slash and get everything after it
  const urlAfterSlash = path.slice(1);
  
  // Check if 'family' exists anywhere in the URL after the first slash
  if (urlAfterSlash.includes('family')) {
      h1Element.textContent = 'Family';
  }
  // Check if 'your' exists anywhere in the URL after the first slash
  else if (urlAfterSlash.includes('your')) {
      h1Element.textContent = 'You';
  }
  // If neither "family" nor "your" is found, you can set a default text or leave it unchanged
  // else {
  //     h1Element.textContent = 'Default Text';
  // }
}

function getYearFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('year');
}

function updateYearHeader() {
  const year = getYearFromURL();
  
  if (year) {
      // Get both elements by their IDs
      const yearElement1 = document.getElementById('year-current');
      const yearElement2 = document.getElementById('year-current2');
      
      // Update the text content if the elements exist
      if (yearElement1) {
          yearElement1.textContent = year;
      }
      if (yearElement2) {
          yearElement2.textContent = year;
      }
  } else {
      // Optional: Set default text if no year is found
      // if (yearElement1) yearElement1.textContent = 'Year not specified';
      // if (yearElement2) yearElement2.textContent = 'Year not specified';
  }
}

function getEventFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('path');
}

function updateEventHeader() {
  const eventParam = getEventFromURL();
  
  if (eventParam) {
      // Get both elements by their IDs
      const eventElement1 = document.getElementById('event-current');
      const eventElement2 = document.getElementById('event-current2');
      
      // Update the text content if the elements exist
      if (eventElement1) {
          eventElement1.textContent = eventParam;
      }
      if (eventElement2) {
          eventElement2.textContent = eventParam;
      }
  } else {
      // Optional: Set default text if no event is found
      // if (eventElement1) eventElement1.textContent = 'Event not specified';
      // if (eventElement2) eventElement2.textContent = 'Event not specified';
  }
}

// Call the functions when the DOM is ready
function domReady(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}

domReady(function() {
  console.log("DOM is ready");
  updateYearHeader();
  updateEventHeader();
  updateH1BasedOnURL();
});

// If you want to be extra sure, you can also add this:
if (document.readyState === "complete") {
  console.log("Document already complete, initializing...");
  updateYearHeader();
  updateEventHeader();
  updateH1BasedOnURL();
}
