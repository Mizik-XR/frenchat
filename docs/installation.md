
# Installation et Configuration

## Prérequis

- Node.js 18+ installé
- Un compte Supabase
- Un compte Google Cloud Platform (pour l'intégration Google Drive)

## Installation

1. Cloner le repository :
```bash
git clone <votre-repo>
cd docu-chatter
```

2. Installer les dépendances :
```bash
npm install
```

3. Configuration de l'environnement :

Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## Configuration de Supabase

1. Créez un nouveau projet sur Supabase
2. Dans la section Authentication > Settings :
   - Activez "Enable Email Signup"
   - Configurez les URL de redirection
3. Dans Database, exécutez les migrations SQL fournies

## Configuration de Google Drive

1. Créez un projet sur Google Cloud Console
2. Activez l'API Google Drive
3. Créez des identifiants OAuth 2.0
4. Configurez les URL de redirection autorisées
5. Ajoutez les identifiants dans la configuration Supabase

## Lancement avec start-app.bat

Le script `start-app.bat` automatise le démarrage de l'application :

```batch
@echo off
REM Vérification des prérequis
echo [INFO] Vérification de Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé
    exit /b 1
)

REM Installation des dépendances si nécessaire
if not exist "node_modules\" (
    echo [INFO] Installation des dépendances NPM
    call npm install
)

REM Configuration de l'environnement Python
if not exist "venv\" (
    echo [INFO] Création de l'environnement Python
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
)

REM Démarrage des services
echo [INFO] Démarrage du serveur IA local...
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

echo [INFO] Démarrage de l'application React...
start "Application React" cmd /c "npm run dev"

echo [INFO] Services démarrés:
echo - Serveur IA local: http://localhost:8000
echo - Application React: http://localhost:5173
```

### Détails du script

1. **Vérification des prérequis** : S'assure que Node.js est installé
2. **Installation des dépendances** : Installe les modules NPM si nécessaire
3. **Configuration Python** : Crée et configure l'environnement virtuel Python
4. **Démarrage des services** :
   - Serveur IA local sur le port 8000
   - Application React sur le port 5173

## Guide de démarrage manuel

Si vous ne pouvez pas utiliser `start-app.bat`, suivez ces étapes manuelles :

### 1. Démarrer le serveur IA

```bash
# Créer l'environnement virtuel (première fois uniquement)
python -m venv venv

# Activer l'environnement
# Sur Windows:
venv\Scripts\activate
# Sur macOS/Linux:
source venv/bin/activate

# Installer les dépendances (première fois uniquement)
pip install -r requirements.txt

# Démarrer le serveur
python serve_model.py
```

### 2. Démarrer l'application React

Dans un nouveau terminal :

```bash
npm run dev
```

## Vérification de l'installation

1. Ouvrez votre navigateur à l'adresse http://localhost:5173
2. Vous devriez voir la page d'accueil de FileChat
3. Connectez-vous ou créez un compte
4. Suivez les étapes de l'assistant de configuration
