
#!/bin/bash

echo "==================================================="
echo "    FILECHAT DEPLOYMENT PREPARATION"
echo "==================================================="
echo
echo "This procedure will prepare the project for deployment:"
echo " 1. Configuration files verification"
echo " 2. Build optimization"
echo " 3. Pre-deployment tests"
echo
echo "==================================================="
echo
read -p "Press Enter to continue..." -n1 -s
echo

# Clean unnecessary files
echo "[STEP 1/4] Cleaning temporary files..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dist folder successfully deleted."
else
    echo "[INFO] Dist folder does not exist, step skipped."
fi
echo

# Configuration for deployment
export NODE_ENV=production

# Verify and prepare configuration files
echo "[STEP 2/4] Checking configuration files..."
if [ ! -f "vercel.json" ]; then
    echo "[ERROR] vercel.json file is missing."
    echo "         Run the configuration generation script."
    echo
    read -p "Press Enter to exit..." -n1 -s
    exit 1
fi

# Build optimization
echo "[STEP 3/4] Optimizing and building the project..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimized installation for deployment
echo "[INFO] Installing dependencies with optimized configuration..."
npm install --prefer-offline --no-audit --no-fund --loglevel=error --progress=false

npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Project build failed."
    echo
    read -p "Press Enter to exit..." -n1 -s
    exit 1
fi
echo "[OK] Project built successfully."
echo

# Post-build verification
echo "[STEP 4/4] Checking deployment files..."
if [ ! -f "dist/index.html" ]; then
    echo "[ERROR] dist/index.html file is missing."
    echo
    read -p "Press Enter to exit..." -n1 -s
    exit 1
fi

# Check for absolute paths in index.html
if grep -q "href=\"/assets" "dist/index.html" || grep -q "src=\"/assets" "dist/index.html"; then
    echo "[WARNING] Absolute paths detected in index.html, converting to relative paths..."
    sed -i.bak 's|href="/assets|href="./assets|g' dist/index.html
    sed -i.bak 's|src="/assets|src="./assets|g' dist/index.html
    rm -f dist/index.html.bak
    echo "[OK] Paths converted successfully."
fi

echo
echo "==================================================="
echo "    DEPLOYMENT PREPARATION COMPLETED"
echo "==================================================="
echo
echo "Your project is ready to be deployed!"
echo
echo "You can now:"
echo " 1. Deploy to Vercel by connecting your GitHub repository"
echo " 2. Deploy via Vercel CLI: vercel deploy"
echo " 3. Use drag-and-drop of the 'dist' folder on the Vercel interface"
echo
echo "Make sure to configure environment variables in the Vercel interface."
echo
read -p "Press Enter to continue..." -n1 -s
exit 0
