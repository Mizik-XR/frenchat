
#!/bin/bash

clear
echo "==================================================="
echo "     FILECHAT - LAUNCHER"
echo "==================================================="
echo ""
echo "Choose a startup mode:"
echo ""
echo "[1] Full mode (Local AI + web interface)"
echo "[2] Cloud mode only (without local AI)"
echo "[3] Maintenance (cleanup, repair)"
echo "[4] Exit"
echo ""
read -p "Your choice [1-4]: " CHOICE

case $CHOICE in
    1)
        bash scripts/unix/start-app.sh
        ;;
    2)
        bash scripts/unix/cloud-mode.sh
        ;;
    3)
        bash scripts/unix/maintenance.sh
        ;;
    4)
        exit 0
        ;;
    *)
        echo ""
        echo "Invalid choice. Please try again."
        sleep 2
        bash $0
        ;;
esac

exit 0
