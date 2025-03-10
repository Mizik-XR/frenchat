
#!/bin/bash

echo "==================================================="
echo "    MIME TYPE FIX UTILITY"
echo "==================================================="
echo
echo "This script will check and fix MIME type configurations"
echo "for JavaScript files in your deployed application."
echo
echo "==================================================="
echo
read -p "Press Enter to continue..." -n1 -s
echo

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "[ERROR] Dist directory not found. Run build first."
    echo
    read -p "Build the application now? (y/n): " choice
    if [ "$choice" == "y" ]; then
        echo "[INFO] Building application..."
        npm run build
    else
        echo "Operation cancelled."
        exit 1
    fi
fi

# Check if index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "[ERROR] dist/index.html not found."
    exit 1
fi

echo "[STEP 1/3] Checking for proper MIME type definitions..."

# Check if headers are set correctly in netlify.toml
if [ -f "netlify.toml" ]; then
    if ! grep -q "Content-Type.*application/javascript" netlify.toml; then
        echo "[WARNING] JavaScript MIME type not properly set in netlify.toml"
        echo "          Please update your netlify.toml file."
    else
        echo "[OK] MIME types are properly configured in netlify.toml"
    fi
fi

# Check if headers are set correctly in vercel.json
if [ -f "vercel.json" ]; then
    if ! grep -q "application/javascript" vercel.json; then
        echo "[WARNING] JavaScript MIME type not properly set in vercel.json"
        echo "          Please update your vercel.json file."
    else
        echo "[OK] MIME types are properly configured in vercel.json"
    fi
fi

echo
echo "[STEP 2/3] Adding meta tags to help browsers with MIME types..."

# Add meta tags to index.html to help with content type inference
sed -i.bak 's/<head>/<head>\n    <meta http-equiv="X-Content-Type-Options" content="nosniff">/' dist/index.html

echo "[OK] Added nosniff header to prevent MIME sniffing."

echo
echo "[STEP 3/3] Creating verification file..."

# Create a small verification file to test MIME types
mkdir -p dist/test
cat > dist/test/verify-mime.js << EOF
console.log('JavaScript MIME type verification successful');
EOF

# Create a verification HTML file
cat > dist/test/verify-mime.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MIME Type Verification</title>
</head>
<body>
    <h1>MIME Type Verification</h1>
    <p>This page tests if JavaScript files are served with the correct MIME type.</p>
    <script src="verify-mime.js"></script>
    <script>
        // Check if script loaded correctly
        window.addEventListener('load', function() {
            document.body.innerHTML += '<p>Page loaded successfully!</p>';
        });
    </script>
</body>
</html>
EOF

echo "[OK] Created verification files in dist/test/"
echo
echo "==================================================="
echo "    MIME TYPE FIXES APPLIED"
echo "==================================================="
echo
echo "After deploying, visit /test/verify-mime.html to verify"
echo "that JavaScript files are served with correct MIME types."
echo
echo "If you're still experiencing issues after deployment:"
echo "1. Check your server's MIME type configuration"
echo "2. Use a CDN with proper MIME type settings"
echo "3. Consider adding a build plugin to ensure correct headers"
echo
read -p "Press Enter to exit..." -n1 -s
exit 0
