
#!/bin/bash

# Check if dist directory exists, otherwise build the application
if [ ! -d "dist" ]; then
    echo "[INFO] Building web application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERROR] Application build failed"
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    echo "[OK] Application built successfully"
    echo ""
fi
