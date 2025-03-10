
#!/bin/bash

echo "==================================================="
echo "    PREPARING NETLIFY DEPLOYMENT"
echo "==================================================="
echo

# Configuration for deployment without Rust/Python
export NO_RUST_INSTALL=1
export TRANSFORMERS_OFFLINE=1
export SKIP_PYTHON_INSTALLATION=true
export NODE_ENV=production
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false

# Check if requirements.txt exists and modify it
if [ -f "requirements.txt" ]; then
    echo "[INFO] Creating minimal requirements.txt for Netlify..."
    # Create simplified version of requirements.txt without dependencies requiring Rust
    cat > requirements.txt.netlify << EOF
# Simplified version for Netlify (without Rust compilation)
fastapi==0.110.0
uvicorn==0.28.0
pydantic>=2.0.0
aiohttp>=3.8.0
# Packages requiring Rust are commented out
# tokenizers
# transformers
EOF
    mv requirements.txt.netlify requirements.txt
    echo "[OK] Simplified requirements.txt file created."
fi

echo "[INFO] Preparation complete. Environment variables configured for Netlify."
echo "==================================================="
