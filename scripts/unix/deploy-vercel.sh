
#!/bin/bash

echo "==================================================="
echo "     DEPLOYING FILECHAT TO VERCEL"
echo "==================================================="
echo

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "[INFO] Vercel CLI is not installed, installing..."
    npm install -g vercel
    
    # Check if installation succeeded
    if ! command -v vercel &> /dev/null; then
        echo "[ERROR] Automatic installation failed, trying alternative method..."
        # Try with --force option
        npm install -g vercel --force
        
        # Check again
        if ! command -v vercel &> /dev/null; then
            echo "[ERROR] Failed to install Vercel CLI."
            echo "Try manually with: 'npm install -g vercel' or 'yarn global add vercel'"
            echo "Or use npx: use 'npx vercel' instead of 'vercel' in commands"
            
            # Ask user if they want to continue with npx
            read -p "Continue with npx vercel? (y/n): " use_npx
            if [ "$use_npx" != "y" ] && [ "$use_npx" != "Y" ]; then
                echo "Deployment cancelled."
                exit 1
            fi
            
            # If user wants to continue, use npx
            VERCEL_CMD="npx vercel"
        else
            echo "[OK] Vercel CLI installed successfully (alternative method)."
            VERCEL_CMD="vercel"
        fi
    else
        echo "[OK] Vercel CLI installed successfully."
        VERCEL_CMD="vercel"
    fi
else
    echo "[OK] Vercel CLI already installed."
    VERCEL_CMD="vercel"
fi

# Configuration for deployment
export NODE_ENV=production
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export SKIP_PYTHON_INSTALLATION=true

# Clean up previous build files
echo "[INFO] Cleaning up temporary files..."
rm -rf dist

# Install dependencies
echo "[INFO] Installing dependencies..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

# Build the project
echo "[STEP 2/5] Building the project..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed."
    exit 1
fi
echo "[OK] Build completed successfully."

# Configure Vercel headers for MIME types
echo "[STEP 3/5] Configuring headers for MIME types..."
node scripts/vercel-headers.js
if [ $? -ne 0 ]; then
    echo "[WARNING] Header configuration failed, but deployment will continue."
fi

# Check Vercel connection
echo "[STEP 4/5] Checking Vercel connection..."
$VERCEL_CMD whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "[INFO] You are not logged in to Vercel. Logging in..."
    $VERCEL_CMD login
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to log in to Vercel."
        exit 1
    fi
fi
echo "[OK] Connected to Vercel."

# Choose deployment type
echo "[STEP 5/5] Choose deployment type:"
echo "1. Preview deployment"
echo "2. Production deployment"
read -p "Your choice (1/2): " choice

if [ "$choice" = "1" ]; then
    echo "[INFO] Creating preview deployment..."
    $VERCEL_CMD
else
    echo "[INFO] Creating production deployment..."
    $VERCEL_CMD --prod
fi

if [ $? -ne 0 ]; then
    echo "[ERROR] Deployment failed."
    exit 1
fi
echo "[OK] Deployment completed successfully."

echo "==================================================="
echo "     DEPLOYMENT COMPLETE"
echo "==================================================="
echo
echo "Remember to configure environment variables"
echo "in the Vercel interface for advanced features."
echo
echo "Variables to configure:"
echo "- VITE_SUPABASE_URL: Your Supabase project URL"
echo "- VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo "- VITE_CLOUD_API_URL: Cloud API URL (optional)"
echo
echo "==================================================="
