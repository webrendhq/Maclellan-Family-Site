// config.js
function loadEnvVariables() {
    const envScript = document.getElementById('env-variables');
    if (envScript) {
        const env = JSON.parse(envScript.textContent);
        Object.keys(env).forEach(key => {
            window.process = window.process || {};
            window.process.env = window.process.env || {};
            window.process.env[key] = env[key];
        });
    }
}

// Load environment variables when the script loads
loadEnvVariables();

export const config = {
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    },
    aws: {
        s3Bucket: process.env.AWS_S3_BUCKET || 'maclellanfamily.com',
        s3Region: process.env.AWS_S3_REGION || 'us-east-2',
        baseFolder: process.env.AWS_BASE_FOLDER || '0 US',
        urlExpiration: parseInt(process.env.URL_EXPIRATION) || 3600,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    }
};