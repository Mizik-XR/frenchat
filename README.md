
# FileChat - Assistant IA Conversationnel pour Documents

FileChat est une solution d'intelligence artificielle conversationnelle conçue pour l'analyse et l'indexation de documents via une interface de chat intuitive.

## Fonctionnalités

- 🤖 **Chat IA** : Interface style "WhatsApp" pour discuter avec l'IA
- 📁 **Indexation de documents** : Google Drive, Microsoft Teams, et upload manuel
- 🔍 **Recherche contextuelle** : Architecture RAG pour des réponses pertinentes
- 📊 **Visualisation de données** : Génération de graphiques et analyses
- 📃 **Génération de documents** : Création de rapports et documents structurés
- 🔒 **Traitement local** : Option 100% locale pour la confidentialité des données

## Démarrage rapide

### Windows

1. Exécutez `start-app.bat` pour installer les dépendances et démarrer les services
2. Accédez à l'application sur http://localhost:8080

### macOS / Linux

1. Installation du serveur IA :
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python serve_model.py
```

2. Dans un nouveau terminal, démarrez l'application React :
```bash
npm install
npm run dev
```

## Configuration requise

- Node.js 18+
- Python 3.9+
- 4 Go de RAM minimum
- Connexion internet (pour l'installation initiale)

## Déploiement en production

Pour un déploiement en production :

1. Créez le build optimisé :
```bash
npm run build
```

2. Servez les fichiers statiques avec NGINX ou tout autre serveur web
3. Déployez le serveur IA séparément ou utilisez un service cloud

## Contribution

Les contributions sont les bienvenues ! Veuillez consulter notre [guide de contribution](docs/CONTRIBUTING.md) pour plus d'informations.

## Licence

Ce projet est sous licence [MIT](LICENSE).
