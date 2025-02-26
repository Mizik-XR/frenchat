
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
