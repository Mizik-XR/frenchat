
#!/bin/bash

echo "==================================================="
echo "     FIXING LOVABLE INTEGRATION"
echo "==================================================="
echo
echo "This tool will fix issues with Lovable editing."
echo

echo "[STEP 1/3] Checking index.html file..."
if [ -f "index.html" ]; then
    echo "[INFO] Checking for gptengineer.js script..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[WARNING] Lovable script is missing in index.html, fixing..."
        
        # Backup original file
        cp index.html index.html.backup
        
        # Add missing script after the first script detected
        awk '/<script /{print; print "    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>"; next}1' index.html > index.html.temp
        
        mv index.html.temp index.html
        echo "[OK] gptengineer.js script added to index.html."
    else
        echo "[OK] gptengineer.js script is already present in index.html."
    fi
else
    echo "[ERROR] index.html file is missing in the root directory."
    exit 1
fi
echo

echo "[STEP 2/3] Rebuilding application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Application rebuild failed."
    exit 1
else
    echo "[OK] Application rebuilt successfully."
fi
echo

echo "[STEP 3/3] Final verification..."
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
echo
chmod +x fix-lovable.sh
echo "The script is now executable with ./fix-lovable.sh"
exit 0
