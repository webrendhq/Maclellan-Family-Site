

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized');
} else {
    firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore();

// AWS S3 Configuration
const S3_BUCKET = 'maclellanfamily.com';
const S3_REGION = 'us-east-2';
const BASE_FOLDER = '0 US';
const URL_EXPIRATION = 3600;

// Function to fetch S3 credentials from a secure S3 object
async function fetchS3Credentials() {
    try {
        // Initialize S3 client using environment variables
        const s3Client = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: S3_REGION,
            signatureVersion: 'v4'
        });

        console.log("S3 client initialized successfully");
        return s3Client;
    } catch (error) {
        console.error('Error initializing S3:', error);
        displayError('Error initializing S3: ' + error.message);
        return null;
    }
}

// Helper function to get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Helper function to redirect to another page
function redirectTo(page, params = {}) {
    const urlParams = new URLSearchParams(params);
    window.location.href = `${page}?${urlParams.toString()}`;
}

// Function to display error messages
function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        alert(message);
    }
}

// Index Page (Login)
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User is already authenticated:', user.email);
            redirectTo('main.html');
        } else {
            console.log('No user is authenticated, stay on the login page.');
            document.getElementById('login-btn').addEventListener('click', () => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                console.log('Attempting to log in with email:', email);

                auth.signInWithEmailAndPassword(email, password)
                    .then(() => {
                        console.log('Login successful');
                        redirectTo('main.html');
                    })
                    .catch(error => {
                        console.error('Login failed:', error);
                        displayError('Login Failed: ' + error.message);
                    });
            });
        }
    });
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function getRandomImageForYear(s3Client, folderPath, year) {
    const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
    const yearPath = `${BASE_FOLDER}/${normalizedPath}/${year}/`;
    
    try {
        // First, list all event folders in the year
        const yearParams = {
            Bucket: S3_BUCKET,
            Prefix: yearPath,
            Delimiter: '/'
        };
        
        const yearData = await s3Client.listObjectsV2(yearParams).promise();
        if (!yearData.CommonPrefixes || yearData.CommonPrefixes.length === 0) {
            return null;
        }

        // Get a random event folder
        const randomEventPrefix = getRandomItem(yearData.CommonPrefixes).Prefix;
        
        // List all images in the random event folder
        const eventParams = {
            Bucket: S3_BUCKET,
            Prefix: randomEventPrefix
        };
        
        const eventData = await s3Client.listObjectsV2(eventParams).promise();
        if (!eventData.Contents) {
            return null;
        }

        // Filter for image files
        const images = eventData.Contents.filter(item => 
            !item.Key.endsWith('/') && /\.(jpg|jpeg|png)$/i.test(item.Key)
        );

        if (images.length === 0) {
            return null;
        }

        // Get a random image and generate a signed URL
        const randomImage = getRandomItem(images);
        const signedUrl = await s3Client.getSignedUrlPromise('getObject', {
            Bucket: S3_BUCKET,
            Key: randomImage.Key,
            Expires: URL_EXPIRATION
        });

        return signedUrl;
    } catch (error) {
        console.error(`Error getting random image for year ${year}:`, error);
        return null;
    }
}

