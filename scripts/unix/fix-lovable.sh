
#!/bin/bash

echo "==================================================="
echo "     UPDATING LOVABLE INTEGRATION"
echo "==================================================="
echo
echo "This tool will update Lovable integration with the latest features."
echo

echo "[STEP 1/4] Checking for lovable-tagger..."
if ! npm list lovable-tagger > /dev/null 2>&1; then
    echo "[INFO] Installing lovable-tagger..."
    npm install --save-dev lovable-tagger
    echo "[OK] lovable-tagger installed successfully."
else
    echo "[OK] lovable-tagger is already installed."
fi
echo

echo "[STEP 2/4] Checking Vite configuration..."
if ! grep -q "componentTagger" "vite.config.ts"; then
    echo "[WARNING] componentTagger not found in vite.config.ts, updating..."
    
    # Backup original file
    cp vite.config.ts vite.config.ts.backup
    
    # Update vite.config.ts
    sed -i 's/import react from "@vitejs\/plugin-react";/import react from "@vitejs\/plugin-react";\nimport { componentTagger } from "lovable-tagger";/' vite.config.ts
    sed -i 's/plugins: \[/plugins: \[\n    mode === "development" \&\& componentTagger(),/' vite.config.ts
    
    echo "[OK] vite.config.ts updated successfully."
else
    echo "[OK] vite.config.ts already has componentTagger configuration."
fi
echo

echo "[STEP 3/4] Checking index.html file..."
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

echo "[STEP 4/4] Rebuilding application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Application rebuild failed."
    exit 1
else
    echo "[OK] Application rebuilt successfully with Lovable updates."
fi
echo

echo "==================================================="
echo "     LOVABLE UPDATE COMPLETED"
echo "==================================================="
echo
echo "Your project has been updated with the latest Lovable features!"
echo
echo "New capabilities include:"
echo "1. Component tagging for improved editing"
echo "2. Better hot reloading and state preservation"
echo "3. Enhanced Lovable environment detection"
echo
echo "To activate these features:"
echo "1. Restart your development server"
echo "2. Clear your browser cache or use incognito mode"
echo
chmod +x scripts/unix/fix-lovable.sh
echo "This script is now executable with ./scripts/unix/fix-lovable.sh"
exit 0
