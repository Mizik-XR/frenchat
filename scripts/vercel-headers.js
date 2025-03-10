
/**
 * Script to configure MIME types in vercel.json
 * This script checks and updates the MIME header configuration in vercel.json
 */

const fs = require('fs');
const path = require('path');

// Path to vercel.json file
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

console.log('Checking MIME configuration in vercel.json...');

try {
  // Check if file exists
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('vercel.json file does not exist. Creating a basic configuration file...');
    
    // Create a basic configuration file
    const baseConfig = {
      "version": 2,
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "routes": [
        { "src": "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$", "headers": { "cache-control": "public, max-age=31536000, immutable" }, "continue": true },
        { "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico))$", "headers": { "cache-control": "public, max-age=31536000, immutable" }, "dest": "/$1" },
        { "src": "/api/(.*)", "dest": "/api/$1" },
        { "src": "/(.*)", "dest": "/index.html" }
      ],
      "headers": [
        {
          "source": "/(.*)\\.js$",
          "headers": [
            {
              "key": "Content-Type",
              "value": "application/javascript; charset=utf-8"
            }
          ]
        },
        {
          "source": "/(.*)\\.css$",
          "headers": [
            {
              "key": "Content-Type",
              "value": "text/css; charset=utf-8"
            }
          ]
        },
        {
          "source": "/(.*)\\.html$",
          "headers": [
            {
              "key": "Content-Type",
              "value": "text/html; charset=utf-8"
            }
          ]
        }
      ]
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(baseConfig, null, 2));
    console.log('vercel.json file created successfully.');
    process.exit(0);
  }

  // Read existing file
  const configContent = fs.readFileSync(vercelConfigPath, 'utf8');
  let config;

  try {
    config = JSON.parse(configContent);
  } catch (parseError) {
    console.error('Error parsing vercel.json file:', parseError);
    process.exit(1);
  }

  let modified = false;

  // Check and add headers section if it doesn't exist
  if (!config.headers) {
    config.headers = [];
    modified = true;
  }

  // Check entries for JavaScript
  const jsHeaderEntry = config.headers.find(h => h.source === "/(.*)\\.js$");
  if (!jsHeaderEntry) {
    config.headers.push({
      "source": "/(.*)\\.js$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    });
    modified = true;
  }

  // Check entries for CSS
  const cssHeaderEntry = config.headers.find(h => h.source === "/(.*)\\.css$");
  if (!cssHeaderEntry) {
    config.headers.push({
      "source": "/(.*)\\.css$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    });
    modified = true;
  }

  // Check entries for HTML
  const htmlHeaderEntry = config.headers.find(h => h.source === "/(.*)\\.html$");
  if (!htmlHeaderEntry) {
    config.headers.push({
      "source": "/(.*)\\.html$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/html; charset=utf-8"
        }
      ]
    });
    modified = true;
  }

  // Check routes for assets
  if (!config.routes) {
    config.routes = [];
    modified = true;
  }

  const assetsRouteEntry = config.routes.find(r => r.src === "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$");
  if (!assetsRouteEntry) {
    config.routes.unshift({ 
      "src": "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$", 
      "headers": { 
        "cache-control": "public, max-age=31536000, immutable" 
      }, 
      "continue": true 
    });
    modified = true;
  }

  // Save changes if needed
  if (modified) {
    fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
    console.log('MIME configuration updated in vercel.json.');
  } else {
    console.log('MIME configuration is already correctly set up.');
  }

  console.log('Check completed successfully.');
  process.exit(0);
} catch (error) {
  console.error('Error checking/updating MIME configuration:', error);
  process.exit(1);
}