// Main Page (Select Year)
if (window.location.pathname.endsWith('main.html')) {
    const container = document.getElementById("container"); // Changed from years-list to container
    const viewport = document.getElementById("viewport");
    let yearDivs = [];

    // Diamond pattern layout
    const diamondPattern = [
        [0,1,1,1,0],  // Row 1
        [1,1,1,1,1],  // Row 2
        [1,1,1,1,1],  // Row 3
        [1,1,1,1,1],  // Row 4
        [0,1,1,1,0]   // Row 5
    ];

    auth.onAuthStateChanged(async user => {
        if (user) {
            console.log('User is authenticated:', user.email);
            const userId = user.uid;
            const s3Client = await fetchS3Credentials();

            if (s3Client) {
                db.collection('users').doc(userId).get()
                    .then(doc => {
                        if (doc.exists && doc.data().folderPath) {
                            const folderPath = doc.data().folderPath;
                            console.log('Retrieved folderPath:', folderPath);
                            sessionStorage.setItem('folderPath', folderPath);
                            listYears(s3Client, folderPath);
                        } else {
                            console.error('No folderPath found for user.');
                            displayError('No folderPath not found in user document.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                        displayError('Error fetching user data: ' + error.message);
                    });
            }
        } else {
            console.log('User is not authenticated, redirecting to login page.');
            redirectTo('index.html');
        }
    });

    function listYears(s3Client, folderPath) {
        const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
        const params = {
            Bucket: S3_BUCKET,
            Prefix: `${BASE_FOLDER}/${normalizedPath}/`,
            Delimiter: '/'
        };
    
        console.log("Listing years with params:", params);
    
        s3Client.listObjectsV2(params, function (err, data) {
            if (err) {
                console.error("Error fetching years from S3:", err);
                displayError('Error fetching years: ' + err.message);
            } else {
                console.log("S3 Response data:", data);
    
                container.innerHTML = ''; // Clear existing content
                yearDivs = []; // Reset yearDivs array
    
                if (!data.CommonPrefixes || data.CommonPrefixes.length === 0) {
                    console.log('No years found.');
                    container.textContent = 'No years found.';
                    return;
                }
    
                // Create year links following diamond pattern
                let yearIndex = 0;
                for (let row = 0; row < diamondPattern.length; row++) {
                    for (let col = 0; col < diamondPattern[row].length; col++) {
                        const yearLink = document.createElement("a");
                        yearLink.className = "stamp year-item";
                        
                        if (!diamondPattern[row][col]) {
                            yearLink.classList.add("hidden");
                        } else if (yearIndex < data.CommonPrefixes.length) {
                            const prefix = data.CommonPrefixes[yearIndex];
                            const year = prefix.Prefix.replace(`${BASE_FOLDER}/${normalizedPath}/`, '').replace('/', '');
                            yearLink.className = "stamp year-item";
                            yearLink.textContent = year;
                            yearLink.href = `events.html?year=${year}`;
                            yearLink.style.textDecoration = 'none';
                            yearLink.style.position = 'relative';
                            yearLink.style.overflow = 'hidden';
                            yearLink.style.fontSize = '3rem';  // Add this line to adjust font size
                            yearLink.style.fontWeight = 'bold';  // Optional: make text bold
                            yearLink.style.color = 'white';  // Optional: change text color
                            // You can also add text shadow for better visibility over the background image
                            // yearLink.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
                            // yearLink.style.fontFamily = 'Arial, sans-serif';  // Optional: specify font family

                            // The rest of the styling remains the same...
                            yearLink.style.backgroundColor = '#f0f0f0';
                            
                            // Add a loading state
                            yearLink.style.backgroundColor = '#f0f0f0';
                            
                            // Create and append the background div
                            const bgDiv = document.createElement('div');
                            bgDiv.className = 'year-background';
                            bgDiv.style.position = 'absolute';
                            bgDiv.style.top = '0';
                            bgDiv.style.left = '0';
                            bgDiv.style.width = '100%';
                            bgDiv.style.height = '100%';
                            bgDiv.style.zIndex = '-1';
                            bgDiv.style.opacity = '1';
                            bgDiv.style.backgroundSize = 'cover';
                            bgDiv.style.backgroundPosition = 'center';
                            bgDiv.style.transition = 'opacity 1s ease';
                            yearLink.appendChild(bgDiv);
                            
                            // Fetch and set background image
                            getRandomImageForYear(s3Client, folderPath, year)
                                .then(imageUrl => {
                                    if (imageUrl) {
                                        const img = new Image();
                                        img.onload = () => {
                                            bgDiv.style.backgroundImage = `url(${imageUrl})`;
                                            bgDiv.style.opacity = '0.3';
                                        };
                                        img.src = imageUrl;
                                    }
                                })
                                .catch(error => {
                                    console.error(`Error setting background for year ${year}:`, error);
                                });
                            
                            yearIndex++;
                        } else {
                            yearLink.classList.add("hidden");
                        }
                        
                        container.appendChild(yearLink);
                        yearDivs.push(yearLink);
                    }
                }
    
                // Center the container initially
                const centerX = (viewport.offsetWidth - container.offsetWidth) / 2;
                const centerY = (viewport.offsetHeight - container.offsetHeight) / 2;
                container.style.transform = `translate(${centerX}px, ${centerY}px)`;
    
                // Initial scale update
                updateIconScales();
            }
        });
    }

    let isDragging = false;
    let startX, startY, currentX, currentY;

    function getTransformValues() {
        const transform = container.style.transform.match(/-?\d+\.?\d*/g) || [0, 0];
        return {
            x: parseFloat(transform[0]),
            y: parseFloat(transform[1])
        };
    }

    function updateIconScales() {
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenterX = viewportRect.width / 2;
        const viewportCenterY = viewportRect.height / 2;
    
        yearDivs.forEach(div => {
            if (div.classList.contains('hidden')) return;
    
            const rect = div.getBoundingClientRect();
            const divCenterX = rect.left + rect.width / 2;
            const divCenterY = rect.top + rect.height / 2;
    
            // Calculate distance from center
            const deltaX = divCenterX - viewportCenterX;
            const deltaY = divCenterY - viewportCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Adjust these values for less dramatic scaling
            const maxDistance = Math.min(viewportRect.width, viewportRect.height) * 0.4;
            const scale = Math.max(0.6, 1 - (distance / maxDistance) * 0.4);
            
            // Calculate background opacity - 1 at center, 0.5 at edges
            const opacityFactor = Math.max(0.5, 1 - (distance / maxDistance));
            
            div.style.transform = `scale(${scale})`;
            
            // Apply opacity only to the background div
            const bgDiv = div.querySelector('.year-background');
            if (bgDiv) {
                bgDiv.style.opacity = opacityFactor;
            }
        });
    }

    container.addEventListener("pointerdown", (e) => {
        // Check if we clicked on or within a year link
        const yearLink = e.target.closest('.year-item');
        if (yearLink) {
            return; // Don't start dragging if we clicked a year link
        }
    
        isDragging = true;
        container.classList.add("dragging");
        yearDivs.forEach(div => {
            // Only add dragging class to non-year elements
            if (!div.classList.contains('year-item')) {
                div.classList.add("dragging");
            }
        });
        
        const { x, y } = getTransformValues();
        currentX = x;
        currentY = y;
        startX = e.clientX;
        startY = e.clientY;
        
        container.setPointerCapture(e.pointerId);
    });

    container.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const newX = currentX + dx;
        const newY = currentY + dy;
        
        container.style.transform = `translate(${newX}px, ${newY}px)`;
        updateIconScales();
    });

    container.addEventListener("pointerup", (e) => {
        isDragging = false;
        container.classList.remove("dragging");
        yearDivs.forEach(div => div.classList.remove("dragging"));
        container.releasePointerCapture(e.pointerId);
    });

    container.addEventListener("pointercancel", (e) => {
        isDragging = false;
        container.classList.remove("dragging");
        yearDivs.forEach(div => div.classList.remove("dragging"));
        container.releasePointerCapture(e.pointerId);
    });

    // Update scales on window resize
    window.addEventListener('resize', updateIconScales);
}




