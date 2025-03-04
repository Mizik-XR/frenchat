
# Présentation générale de Frenchat

## Objectif du projet

Frenchat est une solution de chat intelligent (RAG - Retrieval Augmented Generation) conçue pour:

- **Indexer et analyser en temps réel** les documents provenant de Google Drive et Microsoft Teams
- **Générer et prévisualiser** des documents structurés (dossiers de subvention, business plans, etc.)
- **Exporter** ces documents directement vers Google Drive ou Teams
- Permettre une navigation type "WhatsApp" pour gérer les multiples sujets abordés avec l'IA

## Principales fonctionnalités

### 1. Interface conversationnelle

- Chat IA fluide et intuitif
- Mode de discussion threaded (avec réponses à des messages spécifiques)
- Organisation des conversations par dossiers
- Épinglage et archivage des conversations importantes

### 2. Sources de données

- **Google Drive** : indexation complète ou sélective des dossiers et fichiers
- **Microsoft Teams** : indexation des conversations et documents partagés
- **Upload manuel** : téléversement direct de fichiers
- Suivi en temps réel de la progression d'indexation

### 3. Intelligence artificielle

- Modèle par défaut : Hugging Face Transformers (local ou cloud)
- Possibilité d'ajouter d'autres clés API (OpenAI, Claude, Perplexity, etc.)
- Analyse contextuelle des documents indexés
- Génération de réponses précises basées sur les documents

### 4. Création et export de documents

- Templates préformatés (business plan, demande de subvention, etc.)
- Génération IA à partir de vos documents existants
- Prévisualisation et modification avant export
- Export direct vers Google Drive ou Microsoft Teams

### 5. Sécurité

- Authentification sécurisée
- Consentement explicite avant indexation
- Données chiffrées en transit et au repos
- Contrôles d'accès granulaires via Row-Level Security (RLS)

## Technologies principales

- **Frontend** : React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Supabase (base de données, authentification, stockage)
- **IA** : Hugging Face Transformers, OpenAI API (optionnel)
- **Indexation** : Edge Functions, Embeddings vectoriels

## Public cible

Frenchat s'adresse principalement aux équipes et entreprises souhaitant:

- Valoriser leur base documentaire existante
- Accélérer la recherche d'informations dans des documents volumineux
- Automatiser la création de documents structurés
- Mettre en place une solution d'IA conversationnelle privée et sécurisée
