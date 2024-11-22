// env-loader.js
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

function injectEnvVariables(htmlContent) {
    // Load environment variables from .env file
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    
    // Create a script tag with environment variables
    const envScript = `
        <script id="env-variables" type="application/json">
            ${JSON.stringify(envConfig)}
        </script>
    `;
    
    // Insert the script tag before the closing head tag
    return htmlContent.replace('</head>', `${envScript}</head>`);
}

// Process HTML files
['index.html', 'main.html', 'events.html', 'images.html'].forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const processedContent = injectEnvVariables(htmlContent);
        fs.writeFileSync(filePath, processedContent);
    }
});