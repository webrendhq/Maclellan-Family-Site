

const firebaseConfig = {
    apiKey: "AIzaSyCqGV5J3if7mJoH464xGx6bZ5wgU_wMn3I",
    authDomain: "maclellen.firebaseapp.com",
    projectId: "maclellen",
    storageBucket: "maclellen.firebasestorage.app",
    messagingSenderId: "254246388059",
    appId: "1:254246388059:web:ca15c2405a33477665da7e"
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

const signOutBtn = document.getElementById('sign-out');
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('User signed out successfully');
            sessionStorage.removeItem('folderPath');
            redirectTo('index.html');
        }).catch((error) => {
            console.error('Error signing out:', error);
            displayError('Error signing out: ' + error.message);
        });
    });
}

// Function to fetch S3 credentials from a secure S3 object
async function fetchS3Credentials() {
    try {
        // Initialize S3 client using environment variables
        const s3Client = new AWS.S3({
            accessKeyId: 'AKIAZI2LISZNQPAFGSP6',
            secretAccessKey: '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',
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
        // List all objects in the year folder and its subfolders
        const yearParams = {
            Bucket: S3_BUCKET,
            Prefix: yearPath
        };
        
        const yearData = await s3Client.listObjectsV2(yearParams).promise();
        if (!yearData.Contents) {
            return null;
        }

        // Filter for image files anywhere in the year folder or its subfolders
        const images = yearData.Contents.filter(item => 
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

    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#000000';
    document.body.style.backgroundImage = "url('/images/totalnoise.jpg')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.minHeight = "100vh";
    document.body.style.position = "relative";

    

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
    
                container.innerHTML = '';
                yearDivs = [];
    
                if (!data.CommonPrefixes || data.CommonPrefixes.length === 0) {
                    container.textContent = 'No years found.';
                    return;
                }
    
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
                            
                            // Add initial state for fade-in animation
                            yearLink.style.opacity = '0';
                            yearLink.style.transform = 'scale(0.8)';
                            yearLink.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                            yearLink.style.transitionDelay = `${(row * diamondPattern[row].length + col) * 0.1}s`;
                            
                            yearLink.textContent = year;
                            yearLink.href = `events.html?year=${year}`;
                            yearLink.style.textDecoration = 'none';
                            yearLink.style.position = 'relative';
                            yearLink.style.overflow = 'hidden';
                            yearLink.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
                            yearLink.style.fontSize = '3rem';
                            yearLink.style.fontWeight = 'bold';
                            yearLink.style.color = 'white';
                            yearLink.style.backgroundColor = '#f0f0f0';
                            
                            const bgDiv = document.createElement('div');
                            bgDiv.className = 'year-background';
                            bgDiv.style.position = 'absolute';
                            bgDiv.style.top = '0';
                            bgDiv.style.left = '0';
                            bgDiv.style.width = '100%';
                            bgDiv.style.height = '100%';
                            bgDiv.style.zIndex = '-1';
                            bgDiv.style.opacity = '0';
                            bgDiv.style.backgroundSize = 'cover';
                            bgDiv.style.backgroundPosition = 'center';
                            bgDiv.style.transition = 'opacity 1s ease';
                            yearLink.appendChild(bgDiv);
                            
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
    
                            // Trigger the fade-in animation after a small delay
                            setTimeout(() => {
                                yearLink.style.opacity = '1';
                                yearLink.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            yearLink.classList.add("hidden");
                        }
                        
                        container.appendChild(yearLink);
                        yearDivs.push(yearLink);
                    }
                }
    
                const centerX = (viewport.offsetWidth - container.offsetWidth) / 2;
                const centerY = (viewport.offsetHeight - container.offsetHeight) / 2;
                container.style.transform = `translate(${centerX}px, ${centerY}px)`;
                container.style.transition = 'transform 0.3s ease-out';
    
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
        
        requestAnimationFrame(() => {
            yearDivs.forEach(div => {
                if (div.classList.contains('hidden')) return;
    
                const rect = div.getBoundingClientRect();
                const divCenterX = rect.left + rect.width / 2;
                const divCenterY = rect.top + rect.height / 2;
    
                const deltaX = divCenterX - viewportCenterX;
                const deltaY = divCenterY - viewportCenterY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                const maxDistance = Math.min(viewportRect.width, viewportRect.height) * 0.4;
                const scale = Math.max(0, 1 - (distance / maxDistance) * 0.4);
                const opacityFactor = Math.max(0.8, 1 - (distance / maxDistance));
                
                // Add smooth transitions
                div.style.transition = 'transform 0.1s ease-out';
                div.style.transform = `scale(${scale})`;
                
                const bgDiv = div.querySelector('.year-background');
                if (bgDiv) {
                    bgDiv.style.transition = 'opacity 0.1s ease-out';
                    bgDiv.style.opacity = opacityFactor;
                }
            });
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
        
        requestAnimationFrame(() => {
            container.style.transform = `translate(${newX}px, ${newY}px)`;
            updateIconScales();
        });
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

// Search Page
// Search Page
// Search Page
// Search Page
// Search Page
// Search Page
// Search Page
if (window.location.pathname.endsWith('search.html')) {
    const searchTerm = getQueryParam('q')?.toLowerCase();
    const container = document.getElementById('search-results');
    let allMatchingImages = [];
    let currentLoadingBatch = null;
    let lastVisibleIndex = 0;
    const BATCH_SIZE = 20;
    let isModalOpen = false;
    let currentImageIndex = 0;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'imageModal';
    
    // Update search query display
    const searchQuerySpan = document.getElementById('search-query');
    if (searchQuerySpan) {
        searchQuerySpan.textContent = searchTerm || '';
    }

    // Search bar functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        searchInput.value = searchTerm || '';
        
        searchButton.addEventListener('click', () => {
            const newSearchTerm = searchInput.value.trim();
            if (newSearchTerm) {
                redirectTo('search.html', { q: newSearchTerm });
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const newSearchTerm = searchInput.value.trim();
                if (newSearchTerm) {
                    redirectTo('search.html', { q: newSearchTerm });
                }
            }
        });
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <button class="nav-btn prev-btn">&#10094;</button>
            <button class="nav-btn next-btn">&#10095;</button>
            <img class="modal-img" alt="Preview">
        </div>
    `;
    
    // Create modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <button class="nav-btn prev-btn">&#10094;</button>
            <button class="nav-btn next-btn">&#10095;</button>
            <img class="modal-img" alt="Preview">
        </div>
    `;
    
    document.body.appendChild(modal);

    // Then get the modal elements
    const modalImg = modal.querySelector('.modal-img');
    const closeBtn = modal.querySelector('.close-btn');
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');


    // Navigation handlers
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateModalImage();
        }
    }

    function showNextImage() {
        if (currentImageIndex < allMatchingImages.length - 1) {
            currentImageIndex++;
            updateModalImage();
        }
    }

    async function updateModalImage() {
        try {
            // Find all search result items
            const allItems = Array.from(document.getElementsByClassName('search-result-item'));
            // Get current item's background image
            const currentImageUrl = allItems[currentImageIndex].style.backgroundImage.slice(4, -1).replace(/["']/g, "");
            
            modalImg.style.opacity = '0';
            modalImg.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                modalImg.src = currentImageUrl;
                modalImg.style.opacity = '1';
                modalImg.style.transform = 'scale(1)';
            }, 200);
            
            prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
            nextBtn.style.display = currentImageIndex < allItems.length - 1 ? 'block' : 'none';
        } catch (error) {
            console.error('Error updating modal image:', error);
        }
    }

    // Event listeners
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === closeBtn) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    // Intersection Observers
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const imageUrl = container.dataset.imageUrl;
                if (imageUrl) {
                    const img = new Image();
                    img.onload = () => {
                        container.style.backgroundImage = `url(${imageUrl})`;
                        container.classList.remove('loading');
                    };
                    img.src = imageUrl;
                    observer.unobserve(container);
                    container.removeAttribute('data-image-url');
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !currentLoadingBatch) {
                loadNextBatch();
            }
        });
    }, { rootMargin: '200px' });

    // Styles
    const searchStyles = `
        .search-container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            gap: 1rem;
        }

        .search-input-container {
            flex: 1;
            display: flex;
            gap: 0.5rem;
        }

        #search-input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }

        #search-button {
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }

        #search-button:hover {
            background: #0056b3;
        }

        #search-results {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            width: 100%;
        }
        
        .search-result-item {
            height: 200px;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #f0f0f0;
        }
        
        .search-result-item.loading {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { background-color: #f0f0f0; }
            50% { background-color: #e0e0e0; }
            100% { background-color: #f0f0f0; }
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 1000;
        }

        .modal-content {
            position: relative;
            margin: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 20px;
        }

        .modal-img {
            max-width: 90%;
            max-height: 90vh;
            object-fit: contain;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
        }

        .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 16px;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            font-size: 24px;
            transition: background 0.3s;
            z-index: 1001;
        }

        .nav-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .prev-btn {
            left: 25px;
        }

        .next-btn {
            right: 25px;
        }

        .download-btn {
            position: absolute;
            bottom: 25px;
            right: 25px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 24px;
            transition: background 0.3s;
            z-index: 1001;
            text-decoration: none;
        }

        .download-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .error {
            background-color: #fee;
            color: #c00;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem;
        }

        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 2rem;
            font-size: 1.2rem;
            color: #666;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);

    async function loadNextBatch() {
        if (currentLoadingBatch || lastVisibleIndex >= allMatchingImages.length) return;

        const endIndex = Math.min(lastVisibleIndex + BATCH_SIZE, allMatchingImages.length);
        const batch = allMatchingImages.slice(lastVisibleIndex, endIndex);
        currentLoadingBatch = batch;

        try {
            await displayImageBatch(batch);
            lastVisibleIndex = endIndex;

            if (lastVisibleIndex < allMatchingImages.length) {
                const lastItem = container.lastElementChild;
                if (lastItem) {
                    scrollObserver.observe(lastItem);
                }
            }
        } finally {
            currentLoadingBatch = null;
        }
    }

    async function displayImageBatch(images) {
        const s3Client = await fetchS3Credentials();
        
        return Promise.all(images.map(async (image, batchIndex) => {
            try {
                const signedUrl = await s3Client.getSignedUrlPromise('getObject', {
                    Bucket: S3_BUCKET,
                    Key: image.Key,
                    Expires: URL_EXPIRATION
                });
    
                const container = document.createElement('div');
                container.className = 'search-result-item loading';
                container.style.backgroundImage = `url(${signedUrl})`;
                container.classList.remove('loading');
                
                container.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentImageIndex = lastVisibleIndex - BATCH_SIZE + batchIndex;
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    modalImg.src = signedUrl;
                    modalImg.style.opacity = '1';
                    modalImg.style.transform = 'scale(1)';
                    
                    // Update navigation buttons
                    prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
                    nextBtn.style.display = currentImageIndex < allMatchingImages.length - 1 ? 'block' : 'none';
                });
    
                document.getElementById('search-results').appendChild(container);
                
            } catch (error) {
                console.error('Error processing image:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'search-result-item error';
                errorDiv.textContent = 'Failed to load image';
                document.getElementById('search-results').appendChild(errorDiv);
            }
        }));
    }

    // Function to fetch all objects recursively from S3
    async function listAllObjects(s3Client, bucket, prefix) {
        let allObjects = [];
        let continuationToken = undefined;
        
        do {
            const params = {
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken
            };
            
            const response = await s3Client.listObjectsV2(params).promise();
            allObjects.push(...(response.Contents || []));
            continuationToken = response.NextContinuationToken;
            
        } while (continuationToken);
        
        return allObjects;
    }

    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const s3Client = await fetchS3Credentials();
                if (!s3Client) throw new Error('S3 client not initialized');

                const userId = user.uid;
                const doc = await db.collection('users').doc(userId).get();
                
                if (!doc.exists || !doc.data().folderPath) {
                    throw new Error('No folderPath found for user');
                }
                
                const folderPath = doc.data().folderPath;
                const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
                const basePrefix = `${BASE_FOLDER}/${normalizedPath}/`;

                const allFiles = await listAllObjects(s3Client, S3_BUCKET, basePrefix);
                allMatchingImages = allFiles.filter(item => {
                    const key = item.Key.toLowerCase();
                    return !key.endsWith('/') && 
                           /\.(jpg|jpeg|png)$/i.test(key) && 
                           key.includes(searchTerm);
                });
                
                if (allMatchingImages.length === 0) {
                    container.innerHTML = '<div class="no-results">No matching images found.</div>';
                    return;
                }

                container.innerHTML = '';
                await loadNextBatch();

            } catch (error) {
                console.error('Error in search:', error);
                displayError('Error performing search: ' + error.message);
            }
        } else {
            redirectTo('index.html');
        }
    });

    // Handle initial page load animations
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // Handle browser navigation
    window.addEventListener('popstate', () => {
        const newSearchTerm = getQueryParam('q');
        if (newSearchTerm !== searchTerm) {
            location.reload();
        }
    });

    // Clean up observers when leaving page
    window.addEventListener('unload', () => {
        imageObserver.disconnect();
        scrollObserver.disconnect();
    });
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
            
            // First, get all objects in the year folder (including those not in event folders)
            const allObjectsParams = {
                Bucket: S3_BUCKET,
                Prefix: s3Path
            };
            const allObjectsData = await s3Client.listObjectsV2(allObjectsParams).promise();
            
            // Then get the event folders
            const eventFoldersParams = {
                Bucket: S3_BUCKET,
                Prefix: s3Path,
                Delimiter: '/'
            };
            const eventFoldersData = await s3Client.listObjectsV2(eventFoldersParams).promise();
            
            const eventsList = document.getElementById('events-list');
            if (!eventsList) {
                console.error('events-list element not found!');
                return;
            }
    
            // Get images that are directly in the year folder (not in any event subfolder)
            const rootImages = allObjectsData.Contents?.filter(item => {
                const relativePath = item.Key.substring(s3Path.length);
                return !item.Key.endsWith('/') && 
                       !relativePath.includes('/') && 
                       /\.(jpg|jpeg|png)$/i.test(item.Key);
            }) || [];
    
            // Process event folders
            let eventPrefixes = eventFoldersData.CommonPrefixes || [];
            
            // If there are images in the root, add an "Other" category
            if (rootImages.length > 0) {
                allEvents = [...eventPrefixes.map(prefix => 
                    prefix.Prefix.replace(s3Path, '').replace('/', '')
                ), 'Other'];
            } else {
                allEvents = eventPrefixes.map(prefix => 
                    prefix.Prefix.replace(s3Path, '').replace('/', '')
                );
            }
    
            if (allEvents.length === 0) {
                eventsList.textContent = 'No events or images found.';
                return;
            }
    
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
        
        // Create fade out animation
        eventsList.style.transition = 'opacity 0.3s ease-out';
        eventsList.style.opacity = '0';
        
        // Wait for fade out to complete before updating content
        setTimeout(() => {
            eventsList.innerHTML = '';
            
            const startIndex = (currentPage - 1) * eventsPerPage;
            const endIndex = startIndex + eventsPerPage;
            const eventsToDisplay = allEvents.slice(startIndex, endIndex);
            
            // Create container for staggered animations
            const fragment = document.createDocumentFragment();
            
            eventsToDisplay.forEach((eventName, index) => {
                const year = getQueryParam('year');
                const link = document.createElement('a');
                link.href = `images.html?year=${encodeURIComponent(year)}&event=${encodeURIComponent(eventName)}`;
                link.className = 'event-link';
                link.textContent = eventName;
                
                const container = document.createElement('div');
                container.className = 'event-container';
                container.style.opacity = '0';
                container.style.transform = 'translateY(20px)';
                container.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                container.style.transitionDelay = `${index * 0.1}s`;
                container.appendChild(link);
                
                fragment.appendChild(container);
            });
            
            eventsList.appendChild(fragment);
            
            // Trigger fade in for the list and staggered animations for items
            requestAnimationFrame(() => {
                eventsList.style.opacity = '1';
                Array.from(eventsList.children).forEach(child => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                });
            });
    
            // Update button states with transitions
            const [prevButton, nextButton] = document.querySelectorAll('.pagination button');
            prevButton.style.transition = 'opacity 0.3s ease';
            nextButton.style.transition = 'opacity 0.3s ease';
            
            prevButton.style.opacity = currentPage === 1 ? '0.5' : '1';
            nextButton.style.opacity = currentPage >= Math.ceil(allEvents.length / eventsPerPage) ? '0.5' : '1';
            
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage >= Math.ceil(allEvents.length / eventsPerPage);
        }, 300); // Match the fade out duration
    }
}



const additionalStyles = `
.w-layout-cell {
    display: flex;
    justify-content: space-around;
    gap: 2vh;
    padding: 2vh 10vh 2vh 10vh;
    min-width: 1500px;
    width: 100%;
}

