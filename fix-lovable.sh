
#!/bin/bash

echo "==================================================="
echo "     FIXING LOVABLE INTEGRATION"
echo "==================================================="
echo
echo "This tool will fix issues with Lovable editing."
echo

echo "[STEP 1/4] Checking index.html file..."
if [ -f "index.html" ]; then
    echo "[INFO] Checking for gptengineer.js script..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[WARNING] Lovable script is missing in index.html, fixing..."
        
        # Backup original file
        cp index.html index.html.backup
        
        # Add missing script at beginning of head
        sed -i 's/<head>/<head>\n    <script src="https:\/\/cdn.gpteng.co\/gptengineer.js"><\/script>/' index.html
        
        echo "[OK] gptengineer.js script added to index.html."
    else
        echo "[INFO] Checking if type=\"module\" needs to be removed..."
        if grep -q '<script src="https://cdn.gpteng.co/gptengineer.js" type="module">' "index.html"; then
            echo "[WARNING] Found type=\"module\" attribute, removing it..."
            
            # Backup original file
            cp index.html index.html.backup
            
            # Remove type="module" attribute
            sed -i 's/<script src="https:\/\/cdn.gpteng.co\/gptengineer.js" type="module">/<script src="https:\/\/cdn.gpteng.co\/gptengineer.js">/' index.html
            
            echo "[OK] type=\"module\" attribute removed from gptengineer.js script."
        else
            echo "[OK] gptengineer.js script is correctly configured in index.html."
        fi
    fi
else
    echo "[ERROR] index.html file is missing in the root directory."
    exit 1
fi
echo

echo "[STEP 2/4] Clearing browser cache instructions..."
echo "[INFO] Please perform these steps in your browser:"
echo "  1. Open browser developer tools (F12 or right-click > Inspect)"
echo "  2. Go to Application/Storage tab"
echo "  3. Check 'Disable cache' option" 
echo "  4. Clear site data or use incognito mode for testing"
echo

echo "[STEP 3/4] Rebuilding application..."
npm run build --force
if [ $? -ne 0 ]; then
    echo "[ERROR] Application rebuild failed."
    exit 1
else
    echo "[OK] Application rebuilt successfully."
fi
echo

echo "[STEP 4/4] Final verification..."
if [ -f "dist/index.html" ]; then
    echo "[INFO] Checking dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[WARNING] gptengineer.js script is missing from dist/index.html."
        echo "            Applying manual fix..."
        cp -f index.html dist/index.html
        echo "[OK] Fix applied."
    else
        echo "[OK] dist/index.html contains the required script."
    fi
else
    echo "[INFO] dist folder doesn't exist yet."
fi
echo

echo "==================================================="
echo "     FIX COMPLETED"
echo "==================================================="
echo
echo "To apply changes:"
echo "1. Restart the application"
echo "2. Clear your browser cache or use incognito mode"
echo "3. Try a different browser (Chrome or Edge recommended)"
echo
chmod +x fix-lovable.sh
exit 0
