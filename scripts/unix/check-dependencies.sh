
#!/bin/bash

# Fonction d'installation de Python si nécessaire
install_python() {
    echo "[INFO] Python non détecté, tentative d'installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Veuillez installer Python depuis https://www.python.org/downloads/"
        echo "Ou utilisez Homebrew: brew install python3"
        return 1
    elif [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    elif [[ -f /etc/redhat-release ]]; then
        # RHEL/CentOS/Fedora
        sudo dnf install -y python3 python3-pip
    else
        echo "Distribution non reconnue. Veuillez installer Python manuellement."
        return 1
    fi
    return 0
}

# Vérification de Python
echo "[INFO] Vérification de Python..."
if ! command -v python3 &> /dev/null
then
    install_python
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Python 3 n'a pas pu être installé."
        echo ""
        echo "Appuyez sur une touche pour quitter..."
        read -n 1
        exit 1
    fi
fi

echo "[OK] Python détecté: $(python3 --version)"
echo ""
