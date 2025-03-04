
#!/usr/bin/env python

import os
import sys
import logging
import platform
import json
import secrets

# Configuration du logging sécurisé
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("serve_model")

# Génération d'un jeton de sécurité pour les requêtes
API_TOKEN = os.environ.get("API_TOKEN") or secrets.token_hex(16)
logger.info(f"Token d'API généré: {API_TOKEN}")

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
        os.system(f"{sys.executable} -m pip install aiohttp>=3.9.5")
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
        os.system(f"{sys.executable} -m pip install psutil>=5.9.8")
        import psutil
        PSUTIL_AVAILABLE = True
        logger.info("psutil installé avec succès")
    except:
        logger.warning("Échec de l'installation de psutil, l'analyse des ressources sera limitée")

# Implémentation du middleware de sécurité pour FastAPI
def setup_security_middleware(app):
    """Configurer des middlewares de sécurité pour l'application FastAPI"""
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    
    # Configuration CORS restrictive
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        max_age=600  # 10 minutes
    )
    
    # Limiter aux hôtes de confiance
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["localhost", "127.0.0.1"]
    )
    
    # Middleware d'authentification
    @app.middleware("http")
    async def validate_token(request, call_next):
        from fastapi.responses import JSONResponse
        
        # Vérifier le token pour les endpoints protégés
        if request.url.path.startswith(("/generate", "/model")):
            token = request.headers.get("X-API-Token")
            if not token or token != API_TOKEN:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Accès non autorisé"}
                )
        
        return await call_next(request)
    
    return app

if __name__ == "__main__":
    # Mode dégradé: mini-serveur HTTP pour indiquer le statut
    if DEGRADED_MODE:
        try:
            from http.server import HTTPServer, BaseHTTPRequestHandler
            import ssl
            
            class SimpleHandler(BaseHTTPRequestHandler):
                def do_GET(self):
                    if self.path == "/health":
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "ok", "mode": "degraded"}).encode())
                    elif self.path == "/status":
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "status": "warning",
                            "model_status": "not_available",
                            "message": "Serveur en mode dégradé. Installation Python incomplète."
                        }).encode())
                    else:
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "error": "Serveur en mode dégradé. Veuillez installer les dépendances requises.",
                            "system_info": system_info
                        }).encode())
                
                def do_OPTIONS(self):
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Token')
                    self.end_headers()
                
                def do_POST(self):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', 'http://localhost:8080')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "generated_text": "Le serveur est en mode dégradé. L'inférence de modèle n'est pas disponible. Utilisez le mode cloud à la place."
                    }).encode())
                    
            # Démarrage du serveur HTTP simple
            port = int(os.environ.get("PORT", 8000))
            server = HTTPServer(('127.0.0.1', port), SimpleHandler)
            
            logger.info(f"Serveur en mode dégradé démarré sur http://127.0.0.1:{port}")
            print(f"Serveur en mode dégradé démarré sur http://127.0.0.1:{port}")
            server.serve_forever()
            
        except Exception as e:
            logger.critical(f"Impossible de démarrer même en mode dégradé: {e}")
            sys.exit(1)
    else:
        # Mode normal avec FastAPI
        from fastapi import FastAPI
        from server.routes import init_app
        
        # Configuration de l'hôte et du port
        host = "127.0.0.1"  # Écoute sur localhost uniquement pour plus de sécurité
        port = int(os.environ.get("PORT", 8000))
        
        # Mode d'exécution (léger ou complet)
        mode = "léger" if os.environ.get("NO_RUST_INSTALL", "0") == "1" else "complet"
        logger.info(f"Démarrage du serveur sur http://{host}:{port} (Mode {mode})")
        
        # Initialiser l'application
        app = init_app()
        
        # Ajouter les middlewares de sécurité
        app = setup_security_middleware(app)
        
        # Démarrage du serveur
        uvicorn.run(
            app, 
            host=host, 
            port=port, 
            log_level="info",
            proxy_headers=True,
            forwarded_allow_ips="127.0.0.1",
            timeout_keep_alive=60
        )
