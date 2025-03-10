
#!/bin/bash

# Check NPM dependencies
echo "[INFO] Checking NPM dependencies..."
if [ ! -d "node_modules" ]
then
    echo "[INFO] Installing NPM dependencies..."
    
    # Check if npm is available
    if ! command -v npm &> /dev/null
    then
        echo "[ERROR] npm is not installed or not in the PATH"
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    
    # Check vulnerabilities before installation
    echo "[INFO] Checking vulnerabilities..."
    npm audit --production
    
    # Installation with limited script privileges
    npm install --no-fund --audit=true --ignore-scripts=false
    
    if [ $? -ne 0 ]
    then
        echo "[ERROR] NPM dependencies installation failed"
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    
    echo "[OK] NPM dependencies installed successfully"
    
    # Check vulnerabilities again after installation
    echo "[INFO] Final vulnerability check..."
    npm audit --production
    echo ""
fi
