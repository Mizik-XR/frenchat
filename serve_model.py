
#!/usr/bin/env python

import os
import sys
import uvicorn
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

# Vérification des dépendances critiques
try:
    import fastapi
    import pydantic
except ImportError as e:
    logger.critical(f"Dépendances critiques manquantes: {e}")
    print(f"ERREUR FATALE: Dépendances critiques manquantes: {e}")
    print("Exécutez 'pip install fastapi uvicorn pydantic' pour installer les dépendances minimales.")
    sys.exit(1)

# Vérification des dépendances optionnelles
try:
    import aiohttp
except ImportError:
    logger.warning("Package aiohttp manquant, installation...")
    os.system(f"{sys.executable} -m pip install aiohttp")

# Vérification de psutil
try:
    import psutil
    PSUTIL_AVAILABLE = True
    logger.info("psutil détecté avec succès")
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("Package psutil manquant, tentative d'installation...")
    try:
        os.system(f"{sys.executable} -m pip install psutil")
        import psutil
        PSUTIL_AVAILABLE = True
        logger.info("psutil installé avec succès")
    except:
        logger.warning("Échec de l'installation de psutil, l'analyse des ressources sera limitée")

if __name__ == "__main__":
    # Importer notre application
    from server.routes import init_app
    
    # Configuration de l'hôte et du port
    host = "0.0.0.0"  # Écoute sur toutes les interfaces
    port = int(os.environ.get("PORT", 8000))
    
    # Mode d'exécution (léger ou complet)
    mode = "léger" if os.environ.get("NO_RUST_INSTALL", "0") == "1" else "complet"
    logger.info(f"Démarrage du serveur sur http://{host}:{port} (Mode {mode})")
    
    # Initialiser l'application
    app = init_app()
    
    # Démarrage du serveur
    uvicorn.run(app, host=host, port=port, log_level="info")
