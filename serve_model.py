
#!/usr/bin/env python

import os
import sys
import logging
import platform
import json

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

# Affichage des informations système
system_info = {
    "platform": platform.platform(),
    "python_version": platform.python_version(),
    "system": platform.system(),
    "machine": platform.machine(),
    "processor": platform.processor()
}
logger.info(f"Informations système: {json.dumps(system_info)}")

# Vérification des dépendances critiques
try:
    import fastapi
    import pydantic
    import uvicorn
except ImportError as e:
    logger.critical(f"Dépendances critiques manquantes: {e}")
    print(f"ERREUR: Dépendances critiques manquantes: {e}")
    print("Exécutez 'pip install fastapi uvicorn pydantic' pour installer les dépendances minimales.")
    print("\nLe serveur va démarrer en mode dégradé...\n")
    # Au lieu de quitter, on passe en mode dégradé
    DEGRADED_MODE = True
else:
    DEGRADED_MODE = False

# Vérification des dépendances optionnelles
try:
    import aiohttp
except ImportError:
    logger.warning("Package aiohttp manquant, installation...")
    try:
        os.system(f"{sys.executable} -m pip install aiohttp")
        import aiohttp
        logger.info("aiohttp installé avec succès")
    except:
        logger.warning("Échec de l'installation de aiohttp")

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
    # Mode dégradé: mini-serveur HTTP pour indiquer le statut
    if DEGRADED_MODE:
        try:
            from http.server import HTTPServer, BaseHTTPRequestHandler
            
            class SimpleHandler(BaseHTTPRequestHandler):
                def do_GET(self):
                    if self.path == "/health":
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "ok", "mode": "degraded"}).encode())
                    elif self.path == "/status":
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "status": "warning",
                            "model_status": "not_available",
                            "message": "Serveur en mode dégradé. Installation Python incomplète."
                        }).encode())
                    else:
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "error": "Serveur en mode dégradé. Veuillez installer les dépendances requises.",
                            "system_info": system_info
                        }).encode())
                
                def do_OPTIONS(self):
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()
                
                def do_POST(self):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "generated_text": "Le serveur est en mode dégradé. L'inférence de modèle n'est pas disponible. Utilisez le mode cloud à la place."
                    }).encode())
                    
            # Démarrage du serveur HTTP simple
            port = int(os.environ.get("PORT", 8000))
            server = HTTPServer(('0.0.0.0', port), SimpleHandler)
            logger.info(f"Serveur en mode dégradé démarré sur http://0.0.0.0:{port}")
            print(f"Serveur en mode dégradé démarré sur http://0.0.0.0:{port}")
            server.serve_forever()
            
        except Exception as e:
            logger.critical(f"Impossible de démarrer même en mode dégradé: {e}")
            sys.exit(1)
    else:
        # Mode normal avec FastAPI
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