// Events Page (Select Event)
if (window.location.pathname.endsWith('events.html')) {
    let currentPage = 1;
    const eventsPerPage = 12;
    let allEvents = [];

    auth.onAuthStateChanged(user => {
        if (user) {
            const folderPath = sessionStorage.getItem('folderPath');
            const year = getQueryParam('year');
            console.log('Selected year:', year);
            listEvents(folderPath, year);
        } else {
            redirectTo('index.html');
        }
    });

    async function listEvents(folderPath, year) {
        if (!folderPath || !year) {
            console.error('Missing required parameters:', { folderPath, year });
            displayError('Missing required folder path or year parameter');
            return;
        }
    
        try {
            const s3Client = await fetchS3Credentials();
            if (!s3Client) {
                throw new Error('S3 client not initialized');
            }
    
            const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
            const s3Path = `${BASE_FOLDER}/${normalizedPath}/${year}/`;
            
            const params = {
                Bucket: S3_BUCKET,
                Prefix: s3Path,
                Delimiter: '/'
            };
    
            const data = await s3Client.listObjectsV2(params).promise();
            const eventsList = document.getElementById('events-list');
            if (!eventsList) {
                console.error('events-list element not found!');
                return;
            }
            
            if (!data.CommonPrefixes || data.CommonPrefixes.length === 0) {
                eventsList.textContent = 'No events found.';
                return;
            }

            // Store all events
            allEvents = data.CommonPrefixes.map(prefix => {
                return prefix.Prefix.replace(s3Path, '').replace('/', '');
            });

            // Add pagination controls
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination';
            
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayEvents();
                }
            };

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.onclick = () => {
                if (currentPage < Math.ceil(allEvents.length / eventsPerPage)) {
                    currentPage++;
                    displayEvents();
                }
            };

            paginationContainer.appendChild(prevButton);
            paginationContainer.appendChild(nextButton);
            eventsList.parentNode.insertBefore(paginationContainer, eventsList.nextSibling);

            displayEvents();
        } catch (error) {
            console.error('Error listing events:', error);
            displayError('Error listing events: ' + error.message);
        }
    }

    function displayEvents() {
        const eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';
        
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const eventsToDisplay = allEvents.slice(startIndex, endIndex);
        
        eventsToDisplay.forEach(eventName => {
            const year = getQueryParam('year');
            const link = document.createElement('a');
            link.href = `images.html?year=${encodeURIComponent(year)}&event=${encodeURIComponent(eventName)}`;
            link.className = 'event-link';
            link.textContent = eventName;
            
            const container = document.createElement('div');
            container.className = 'event-container';
            container.appendChild(link);
            
            eventsList.appendChild(container);
        });

        // Update button states
        const [prevButton, nextButton] = document.querySelectorAll('.pagination button');
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage >= Math.ceil(allEvents.length / eventsPerPage);
    }
}

