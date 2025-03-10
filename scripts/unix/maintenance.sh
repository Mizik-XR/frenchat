
#!/bin/bash

clear
echo "==================================================="
echo "     FILECHAT MAINTENANCE"
echo "==================================================="
echo ""
echo "[1] Cache cleanup"
echo "[2] Rebuild application"
echo "[3] Environment check"
echo "[4] Fix common issues"
echo "[5] Exit"
echo ""
read -p "Your choice [1-5]: " CHOICE

case $CHOICE in
    1)
        clear
        echo "==================================================="
        echo "     CACHE CLEANUP"
        echo "==================================================="
        echo ""
        echo "[INFO] Removing caches..."
        if [ -d ".vite" ]; then
            rm -rf .vite
            echo "[OK] Vite cache deleted."
        fi
        if [ -d "node_modules/.vite" ]; then
            rm -rf node_modules/.vite
            echo "[OK] Vite cache in node_modules deleted."
        fi
        npm cache clean --force
        echo "[OK] NPM cache cleaned."
        echo ""
        read -p "Press Enter to continue..." -n1 -s
        ;;
    2)
        clear
        echo "==================================================="
        echo "     REBUILDING APPLICATION"
        echo "==================================================="
        echo ""
        echo "[INFO] Building application..."
        export NODE_OPTIONS="--max-old-space-size=4096"
        npm run build
        if [ $? -ne 0 ]; then
            echo "[ERROR] Build failed."
            read -p "Press Enter to continue..." -n1 -s
            exit 1
        fi
        echo "[OK] Application rebuilt successfully."
        echo ""
        read -p "Press Enter to continue..." -n1 -s
        ;;
    3)
        clear
        echo "==================================================="
        echo "     ENVIRONMENT CHECK"
        echo "==================================================="
        echo ""
        echo "[INFO] Checking Node.js..."
        node -v
        echo "[INFO] Checking NPM..."
        npm -v
        echo "[INFO] Checking Python..."
        python --version 2>/dev/null || python3 --version
        echo ""
        if [ -f ".env.local" ]; then
            echo "[INFO] .env.local file detected."
        else
            echo "[INFO] Creating .env.local file..."
            cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_SITE_URL=http://localhost:8080
VITE_LOVABLE_VERSION=dev
FORCE_CLOUD_MODE=true
EOF
            echo "[OK] .env.local file created."
        fi
        echo ""
        read -p "Press Enter to continue..." -n1 -s
        ;;
    4)
        clear
        echo "==================================================="
        echo "     FIXING COMMON ISSUES"
        echo "==================================================="
        echo ""
        echo "[INFO] Checking dependencies..."
        npm install
        echo "[INFO] Configuring cloud mode..."
        echo "FORCE_CLOUD_MODE=true" > .env.local
        echo "VITE_DISABLE_DEV_MODE=true" >> .env.local
        echo "[INFO] Rebuilding application..."
        export NODE_OPTIONS="--max-old-space-size=4096"
        npm run build
        echo ""
        echo "[INFO] Checking Lovable script..."
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "[INFO] Adding Lovable script..."
            sed -i.bak '/<script type="module" crossorigin/i \    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' dist/index.html
            rm -f dist/index.html.bak
            echo "[OK] Lovable script added."
        else
            echo "[OK] Lovable script already present."
        fi
        echo ""
        echo "[OK] Repairs completed."
        read -p "Press Enter to continue..." -n1 -s
        ;;
    5)
        exit 0
        ;;
    *)
        echo ""
        echo "Invalid choice. Please try again."
        sleep 2
        source $0
        ;;
esac

exit 0
