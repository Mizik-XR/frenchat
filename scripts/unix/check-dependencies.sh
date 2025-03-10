
#!/bin/bash

# Function to install Python if needed
install_python() {
    echo "[INFO] Python not detected, attempting installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Please install Python from https://www.python.org/downloads/"
        echo "Or use Homebrew: brew install python3"
        return 1
    elif [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    elif [[ -f /etc/redhat-release ]]; then
        # RHEL/CentOS/Fedora
        sudo dnf install -y python3 python3-pip
    else
        echo "Unrecognized distribution. Please install Python manually."
        return 1
    fi
    return 0
}

# Check Python
echo "[INFO] Checking Python..."
if ! command -v python3 &> /dev/null
then
    install_python
    if [ $? -ne 0 ]; then
        echo "[ERROR] Python 3 could not be installed."
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
fi

echo "[OK] Python detected: $(python3 --version)"
echo ""
