




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
    //   h1Element.textContent = 'Default Text';
    // }
}

  function getYearFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('year');
  }

  function updateYearHeader() {
    const yearElement = document.getElementById('year-current');
    const year = getYearFromURL();
    
    if (year) {
      yearElement.textContent = year;
    } else {
      // Optional: Set a default text if no year is found
      // yearElement.textContent = 'Year not specified';
    }
  }
  
  // Call the function when the page loads
//   window.addEventListener('load', () => {
//     updateH1BasedOnURL();
//     updateYearHeader();
//   });

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
    updateH1BasedOnURL();
});

// If you want to be extra sure, you can also add this:
if (document.readyState === "complete") {
    console.log("Document already complete, initializing...");
    updateYearHeader();
    updateH1BasedOnURL();
}
  
  
  // If you're using client-side routing, uncomment the following line:
  // window.addEventListener('popstate', updateH1BasedOnURL);