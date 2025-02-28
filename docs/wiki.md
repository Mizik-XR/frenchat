
# Documentation FileChat

## Vue d'ensemble

FileChat est une solution d'intelligence artificielle conversationnelle conçue pour l'analyse et l'indexation de documents. Elle permet aux utilisateurs d'interagir avec leurs documents via une interface de chat intuitive, d'indexer des documents provenant de diverses sources (Google Drive, Microsoft Teams, upload manuel), et d'obtenir des réponses intelligentes basées sur le contenu de ces documents grâce à une architecture RAG (Retrieval Augmented Generation).

## Installation locale

### Prérequis
- Node.js 18+ installé
- Python 3.9+ installé
- Git installé
- Compte Supabase (pour l'environnement de développement)
- Projet Google Cloud Platform (pour l'API Google Drive)

### Installation

1. Clonez le dépôt :
```bash
git clone <votre-repo>
cd filechat
```

2. Configuration de l'environnement :
   - Créez un fichier `.env` à la racine du projet avec :
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anonyme
   ```

3. Lancement de l'application :
   - Sur Windows : exécutez `start-app.bat`
   - Sur macOS/Linux : 
     ```bash
     # Terminal 1 - Serveur IA
     python -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     python serve_model.py
     
     # Terminal 2 - Application React
     npm install
     npm run dev
     ```

## Configuration

### Ports utilisés
- **Application React** : http://localhost:5173
- **Serveur IA local** : http://localhost:8000 
- **Supabase local** (si utilisé) : http://localhost:54321

### Configuration OAuth

#### Google Drive
1. Créez un projet dans la [Console Google Cloud](https://console.cloud.google.com)
2. Activez l'API Google Drive
3. Configurez l'écran de consentement OAuth
4. Créez des identifiants OAuth 2.0
5. Configurez les URI de redirection autorisés :
   - `http://localhost:5173/auth/google/callback`
   - `https://votre-domaine.com/auth/google/callback` (production)
6. Ajoutez les identifiants dans Supabase > Storage > Buckets > Configuration

#### Microsoft Teams (si applicable)
1. Inscrivez une application dans le [portail Azure](https://portal.azure.com)
2. Ajoutez les API Microsoft Graph requises
3. Configurez l'authentification et les redirections
4. Stockez les identifiants dans Supabase

## Architecture RAG

### Indexation
1. L'utilisateur autorise l'accès à Google Drive
2. Le système récupère les fichiers/dossiers via l'API
3. Le processus d'indexation analyse les fichiers et crée des embeddings
4. Les métadonnées et embeddings sont stockés dans Supabase

### Embeddings
- Utilisation de transformers.js pour générer des embeddings localement
- Stockage optimisé avec chunking intelligent
- Cache pour éviter la régénération d'embeddings pour fichiers inchangés

### Chat
1. L'utilisateur pose une question
2. Le système recherche les chunks pertinents via les embeddings
3. Le contexte récupéré est envoyé au LLM pour générer une réponse
4. Le suivi de conversation permet de garder le contexte

## Modules critiques

### Authentification
- `AuthProvider.tsx` : Gère l'état d'authentification et les redirections
- `useAuth.tsx` : Hook pour accéder au contexte d'authentification

### Configuration
- `GoogleDriveConfig.tsx` : Interface de connexion à Google Drive
- `MicrosoftTeamsConfig.tsx` : Interface de connexion à Microsoft Teams
- `useGoogleDriveStatus.ts` : Gestion de l'état de connexion Google Drive

### Indexation
- `useGoogleDriveFolders.ts` : Récupération des dossiers Drive
- `useIndexingProgress.ts` : Suivi de la progression d'indexation
- `IndexingProgressBar.tsx` : Affichage visuel de la progression

### Chat
- `Chat.tsx` : Composant principal de l'interface de chat
- `useChatMessages.ts` : Gestion des messages
- `useChatLogic.ts` : Logique du dialogue avec l'IA

### Visualisation de données
- `ChartGenerator.tsx` : Création de graphiques à partir de données CSV
- Supporte plusieurs types de visualisations (barres, camembert, lignes, nuage de points)
- Validation automatique des données d'entrée
- Export des graphiques en format image

## Fonctionnalités principales

### 1. Authentication et gestion utilisateur
- Connexion par email/mot de passe
- Authentification OAuth (Google)
- Gestion des profils utilisateurs
- Gestion des préférences

### 2. Chat IA
- Interface de chat style "WhatsApp"
- Conversations multiples avec historique
- Possibilité de répondre à des messages spécifiques
- Organisation en dossiers
- Épinglage et archivage de conversations
- Génération de réponses IA basées sur les documents

### 3. Intégration et indexation de documents
- Google Drive : connexion, indexation, suivi de progression
- Microsoft Teams : intégration, indexation
- Upload manuel : divers formats supportés
- Prévisualisation des documents

### 4. Moteur d'intelligence artificielle
- Modèle par défaut : Hugging Face Transformers (local ou cloud)
- Support pour d'autres fournisseurs d'IA (optionnel)
- Configuration paramétrable (température, longueur, etc.)

### 5. Visualisation de données
- Génération de graphiques à partir de données CSV
- Support pour différents types de visualisations :
  - Histogrammes
  - Camemberts
  - Courbes
  - Nuages de points
- Personnalisation des axes et des paramètres
- Validation automatique des données entrantes
- Export des graphiques en format image

### 6. Génération et export de documents
- Templates préformatés
- Génération IA à partir de documents existants
- Prévisualisation et modification
- Export vers Google Drive ou Teams

## Points forts pour les clients

1. **Valorisation de la base documentaire**
   - Exploitation intelligente des documents existants
   - Recherche contextuelle rapide
   - Synthèse automatique d'informations

2. **Gain de temps**
   - Réponses immédiates aux questions
   - Génération automatisée de rapports
   - Visualisation instantanée des données numériques

3. **Souveraineté des données**
   - Option de traitement 100% local
   - Contrôle total sur la confidentialité
   - Indépendance des API externes payantes

4. **Interface intuitive**
   - Navigation familière style "WhatsApp"
   - Organisation personnalisable
   - Expérience utilisateur fluide

5. **Visualisation de données**
   - Analyse graphique instantanée des fichiers CSV
   - Multiples types de visualisations
   - Validation et correction automatique des données

## Bonnes pratiques

### Éviter les régressions
- Ne pas supprimer de composants existants
- Ne pas modifier la logique d'authentification sans tests approfondis
- Préserver les routes et tables Supabase existantes

### Mini-tâches
- Diviser les changements en petites tâches isolées
- Tester chaque modification avant de passer à la suivante
- Documenter les changements effectués

### Tests
- Vérifier l'authentification complète
- Tester l'indexation et le suivi de progression
- Vérifier le chat et la génération de réponses
- Tester l'export de documents et la génération de graphiques

## Edge Functions Supabase

### google-oauth
- Gère l'authentification OAuth avec Google
- Récupère et rafraîchit les tokens d'accès

### batch-index-google-drive
- Indexe récursivement les dossiers Google Drive
- Traite les fichiers par lots pour éviter les limitations d'API

### rag-generation
- Génère des réponses basées sur le contexte récupéré
- Utilise les embeddings pour trouver les informations pertinentes

### upload-chat-file
- Traite les fichiers uploadés directement dans le chat
- Génère des embeddings et les stocke dans la base de données

### upload-to-google-drive
- Permet d'uploader des fichiers vers Google Drive
- Intégration avec le chat pour partager des fichiers

## Technologies d'indexation et RAG

Le système utilise une approche sophistiquée pour l'indexation et la génération de réponses :

1. **Découpage (Chunking)** : Les documents sont divisés en segments logiques
2. **Embedding** : Transformation en vecteurs via des modèles comme BERT/Transformers
3. **Indexation** : Stockage dans une base vectorielle permettant la recherche sémantique
4. **Retrieval** : Recherche des chunks les plus pertinents pour une question
5. **Augmentation** : Enrichissement du prompt avec le contexte récupéré
6. **Generation** : Création d'une réponse cohérente et précise par l'IA

## Gestion des ressources

### Logo et interface visuelle
- Logo animé (GIF) pour une expérience visuelle attrayante
- Gestion intelligente des ressources avec fallback automatique
- Support pour différents environnements (dev/prod)
- Chargement adaptatif selon le contexte de déploiement

## Maintenance et support

### Déploiement
- Utilisation de Docker pour la containerisation
- Script de déploiement automatisé
- Configuration NGINX pour le serveur web

### Monitoring
- Suivi des performances via le tableau de bord de monitoring
- Alertes en cas de problèmes d'indexation ou de génération
- Logs détaillés pour le débogage

### Mises à jour
- Processus de mise à jour documenté
- Tests de non-régression automatisés
- Sauvegarde des données avant mise à jour majeure

