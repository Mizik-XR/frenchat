
#!/bin/bash

echo "==================================================="
echo "    FILECHAT DEPLOYMENT TO NETLIFY"
echo "==================================================="
echo
echo "This script will deploy FileChat to Netlify."
echo "Make sure you have installed the Netlify CLI and"
echo "are logged in to your Netlify account."
echo
echo "Steps:"
echo "1. Environment verification"
echo "2. Build preparation for deployment"
echo "3. Deployment to Netlify"
echo
echo "==================================================="
echo
read -p "Press Enter to continue..." -n1 -s
echo

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "[INFO] Netlify CLI is not installed, installing..."
    npm install -g netlify-cli
    if [ $? -ne 0 ]; then
        echo "[ERROR] Netlify CLI installation failed."
        echo
        echo "To install manually, run:"
        echo "npm install -g netlify-cli"
        echo
        read -p "Press Enter to exit..." -n1 -s
        exit 1
    fi
    echo "[OK] Netlify CLI installed successfully."
fi

# Disable Rust installation for deployment
export NO_RUST_INSTALL=1
export NETLIFY_SKIP_PYTHON=true
export TRANSFORMERS_OFFLINE=1
export NODE_ENV=production

# Clean unnecessary files
echo "[INFO] Cleaning temporary files..."
if [ -d "dist" ]; then
    rm -rf dist
fi
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi

# Optimized installation for Netlify
echo "[INFO] Installing dependencies with configuration for Netlify..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

# Prepare the build
echo "[STEP 2/3] Preparing build for deployment..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Project build failed."
    echo
    read -p "Press Enter to exit..." -n1 -s
    exit 1
fi
echo "[OK] Build ready for deployment."
echo

# Check Netlify connection
echo "[STEP 3/3] Checking Netlify connection..."
netlify status > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[INFO] You are not connected to Netlify."
    echo "[INFO] Connecting to Netlify..."
    netlify login
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to connect to Netlify."
        echo
        read -p "Press Enter to exit..." -n1 -s
        exit 1
    fi
fi
echo "[OK] Connected to Netlify."
echo

# Deploy to Netlify
echo "[INFO] Would you like to:"
echo "1. Deploy a preview"
echo "2. Deploy to production"
read -p "Choose an option (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "[INFO] Deploying a preview..."
    netlify deploy --dir=dist
else
    echo "[INFO] Deploying to production..."
    netlify deploy --prod --dir=dist
fi

if [ $? -ne 0 ]; then
    echo "[ERROR] Deployment failed."
    echo
    read -p "Press Enter to exit..." -n1 -s
    exit 1
fi
echo "[OK] Deployment completed successfully."
echo

echo "==================================================="
echo "     DEPLOYMENT COMPLETED"
echo "==================================================="
echo
echo "Remember to configure environment variables"
echo "in the Netlify interface for advanced features."
echo
echo "Variables to configure:"
echo "- VITE_SUPABASE_URL: Your Supabase project URL"
echo "- VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo "- VITE_CLOUD_API_URL: Cloud API URL (optional)"
echo
echo "==================================================="
echo
echo "You can now share the deployment link with your client."
echo
read -p "Press Enter to continue..." -n1 -s
exit 0