// Images Page
// Images Page
// Images Page
if (window.location.pathname.endsWith('images.html')) {
    auth.onAuthStateChanged(user => {
        if (user) {
            const folderPath = sessionStorage.getItem('folderPath');
            const year = getQueryParam('year');
            const event = getQueryParam('event');
            console.log(`Displaying images for ${BASE_FOLDER}/${folderPath}/${year}/${event}`);
            initializeGallery(folderPath, year, event);
        } else {
            redirectTo('index.html');
        }
    });

    // Cache management code remains the same
    const CACHE_VERSION = 1;
    const CACHE_PREFIX = 'imgCache_v' + CACHE_VERSION + '_';
    
    function getCacheKey(imageKey) {
        return CACHE_PREFIX + imageKey;
    }

    async function getCachedThumbnail(imageKey) {
        try {
            const cacheKey = getCacheKey(imageKey);
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                return cached;
            }
        } catch (e) {
            console.warn('Cache error:', e);
        }
        return null;
    }

    async function cacheThumbnail(imageKey, thumbnailUrl) {
        try {
            const cacheKey = getCacheKey(imageKey);
            localStorage.setItem(cacheKey, thumbnailUrl);
        } catch (e) {
            console.warn('Cache storage error:', e);
            if (e.name === 'QuotaExceededError') {
                clearOldCache();
            }
        }
    }

    function clearOldCache() {
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(CACHE_PREFIX)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.slice(100).forEach(key => localStorage.removeItem(key));
    }

    async function createThumbnail(imageUrl, maxWidth = 200, maxHeight = 200) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };

            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    let allImages = [];
    let currentPage = 1;
    const IMAGES_PER_PAGE = 4;
    let isLoading = false;
    let s3ClientInstance = null;

    async function getS3Client() {
        if (!s3ClientInstance) {
            s3ClientInstance = await fetchS3Credentials();
        }
        return s3ClientInstance;
    }

    async function initializeGallery(folderPath, year, event) {
        try {
            const s3Client = await getS3Client();
            if (!s3Client) throw new Error('S3 client not initialized');

            const params = {
                Bucket: S3_BUCKET,
                Prefix: `${BASE_FOLDER}/${folderPath.replace(/^\//, '')}/${year}/${event}/`
            };

            const data = await s3Client.listObjectsV2(params).promise();
            
            // Filter and prepare image data
            allImages = (data.Contents || [])
                .filter(item => !item.Key.endsWith('/') && 
                    /\.(jpg|jpeg|png)$/i.test(item.Key))
                .map(item => ({
                    key: item.Key,
                    signedUrl: null,
                    thumbnailUrl: null
                }));

            // Setup gallery container
            const gallery = document.getElementById('images-gallery');
            // gallery.innerHTML = '';
            // gallery.className = 'images-grid';
            // gallery.style.display = 'grid';
            // gallery.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            // gallery.style.gap = '1rem';
            // gallery.style.padding = '1rem';

            // Create pagination controls
            createPaginationControls();

            // Initial load
            await loadImagesForCurrentPage();
        } catch (error) {
            console.error('Error initializing gallery:', error);
            displayError('Error loading gallery: ' + error.message);
        }
    }

    function createPaginationControls() {
        // Remove existing pagination if any
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) {
            existingPagination.remove();
        }

        const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        paginationContainer.style.textAlign = 'center';
        paginationContainer.style.margin = '1rem';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.style.margin = '0 0.5rem';
        prevButton.onclick = async () => {
            if (currentPage > 1 && !isLoading) {
                currentPage--;
                await loadImagesForCurrentPage();
                updatePaginationControls();
            }
        };

        const pageInfo = document.createElement('span');
        pageInfo.id = 'page-info';
        pageInfo.style.margin = '0 1rem';

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.style.margin = '0 0.5rem';
        nextButton.onclick = async () => {
            if (currentPage < totalPages && !isLoading) {
                currentPage++;
                await loadImagesForCurrentPage();
                updatePaginationControls();
            }
        };

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);

        const gallery = document.getElementById('images-gallery');
        gallery.parentNode.insertBefore(paginationContainer, gallery);

        updatePaginationControls();
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        const pagination = document.querySelector('.pagination');
        if (pagination) {
            const [prevButton, _, nextButton] = pagination.children;
            prevButton.disabled = currentPage === 1 || isLoading;
            nextButton.disabled = currentPage === totalPages || isLoading;
        }
    }

    async function loadImagesForCurrentPage() {
        if (isLoading) return;
        isLoading = true;
        updatePaginationControls();
    
        try {
            const gallery = document.getElementById('images-gallery');
            gallery.innerHTML = '';
            gallery.className = 'images-grid';
            gallery.style.display = 'grid';
            gallery.style.gridTemplateColumns = 'repeat(2, 1fr)';
            gallery.style.gridTemplateRows = 'repeat(2, 1fr)';
            gallery.style.gap = '1rem';
            gallery.style.padding = '1rem';
            gallery.style.width = '75vh';
            gallery.style.height = '100%';
    
            const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
            const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, allImages.length);
            const pageImages = allImages.slice(startIndex, endIndex);
    
            const s3Client = await getS3Client();
    
            await Promise.all(pageImages.map(async (image) => {
                try {
                    // Get signed URL if not already present
                    if (!image.signedUrl) {
                        image.signedUrl = await s3Client.getSignedUrlPromise('getObject', {
                            Bucket: S3_BUCKET,
                            Key: image.key,
                            Expires: URL_EXPIRATION
                        });
                    }
    
                    // Display the image using the full resolution URL
                    displayImage(image.signedUrl, image.signedUrl, image.key);
    
                } catch (error) {
                    console.error('Error loading image:', error);
                    displayErrorImage(image.key);
                }
            }));
    
        } catch (error) {
            console.error('Error loading page:', error);
            displayError('Error loading images: ' + error.message);
        } finally {
            isLoading = false;
            updatePaginationControls();
        }
    }

    function displayImage(imageUrl, fullResUrl, imageKey) {
        const gallery = document.getElementById('images-gallery');
        const container = document.createElement('a');
        container.className = 'image-container';
        container.href = fullResUrl;
        container.target = '_blank';
        container.style.backgroundImage = `url(${imageUrl})`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.setAttribute('aria-label', imageKey.split('/').pop());
        
        gallery.appendChild(container);
    }

}