.images-grid, .images-grid2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 16px;
    flex-grow: 1;
    width: 100%;
    height: calc(100vh - 100px);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.images-grid2 {
    display: none;
}

@media (min-width: 1500px) {
    .images-grid2 {
        display: grid;
    }
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Images Page
// Images Page
// Images Page
// Images Page
if (window.location.pathname.endsWith('images.html')) {
    const CACHE_VERSION = 1;
    const CACHE_PREFIX = 'imgCache_v' + CACHE_VERSION + '_';
    let allImages = [];
    let currentPage = 1;
    let imagesPerGrid = 4;
    let isLoading = false;
    let s3ClientInstance = null;
    let isModalOpen = false;
    let currentImageIndex = 0;

    // Initialize modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'imageModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <button class="nav-btn prev-btn">&#10094;</button>
            <button class="nav-btn next-btn">&#10095;</button>
            <img class="modal-img" alt="Preview">
        </div>
    `;
    
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.modal-img');
    const closeBtn = modal.querySelector('.close-btn');
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');

    // Track window width changes
    const widthObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const width = entry.contentRect.width;
            const gallery2 = document.getElementById('images-gallery2');
            if (width >= 1500) {
                gallery2.style.display = 'grid';
                imagesPerGrid = 8; // 4 images per grid * 2 grids
            } else {
                gallery2.style.display = 'none';
                imagesPerGrid = 4;
            }
            loadImagesForCurrentPage();
        }
    });

    // Observe the scrapbook container
    const scrapbook = document.querySelector('.scrapbook');
    if (scrapbook) {
        widthObserver.observe(scrapbook);
    }

    // Navigation handlers for modal
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateModalImage();
        }
    }

    function showNextImage() {
        if (currentImageIndex < allImages.length - 1) {
            currentImageIndex++;
            updateModalImage();
        }
    }

    async function updateModalImage() {
        try {
            const currentImage = allImages[currentImageIndex];
            if (!currentImage.signedUrl) {
                const s3Client = await getS3Client();
                currentImage.signedUrl = await s3Client.getSignedUrlPromise('getObject', {
                    Bucket: S3_BUCKET,
                    Key: currentImage.key,
                    Expires: URL_EXPIRATION
                });
            }
            
            modalImg.style.opacity = '0';
            modalImg.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                modalImg.src = currentImage.signedUrl;
                modalImg.style.opacity = '1';
                modalImg.style.transform = 'scale(1)';
            }, 200);
            
            prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
            nextBtn.style.display = currentImageIndex < allImages.length - 1 ? 'block' : 'none';
        } catch (error) {
            console.error('Error updating modal image:', error);
        }
    }

    // Event listeners for modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === closeBtn) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            isModalOpen = false;
        }
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    document.addEventListener('keydown', (e) => {
        if (isModalOpen) {
            switch(e.key) {
                case 'Escape':
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    isModalOpen = false;
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    });

    // Cache management functions
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

    // Grid layouts
    const gridLayouts = [
        {
            columns: 'repeat(2, 1fr)',
            rows: 'repeat(2, 1fr)',
            areas: [
                'area1 area2',
                'area3 area4'
            ],
            templates: {
                area1: '1 / 1 / 2 / 2',
                area2: '1 / 2 / 2 / 3',
                area3: '2 / 1 / 3 / 2',
                area4: '2 / 2 / 3 / 3'
            }
        },
        {
            columns: 'repeat(2, 1fr)',
            rows: 'repeat(2, 1fr)',
            areas: [
                'area1 area1',
                'area2 area3'
            ],
            templates: {
                area1: '1 / 1 / 2 / 3',
                area2: '2 / 1 / 3 / 2',
                area3: '2 / 2 / 3 / 3'
            }
        },
        {
            columns: 'repeat(2, 1fr)',
            rows: '1fr',
            areas: [
                'area1 area2'
            ],
            templates: {
                area1: '1 / 1 / 2 / 2',
                area2: '1 / 2 / 2 / 3'
            }
        },
        {
            columns: 'repeat(3, 1fr)',
            rows: 'repeat(2, 1fr)',
            areas: [
                'area1 area1 area2',
                'area1 area1 area3'
            ],
            templates: {
                area1: '1 / 1 / 3 / 3',
                area2: '1 / 3 / 2 / 4',
                area3: '2 / 3 / 3 / 4'
            }
        }
    ];

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

            const normalizedPath = folderPath.replace(/^\//, '');
            let prefix;
            
            if (event === 'Other') {
                prefix = `${BASE_FOLDER}/${normalizedPath}/${year}/`;
            } else {
                prefix = `${BASE_FOLDER}/${normalizedPath}/${year}/${event}/`;
            }

            const params = {
                Bucket: S3_BUCKET,
                Prefix: prefix
            };

            const data = await s3Client.listObjectsV2(params).promise();
            
            allImages = (data.Contents || [])
                .filter(item => {
                    if (event === 'Other') {
                        const relativePath = item.Key.substring(prefix.length);
                        return !item.Key.endsWith('/') && 
                               !relativePath.includes('/') && 
                               /\.(jpg|jpeg|png)$/i.test(item.Key);
                    } else {
                        return !item.Key.endsWith('/') && 
                               /\.(jpg|jpeg|png)$/i.test(item.Key);
                    }
                })
                .map(item => ({
                    key: item.Key,
                    signedUrl: null,
                    thumbnailUrl: null
                }));

            createPaginationControls();
            await loadImagesForCurrentPage();

        } catch (error) {
            console.error('Error initializing gallery:', error);
            displayError('Error loading gallery: ' + error.message);
        }
    }

    async function loadImagesForCurrentPage() {
        if (isLoading) return;
        isLoading = true;
        updatePaginationControls();
        
        try {
            const gallery1 = document.getElementById('images-gallery');
            const gallery2 = document.getElementById('images-gallery2');
            
            // Fade out existing content
            gallery1.style.opacity = '0';
            if (gallery2) gallery2.style.opacity = '0';
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            gallery1.innerHTML = '';
            if (gallery2) gallery2.innerHTML = '';

            const startIndex = (currentPage - 1) * imagesPerGrid;
            const endIndex = startIndex + imagesPerGrid;
            const pageImages = allImages.slice(startIndex, endIndex);
            
            const s3Client = await getS3Client();
            
            const isWideLayout = window.innerWidth >= 1500;
            const firstGridImages = isWideLayout ? pageImages.slice(0, 4) : pageImages;
            const secondGridImages = isWideLayout ? pageImages.slice(4) : [];

            const layout = gridLayouts[Math.floor(Math.random() * gridLayouts.length)];

            // Setup grid layouts
            [gallery1, gallery2].forEach(gallery => {
                if (gallery) {
                    gallery.style.display = 'grid';
                    gallery.style.gridTemplateColumns = layout.columns;
                    gallery.style.gridTemplateRows = layout.rows;
                    gallery.style.gap = '1rem';
                    gallery.style.padding = '1rem';
                    gallery.style.width = '50vh';
                    gallery.style.height = 'calc(100vh - 100px)';
                }
            });

            // Load first grid
            await Promise.all(firstGridImages.map(async (image, index) => {
                await loadImageIntoGrid(image, index, layout, gallery1, s3Client, startIndex);
            }));

            // Load second grid if visible
            if (isWideLayout && gallery2) {
                await Promise.all(secondGridImages.map(async (image, index) => {
                    await loadImageIntoGrid(image, index, layout, gallery2, s3Client, startIndex + 4);
                }));
            }

            // Fade in content
            requestAnimationFrame(() => {
                gallery1.style.opacity = '1';
                if (gallery2) gallery2.style.opacity = isWideLayout ? '1' : '0';
            });

        } catch (error) {
            console.error('Error loading page:', error);
            displayError('Error loading images: ' + error.message);
        } finally {
            isLoading = false;
            updatePaginationControls();
        }
    }

    async function loadImageIntoGrid(image, index, layout, gallery, s3Client, startIndex) {
        try {
            if (!image.signedUrl) {
                image.signedUrl = await s3Client.getSignedUrlPromise('getObject', {
                    Bucket: S3_BUCKET,
                    Key: image.key,
                    Expires: URL_EXPIRATION
                });
            }

            const container = document.createElement('div');
            container.className = 'image-container';
            container.style.opacity = '0';
            container.style.transform = 'scale(0.95)';
            container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            container.style.transitionDelay = `${index * 0.15}s`;
            container.style.backgroundImage = `url(${image.signedUrl})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            container.style.backgroundRepeat = 'no-repeat';
            container.style.cursor = 'pointer';

            const areaName = `area${index + 1}`;
            if (layout.templates[areaName]) {
                container.style.gridArea = layout.templates[areaName];
            }

            container.addEventListener('click', (e) => {
                e.preventDefault();
                currentImageIndex = startIndex + index;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                isModalOpen = true;
                updateModalImage();
            });

            gallery.appendChild(container);

            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'scale(1)';
            });

        } catch (error) {
            console.error('Error loading image:', error);
            displayErrorImage(image.key);
        }
    }

    function createPaginationControls() {
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) {
            existingPagination.remove();
        }

        const totalPages = Math.ceil(allImages.length / imagesPerGrid);
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.style.margin = '0 0.5rem';
        prevButton.onclick = async () => {
            if (currentPage > 1 && !isLoading) {
                currentPage--;
                await loadImagesForCurrentPage();
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
            }
        };

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);

        const scrapbook = document.querySelector('.scrapbook');
        if (scrapbook) {
            scrapbook.appendChild(paginationContainer);
        }

        updatePaginationControls();
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(allImages.length / imagesPerGrid);
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        const pagination = document.querySelector('.pagination');
        if (pagination) {
            const [prevButton, _, nextButton] = pagination.children;
            prevButton.disabled = currentPage === 1 || isLoading;
            nextButton.disabled = currentPage === totalPages || isLoading;
            
            prevButton.style.opacity = prevButton.disabled ? '0.5' : '1';
            nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        }
    }

    function displayErrorImage(imageKey) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-container error';
        errorDiv.textContent = 'Failed to load image';
        const gallery = document.getElementById('images-gallery');
        gallery.appendChild(errorDiv);
    }

    // Add styles for the modal
    const modalStyles = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 1000;
        }

        .modal-content {
            position: relative;
            margin: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 20px;
        }

        .modal-img {
            max-width: 90%;
            max-height: 90vh;
            object-fit: contain;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
        }

        .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            padding: 16px;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            font-size: 24px;
            transition: background 0.3s;
            z-index: 1001;
        }

        .prev-btn {
            left: 25px;
        }

        .next-btn {
            right: 25px;
        }

        .nav-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);

    // Clean up observer when navigating away
    window.addEventListener('unload', () => {
        if (widthObserver) {
            widthObserver.disconnect();
        }
    });
}