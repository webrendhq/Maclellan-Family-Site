import { refreshDropboxAccessToken, accessToken } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/dropbox-auth.js';
import { auth, onAuthStateChanged } from 'https://maclellan-family-website.s3.us-east-2.amazonaws.com/firebase-init.js';
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // No user is signed in, redirect to the sign-in page.
        window.location.href = '/sign-in.html';
    }
    // If a user is signed in, do nothing and allow access to the current page.
});

const CACHE_KEY = 'dropboxImageCache';
const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds



async function fetchRandomImage() {
    await refreshDropboxAccessToken();
    
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path: '', // Specify your Dropbox folder path here
            recursive: false
        })
    });

    const data = await response.json();
    const images = data.entries.filter(entry => entry.name.match(/\.(jpg|jpeg|png|gif)$/i));
    const randomImage = images[Math.floor(Math.random() * images.length)];

    return randomImage;
}

async function displayRandomImage() {
    const cachedImage = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_KEY + '_timestamp');
    const currentTime = new Date().getTime();

    let imageData;

    if (cachedImage && cachedTimestamp && (currentTime - parseInt(cachedTimestamp) < ONE_DAY)) {
        imageData = JSON.parse(cachedImage);
    } else {
        imageData = await fetchRandomImage();
        localStorage.setItem(CACHE_KEY, JSON.stringify(imageData));
        localStorage.setItem(CACHE_KEY + '_timestamp', currentTime.toString());
    }

    const imgContainer = document.getElementById('random-picture');
    const img = document.createElement('img');
    img.alt = imageData.name;
    img.loading = 'lazy';
    img.decoding = 'async';

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchImageUrl(imageData.path_lower).then(url => {
                    img.src = url;
                    observer.unobserve(img);
                });
            }
        });
    });

    imgContainer.appendChild(img);
    observer.observe(img);
}

async function fetchImageUrl(path) {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({path: path})
        }
    });

    return URL.createObjectURL(await response.blob());
}

displayRandomImage();

// Update image daily
setInterval(displayRandomImage, ONE_DAY);