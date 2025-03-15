
#!/bin/bash

clear
echo "==================================================="
echo "     FILECHAT - LANCEUR"
echo "==================================================="
echo ""
echo "Choisissez un mode de démarrage:"
echo ""
echo "[1] Mode complet (IA locale + interface web)"
echo "[2] Mode cloud uniquement (sans IA locale)"
echo "[3] Maintenance (nettoyage, réparation)"
echo "[4] Quitter"
echo ""
read -p "Votre choix [1-4]: " CHOICE

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
        echo "Choix invalide. Veuillez réessayer."
        sleep 2
        bash $0
        ;;
esac

exit 0
