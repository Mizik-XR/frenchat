
=================================================
PASSERELLE FILECHAT - MODE HYBRIDE
=================================================

FileChat peut maintenant fonctionner en mode "passerelle" (ou mode hybride),
qui lui permet de basculer automatiquement entre les modèles IA locaux et cloud
selon la disponibilité des services.

1. COMMENT ÇA FONCTIONNE
------------------------
Le mode hybride détecte automatiquement:
- La disponibilité du service local (soit via Ollama, soit via le serveur Python)
- Les performances du réseau et de l'appareil
- Les erreurs survenant pendant l'exécution

Si une requête échoue avec le service local, elle est automatiquement réessayée
avec le service cloud, et vice-versa.

2. ACTIVATION DU MODE HYBRIDE
----------------------------
Plusieurs façons d'activer le mode hybride:

a) Via l'URL: ajoutez "?hybrid=true" à l'URL de FileChat
   Exemple: http://localhost:8080?hybrid=true

b) Via le script de démarrage:
   Utilisez "demarrer-serveur-local-et-app.bat" qui configure
   automatiquement le mode hybride et démarre les deux services

c) Via l'interface:
   Dans le panneau de débogage, activez le switch "Mode Hybride"

3. DÉPLOIEMENT SUR NETLIFY
--------------------------
Lorsque déployé sur Netlify, FileChat fonctionnera toujours avec
l'IA cloud par défaut, mais les utilisateurs pourront activer le mode
hybride s'ils disposent d'un serveur local sur leur machine.

Cela crée une passerelle entre:
- Le frontend hébergé sur Netlify
- Le backend IA local sur la machine de l'utilisateur

Pour préparer le déploiement: "preparer-pour-netlify.bat"

4. PRÉREQUIS POUR LE MODE HYBRIDE
--------------------------------
- Python 3.9+ avec PyTorch (pour le serveur local)
- OU Ollama installé (https://ollama.ai/download)
- Navigateur récent avec support WebWorkers et SharedArrayBuffer
- Connection internet pour le fallback cloud

=================================================

